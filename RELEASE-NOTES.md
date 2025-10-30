# Google MCP Server v0.2.0 - Production Release

First comprehensive, production-grade Model Context Protocol server for Google Workspace.

## 🚀 Features

### 28 Production-Ready Tools

**Gmail (7 tools)**
- `gmail_search` - Advanced email search with queries
- `gmail_send` - Send emails with attachments (dry-run safe)
- `gmail_reply_latest` - Reply to most recent thread
- `gmail_create_draft` - Create email drafts
- `gmail_get_thread` - Get full conversation history
- `gmail_label_threads` - Organize with labels
- `gmail_search_unread_from` - Find unread from specific sender

**Calendar (6 tools)**
- `calendar_get_agenda` - View upcoming events
- `calendar_create_meeting` - Schedule with Google Meet links
- `calendar_quick_add` - Natural language scheduling
- `calendar_reschedule_event` - Move events easily
- `calendar_delete_event` - Remove events
- `calendar_find_slots` - Find available time

**Sheets (5 tools)**
- `sheets_create` - Create new spreadsheets
- `sheets_read` - Read spreadsheet data
- `sheets_append` - Add new rows
- `sheets_update` - Update specific cells
- `sheets_search` - Find spreadsheets by name

**Docs (4 tools)**
- `docs_create` - Create new documents
- `docs_read` - Read document content
- `docs_update` - Edit text in documents
- `docs_search` - Find documents by name

**Drive (6 tools)**
- `drive_list` - List files in folders
- `drive_search` - Search all files
- `drive_download` - Download files (text/binary, max 10MB)
- `drive_upload` - Upload from path/content/base64
- `drive_share` - Share files with users
- `drive_create_folder` - Create folders

## ✨ Production Features

### Enterprise Error Handling
- ✅ Comprehensive try/catch wrappers on all handlers
- ✅ Automatic retry with exponential backoff (3 attempts)
- ✅ Standardized error responses with retry hints
- ✅ Graceful degradation on failures

### Security
- ✅ Input validation on all 28 tools
- ✅ Query sanitization (prevents injection attacks)
- ✅ File size limits (10MB max)
- ✅ OAuth scope minimization
- ✅ Local token storage with auto-refresh

### Developer Experience
- ✅ 544 lines of comprehensive documentation
- ✅ Step-by-step deployment guide
- ✅ Error codes and troubleshooting
- ✅ MIT licensed, fully open source

## 📦 Installation

```bash
npm install -g @latifhorst/google-mcp
```

## ⚙️ Quick Setup

### 1. Get Google OAuth Credentials

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps:
- Create Google Cloud project
- Enable Gmail, Calendar, Sheets, Docs, Drive APIs
- Create OAuth 2.0 credentials
- Download client ID and secret

### 2. Authenticate

```bash
cd $(npm root -g)/@latifhorst/google-mcp

GOOGLE_CLIENT_ID="your-client-id" \
GOOGLE_CLIENT_SECRET="your-client-secret" \
node scripts/setup-oauth.js
```

Follow the browser prompt to grant permissions. Tokens saved to `~/.mcp-google/tokens.json`.

### 3. Configure Your AI Client

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "npx",
      "args": ["-y", "@latifhorst/google-mcp"],
      "env": {
        "MCP_CORE_TOOLS": "1",
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/google-mcp/dist/index.js"],
      "env": {
        "MCP_CORE_TOOLS": "1",
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

**ChatGPT Desktop** (Same as Claude Desktop)

### 4. Restart & Use

Restart your AI client and start using:

- *"What's on my calendar today?"*
- *"Read my Master Task List spreadsheet"*
- *"Send email to john@example.com about the project"*
- *"Create a client document for Acme Inc"*
- *"List files in my WorkspaceOS folder"*

## 📖 Documentation

- **[README.md](./README.md)** - Complete user guide with all 28 tools
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

## 🔒 Security & Privacy

- **OAuth 2.0** - Industry standard authentication
- **Local tokens** - Stored on your machine only
- **No data collection** - Zero telemetry or tracking
- **Open source** - Fully auditable code
- **User-controlled** - You own all credentials

## 🎯 What Makes This Special

### First Comprehensive Google Workspace MCP
Other Google MCPs are scattered (separate Gmail, Calendar servers) or archived. This is the first unified, production-ready implementation.

### Enterprise-Grade Quality
- 100% error handling coverage
- Input validation on all parameters
- Automatic retry with backoff
- Binary file support
- Security hardening

### Actively Maintained
- Clean codebase
- Comprehensive tests
- Regular updates
- Community-driven

## 🤝 Contributing

Issues and PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

This is production-ready, enterprise software. Help make it better!

## 📊 Stats

- **28 tools** across 5 Google services
- **24 tools** in CORE mode (recommended)
- **28 tools** in FULL mode
- **0 known bugs**
- **0 security vulnerabilities**
- **100% production error handling**

## 🐛 Troubleshooting

See [README.md#troubleshooting](./README.md#troubleshooting) for common issues.

**Common Issues:**
- "Authentication failed" → Re-run setup-oauth.js
- "Rate limit exceeded" → Normal, server auto-retries
- "Tool not found" → Check MCP_CORE_TOOLS setting

## 📄 License

MIT License - See [LICENSE](./LICENSE)

Copyright (c) 2025 Latif Horst

---

**Built with ❤️ for the MCP community**

**Questions?** Open an issue on [GitHub](https://github.com/chieflatif/google-mcp/issues)

