#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
// Import ONLY Gmail and Calendar tools
import { gmailTools } from './tools/gmail.tools.js';
import { calendarTools } from './tools/calendar.tools.js';
// Import ONLY Gmail and Calendar handlers
import { handleGmailTool } from './handlers/gmail.handler.js';
import { handleCalendarTool } from './handlers/calendar.handler.js';
// Initialize server
const server = new Server({
    name: 'mcp-google-clean',
    version: '0.2.0',
}, {
    capabilities: {
        tools: {},
    },
});
// ONLY Gmail and Calendar tools (no Otter, no workflows)
const allTools = [
    ...gmailTools,
    ...calendarTools
];
// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools
}));
// Handle tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        let result;
        // Route to appropriate handler
        if (name.startsWith('gmail_')) {
            result = await handleGmailTool(name, args);
        }
        else if (name.startsWith('calendar_')) {
            result = await handleCalendarTool(name, args);
        }
        else {
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    catch (error) {
        // Better error handling - don't crash on auth errors
        if (error instanceof McpError) {
            throw error;
        }
        // Log but don't crash
        console.error(`Tool execution error [${name}]:`, error.message);
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
    }
});
// Start server with error recovery
async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('✅ MCP Google Clean server running');
    }
    catch (error) {
        console.error('❌ Server failed to start:', error.message);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
});
//# sourceMappingURL=index-clean.js.map