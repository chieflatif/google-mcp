import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const gmailTools: Tool[] = [
  {
    name: 'gmail_search',
    description: 'Search Gmail for emails matching a query',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Gmail search query (e.g., "from:john@example.com subject:proposal")'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum results to return (default: 10)',
          default: 10
        }
      },
      required: ['query']
    }
  },
  {
    name: 'gmail_reply_latest',
    description: 'Reply to the most recent thread from a contact (reply-all optional)',
    inputSchema: {
      type: 'object',
      properties: {
        fromQuery: { type: 'string', description: 'Email or query to find latest thread' },
        body: { type: 'string' },
        replyAll: { type: 'boolean', default: true },
        dryRun: { type: 'boolean', default: true }
      },
      required: ['fromQuery', 'body']
    }
  },
  {
    name: 'gmail_label_threads',
    description: 'Apply or remove labels on matching threads',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        addLabels: { type: 'array', items: { type: 'string' } },
        removeLabels: { type: 'array', items: { type: 'string' } }
      },
      required: ['query']
    }
  },
  {
    name: 'gmail_search_unread_from',
    description: 'Find unread messages from a sender or domain',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'email or domain' },
        maxResults: { type: 'number', default: 10 }
      },
      required: ['from']
    }
  },
  {
    name: 'gmail_send',
    description: 'Send an email (with dry-run by default for safety)',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'array',
          items: { type: 'string' },
          description: 'Recipient email addresses'
        },
        cc: {
          type: 'array',
          items: { type: 'string' },
          description: 'CC recipients'
        },
        bcc: {
          type: 'array',
          items: { type: 'string' },
          description: 'BCC recipients'
        },
        subject: {
          type: 'string',
          description: 'Email subject'
        },
        body: {
          type: 'string',
          description: 'Email body (plain text or HTML)'
        },
        htmlBody: {
          type: 'string',
          description: 'Optional HTML version of the email body'
        },
        attachments: {
          type: 'array',
          description: 'Attachments to include (by path or base64 content)'
          , items: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Absolute or project-relative file path' },
              filename: { type: 'string', description: 'Filename to show in email' },
              contentBase64: { type: 'string', description: 'Raw base64 content if not using path' },
              contentType: { type: 'string', description: 'MIME type (e.g. application/pdf)' }
            }
          }
        },
        replyToThreadId: {
          type: 'string',
          description: 'Thread ID to reply to (maintains conversation)'
        },
        dryRun: {
          type: 'boolean',
          description: 'If true, validate but don\'t send (default: true)',
          default: true
        }
      },
      required: ['to', 'subject', 'body']
    }
  },
  {
    name: 'gmail_get_thread',
    description: 'Get all messages in a Gmail thread',
    inputSchema: {
      type: 'object',
      properties: {
        threadId: {
          type: 'string',
          description: 'Gmail thread ID'
        }
      },
      required: ['threadId']
    }
  },
  {
    name: 'gmail_create_draft',
    description: 'Create a Gmail draft (never sends by itself)',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'array', items: { type: 'string' } },
        cc: { type: 'array', items: { type: 'string' } },
        bcc: { type: 'array', items: { type: 'string' } },
        subject: { type: 'string' },
        body: { type: 'string' },
        htmlBody: { type: 'string' },
        attachments: {
          type: 'array', items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              filename: { type: 'string' },
              contentBase64: { type: 'string' },
              contentType: { type: 'string' }
            }
          }
        }
      },
      required: ['to', 'subject', 'body']
    }
  }
];
