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

// Only import basic tools first
import { gmailTools } from './tools/gmail.tools.js';
import { calendarTools } from './tools/calendar.tools.js';

// Initialize server
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

// Only include Gmail search and Calendar agenda (no OAuth calls)
const safeTools = [
  gmailTools[0], // gmail_search
  calendarTools[calendarTools.findIndex(t => t.name === 'calendar_get_agenda')] // calendar_get_agenda
].filter(Boolean);

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: safeTools
}));

// Handle tools/call - return mock data only
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  try {
    let result: any;

    switch (name) {
      case 'gmail_search':
        result = { status: 'mock', message: 'Gmail search would work here', count: 0, threads: [] };
        break;
      case 'calendar_get_agenda':
        result = { status: 'mock', message: 'Calendar agenda would work here', count: 0, events: [] };
        break;
      default:
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
