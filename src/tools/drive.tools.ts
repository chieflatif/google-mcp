import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const driveTools: Tool[] = [
  {
    name: 'drive_list',
    description: 'List files in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: { 
          type: 'string', 
          description: 'Folder ID (empty = root)', 
          default: 'root' 
        },
        limit: { 
          type: 'number', 
          default: 20 
        }
      }
    }
  },
  {
    name: 'drive_search',
    description: 'Search for files in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          description: 'Search query' 
        },
        limit: { 
          type: 'number', 
          default: 20 
        }
      },
      required: ['query']
    }
  },
  {
    name: 'drive_download',
    description: 'Download a file from Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { 
          type: 'string', 
          description: 'File ID from URL' 
        }
      },
      required: ['fileId']
    }
  },
  {
    name: 'drive_upload',
    description: 'Upload a file to Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        mimeType: { type: 'string' },
        content: { 
          type: 'string', 
          description: 'File content or path' 
        },
        folderId: { 
          type: 'string', 
          default: 'root' 
        }
      },
      required: ['fileName', 'content']
    }
  },
  {
    name: 'drive_share',
    description: 'Share a Drive file with someone',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string' },
        email: { 
          type: 'string', 
          description: 'Email to share with' 
        },
        role: { 
          type: 'string', 
          enum: ['reader', 'writer', 'commenter'], 
          default: 'reader' 
        }
      },
      required: ['fileId', 'email']
    }
  },
  {
    name: 'drive_create_folder',
    description: 'Create a folder in Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        name: { 
          type: 'string', 
          description: 'Folder name' 
        },
        parentId: { 
          type: 'string', 
          description: 'Parent folder ID', 
          default: 'root' 
        }
      },
      required: ['name']
    }
  }
];

