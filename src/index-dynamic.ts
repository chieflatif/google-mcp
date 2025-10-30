#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

// Dynamic imports - no heavy dependencies loaded at startup
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

// Tool definitions (lightweight - no imports)
const allTools = [
  { name: 'gmail_search', description: 'Search Gmail for emails matching a query', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'gmail_send', description: 'Send an email (with dry-run by default for safety)', inputSchema: { type: 'object', properties: { to: { type: 'array', items: { type: 'string' } }, subject: { type: 'string' }, body: { type: 'string' }, dryRun: { type: 'boolean', default: true } }, required: ['to', 'subject', 'body'] } },
  { name: 'calendar_get_agenda', description: 'Get upcoming calendar events', inputSchema: { type: 'object', properties: { days: { type: 'number', default: 1 } } } },
  { name: 'calendar_create_meeting', description: 'Create a calendar event/meeting', inputSchema: { type: 'object', properties: { title: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' }, attendees: { type: 'array', items: { type: 'string' } } }, required: ['title', 'start', 'end'] } }
];

// Handle tools/list - instant response
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools
}));

// Handle tools/call - dynamic import only when needed
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    // Route to appropriate handler WITH DYNAMIC IMPORTS
    if (name.startsWith('gmail_')) {
      // Only import Gmail handler when Gmail tool is actually called
      const { handleGmailTool } = await import('./handlers/gmail.handler.js');
      result = await handleGmailTool(name, args);
    } else if (name.startsWith('calendar_')) {
      // Only import Calendar handler when Calendar tool is actually called  
      const { handleCalendarTool } = await import('./handlers/calendar.handler.js');
      result = await handleCalendarTool(name, args);
    } else if (name.startsWith('otter_')) {
      const { handleOtterTool } = await import('./handlers/otter.handler.js');
      result = await handleOtterTool(name, args);
    } else if (name.startsWith('workflow_')) {
      const { handleWorkflowTool } = await import('./handlers/workflow.handler.js');
      result = await handleWorkflowTool(name, args);
    } else {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        } as const
      ]
    };
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.exit(1);
});

