import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const docsTools: Tool[] = [
  {
    name: 'docs_create',
    description: 'Create a new Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          description: 'Document title' 
        },
        content: { 
          type: 'string', 
          description: 'Initial content (optional)' 
        }
      },
      required: ['title']
    }
  },
  {
    name: 'docs_read',
    description: 'Read content from a Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: { 
          type: 'string', 
          description: 'Document ID from URL' 
        }
      },
      required: ['documentId']
    }
  },
  {
    name: 'docs_update',
    description: 'Update/edit text in a Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        text: { 
          type: 'string', 
          description: 'Text to add/replace' 
        },
        index: { 
          type: 'number', 
          description: 'Position to insert (1 = start)', 
          default: 1 
        }
      },
      required: ['documentId', 'text']
    }
  },
  {
    name: 'docs_search',
    description: 'Search for Google Docs by name',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        limit: { 
          type: 'number', 
          default: 10 
        }
      },
      required: ['query']
    }
  }
];

