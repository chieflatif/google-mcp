# Google MCP Server

Production-grade MCP server for complete Google Workspace integration with Gmail, Calendar, Sheets, Docs, and Drive.

## Features

- **28 Tools** for comprehensive Google Workspace access
- **Production-grade error handling** with automatic retries
- **Binary file support** for Drive operations
- **Rate limit handling** with exponential backoff
- **Input validation** and query sanitization
- **OAuth 2.0** with automatic token refresh

## Supported Services

### Gmail (7 tools)
- `gmail_search` - Search emails with advanced queries
- `gmail_send` - Send emails with attachments (dry-run by default)
- `gmail_reply_latest` - Reply to most recent thread
- `gmail_create_draft` - Create email drafts
- `gmail_get_thread` - Get full thread conversation
- `gmail_label_threads` - Apply/remove labels
- `gmail_search_unread_from` - Find unread from sender/domain

### Calendar (6 tools)
- `calendar_get_agenda` - Get upcoming events
- `calendar_create_meeting` - Create calendar events with Google Meet
- `calendar_quick_add` - Natural language event creation
- `calendar_reschedule_event` - Move events to new times
- `calendar_delete_event` - Delete calendar events
- `calendar_find_slots` - Find available time slots

### Sheets (5 tools)
- `sheets_create` - Create new spreadsheets
- `sheets_read` - Read spreadsheet data
- `sheets_append` - Append rows to sheets
- `sheets_update` - Update specific cells
- `sheets_search` - Find spreadsheets by name

### Docs (4 tools)
- `docs_create` - Create new documents
- `docs_read` - Read document content
- `docs_update` - Add/edit text in documents
- `docs_search` - Find documents by name

### Drive (6 tools)
- `drive_list` - List files in folders
- `drive_search` - Search all files
- `drive_download` - Download files (text/binary, max 10MB)
- `drive_upload` - Upload files from path/content/base64
- `drive_share` - Share files with users
- `drive_create_folder` - Create folders

## Installation

### Prerequisites

- Node.js >= 20.0.0
- Google Cloud Project with APIs enabled:
  - Gmail API
  - Google Calendar API
  - Google Sheets API
  - Google Docs API
  - Google Drive API

### Setup

1. **Clone and install:**
```bash
git clone https://github.com/yourusername/google-mcp.git
cd google-mcp
npm install
```

2. **Configure OAuth credentials:**

Create a Google Cloud OAuth 2.0 client:
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create project and enable required APIs
- Create OAuth 2.0 credentials (Desktop app)
- Set authorized redirect URI: `http://localhost:3333/callback`

3. **Authenticate:**
```bash
GOOGLE_CLIENT_ID="your-client-id" \
GOOGLE_CLIENT_SECRET="your-client-secret" \
node scripts/setup-oauth.js
```

Follow the browser prompt to grant permissions. Tokens are saved to `~/.mcp-google/tokens.json`.

4. **Build:**
```bash
npm run build
```

## Usage with Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/google-mcp/dist/index.js"
      ],
      "env": {
        "MCP_CORE_TOOLS": "1",
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Restart Cursor and start using Google Workspace via natural language:
- "Read my Master Task List spreadsheet"
- "Create a client doc for Acme Inc"
- "Search my Drive for Q4 planning documents"
- "What's on my calendar today?"

## Configuration Modes

### CORE Mode (Recommended)
```json
"MCP_CORE_TOOLS": "1"
```
24 essential tools for full read/write access to all services

### Full Mode (All tools)
```json
// Remove MCP_CORE_TOOLS or set to "0"
```
28 tools including advanced calendar features

### Minimal Mode (Fastest)
```json
"MCP_MINIMAL_TOOLS": "1"
```
5 tools for basic read operations only

## Error Handling

All tools return standardized error responses:

```typescript
{
  status: 'error',
  error: 'Human-readable message',
  code: 'ERROR_CODE',
  retryable: boolean,
  details: {...}
}
```

### Error Codes

- `RATE_LIMIT_EXCEEDED` - Retry after a few moments (auto-retried 3x)
- `AUTH_FAILED` - Re-authenticate with Google
- `NOT_FOUND` - Invalid resource ID
- `INVALID_REQUEST` - Check parameters
- `SERVER_ERROR` - Google server issue (auto-retried)
- `FILE_TOO_LARGE` - File exceeds 10MB limit

## Security Features

- ✅ Input validation on all parameters
- ✅ Query sanitization to prevent injection
- ✅ OAuth scopes limited to required permissions
- ✅ Tokens stored locally with automatic refresh
- ✅ Dry-run mode for destructive operations
- ✅ File size limits to prevent memory issues

## Troubleshooting

### Authentication Errors

```bash
# Re-run OAuth setup
GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." \
node scripts/setup-oauth.js
```

### Rate Limit Errors

The server automatically retries with exponential backoff. If persistent:
- Wait 60 seconds between requests
- Check [Google Workspace quotas](https://developers.google.com/workspace/quotas)

### Binary File Download Issues

Files >10MB will return `FILE_TOO_LARGE` error. For large files:
- Use Google Drive web interface
- Or split into smaller chunks

## Development

```bash
# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Test authentication
npm run test:auth
```

## API Limits

Google Workspace API quotas (per project):
- Gmail: 2,500 quota units/day
- Calendar: 1,000,000 requests/day
- Sheets: 300 requests/minute
- Docs: 300 requests/minute
- Drive: 12,000 requests/minute

The server implements automatic retry with exponential backoff for rate limits.

## License

MIT

## Contributing

Issues and PRs welcome! This is production-grade software intended for public use.

## Support

- [Google Workspace API Docs](https://developers.google.com/workspace)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- File issues on GitHub

---

**Status:** Production Ready  
**Version:** 0.2.0  
**Last Updated:** 2025-10-30

