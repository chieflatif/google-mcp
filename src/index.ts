#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
  TextContentSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// Import tools
import { gmailTools } from './tools/gmail.tools.js';
import { calendarTools } from './tools/calendar.tools.js';
import { sheetsTools } from './tools/sheets.tools.js';
import { docsTools } from './tools/docs.tools.js';
import { driveTools } from './tools/drive.tools.js';

// Import tool handlers
import { handleGmailTool } from './handlers/gmail.handler.js';
import { handleCalendarTool } from './handlers/calendar.handler.js';
import { handleSheetsTool } from './handlers/sheets.handler.js';
import { handleDocsTool } from './handlers/docs.handler.js';
import { handleDriveTool } from './handlers/drive.handler.js';

// Initialize server
const server = new Server(
  {
    name: 'google-mcp',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Build tool list with optional safe/minimal modes to reduce payload size
const SAFE_MODE = process.env.MCP_SAFE_MODE === '1';
const MINIMAL_MODE = process.env.MCP_MINIMAL_TOOLS === '1';
const CORE_MODE = process.env.MCP_CORE_TOOLS === '1';

const fullTools = [
  ...gmailTools,
  ...calendarTools,
  ...sheetsTools,
  ...docsTools,
  ...driveTools
];

const minimalSubsetNames = new Set([
  'gmail_search',
  'calendar_get_agenda',
  'sheets_read',
  'docs_read',
  'drive_search'
]);

const minimalTools = fullTools.filter(t => minimalSubsetNames.has(t.name));

// Core mode: Gmail + Calendar + Sheets + Docs + Drive essentials (full read/write)
const coreSubsetNames = new Set([
  'gmail_search',
  'gmail_send',
  'gmail_label_threads',
  'gmail_get_thread',
  'gmail_create_draft',
  'gmail_search_unread_from',
  'gmail_reply_latest',
  'calendar_get_agenda',
  'calendar_create_meeting',
  'sheets_read',
  'sheets_create',
  'sheets_append',
  'sheets_update',
  'sheets_search',
  'docs_read',
  'docs_create',
  'docs_update',
  'docs_search',
  'drive_search',
  'drive_list',
  'drive_download',
  'drive_upload',
  'drive_share',
  'drive_create_folder'
]);
const coreTools = fullTools.filter(t => coreSubsetNames.has(t.name));

const healthTool: Tool = {
  name: 'health_ping',
  description: 'Lightweight server health check',
  inputSchema: { type: 'object', properties: {} }
};

const allTools = SAFE_MODE ? [healthTool] : (MINIMAL_MODE ? minimalTools : (CORE_MODE ? coreTools : fullTools));

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools
}));

// Handle tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    // Route to appropriate handler
    if (name.startsWith('gmail_')) {
      result = await handleGmailTool(name, args);
    } else if (name.startsWith('calendar_')) {
      result = await handleCalendarTool(name, args);
    } else if (name.startsWith('sheets_')) {
      result = await handleSheetsTool(name, args);
    } else if (name.startsWith('docs_')) {
      result = await handleDocsTool(name, args);
    } else if (name.startsWith('drive_')) {
      result = await handleDriveTool(name, args);
    } else if (name === 'health_ping') {
      result = { status: 'ok' };
    } else {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
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
  // Don't log to stderr in production - it can break MCP clients
  // console.error('MCP Google-Otter server running on stdio');
}

main().catch((error) => {
  // Avoid writing to stderr; exit silently to prevent MCP client parse issues
  process.exit(1);
});
