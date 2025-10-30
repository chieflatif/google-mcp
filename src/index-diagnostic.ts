#!/usr/bin/env node
import 'dotenv/config';

// Diagnostic logging to find what breaks Cursor
const originalConsoleError = console.error;
console.error = (...args) => {
  // Log to file instead of stderr to avoid breaking MCP
  require('fs').appendFileSync('/tmp/mcp-debug.log', `[STDERR] ${args.join(' ')}\n`);
};

try {
  const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
  const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError
  } = await import('@modelcontextprotocol/sdk/types.js');

  // Log startup
  require('fs').appendFileSync('/tmp/mcp-debug.log', `[STARTUP] MCP imports loaded\n`);

  const server = new Server(
    {
      name: 'mcp-google-otter',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  require('fs').appendFileSync('/tmp/mcp-debug.log', `[STARTUP] Server created\n`);

  // Lightweight tool definitions (no heavy imports)
  const tools = [
    { name: 'gmail_search', description: 'Search Gmail', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    { name: 'calendar_get_agenda', description: 'Get calendar', inputSchema: { type: 'object', properties: { days: { type: 'number', default: 1 } } } }
  ];

  // Handle tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    require('fs').appendFileSync('/tmp/mcp-debug.log', `[TOOLS] List request received\n`);
    return { tools };
  });

  // Handle tools/call with dynamic imports
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    require('fs').appendFileSync('/tmp/mcp-debug.log', `[CALL] Tool ${name} called\n`);

    try {
      let result: any;

      if (name.startsWith('gmail_')) {
        require('fs').appendFileSync('/tmp/mcp-debug.log', `[CALL] Loading Gmail handler...\n`);
        const { handleGmailTool } = await import('./handlers/gmail.handler.js');
        require('fs').appendFileSync('/tmp/mcp-debug.log', `[CALL] Gmail handler loaded\n`);
        result = await handleGmailTool(name, args);
        require('fs').appendFileSync('/tmp/mcp-debug.log', `[CALL] Gmail handler completed\n`);
      } else if (name.startsWith('calendar_')) {
        require('fs').appendFileSync('/tmp/mcp-debug.log', `[CALL] Loading Calendar handler...\n`);
        const { handleCalendarTool } = await import('./handlers/calendar.handler.js');
        require('fs').appendFileSync('/tmp/mcp-debug.log', `[CALL] Calendar handler loaded\n`);
        result = await handleCalendarTool(name, args);
        require('fs').appendFileSync('/tmp/mcp-debug.log', `[CALL] Calendar handler completed\n`);
      } else {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error: any) {
      require('fs').appendFileSync('/tmp/mcp-debug.log', `[ERROR] ${error.message}\n`);
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
    }
  });

  require('fs').appendFileSync('/tmp/mcp-debug.log', `[STARTUP] Handlers registered\n`);

  // Start server
  const transport = new StdioServerTransport();
  require('fs').appendFileSync('/tmp/mcp-debug.log', `[STARTUP] Transport created\n`);
  
  await server.connect(transport);
  require('fs').appendFileSync('/tmp/mcp-debug.log', `[STARTUP] Server connected and ready\n`);

} catch (error) {
  require('fs').appendFileSync('/tmp/mcp-debug.log', `[FATAL] ${error.message}\n${error.stack}\n`);
  process.exit(1);
}

