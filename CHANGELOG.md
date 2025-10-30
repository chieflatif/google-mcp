# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-30

### Added
- **Google Sheets support** (5 tools)
  - `sheets_create` - Create new spreadsheets
  - `sheets_read` - Read spreadsheet data
  - `sheets_append` - Append rows to sheets
  - `sheets_update` - Update specific cells
  - `sheets_search` - Find spreadsheets by name

- **Google Docs support** (4 tools)
  - `docs_create` - Create new documents
  - `docs_read` - Read document content
  - `docs_update` - Add/edit text in documents
  - `docs_search` - Find documents by name

- **Google Drive support** (6 tools)
  - `drive_list` - List files in folders
  - `drive_search` - Search for files
  - `drive_download` - Download files (text/binary, max 10MB)
  - `drive_upload` - Upload files from path/content/base64
  - `drive_share` - Share files with users
  - `drive_create_folder` - Create folders

- **Production-grade error handling**
  - Comprehensive try/catch wrappers on all handlers
  - Standardized error responses with retry hints
  - Automatic retry with exponential backoff (3 attempts)
  - Input validation for all parameters
  - Query sanitization to prevent injection attacks

- **Security features**
  - File size limits (10MB max for downloads)
  - Input validation on all tools
  - Query sanitization for search operations
  - Binary file support with base64 encoding
  - MIME type detection and validation

- **Documentation**
  - Comprehensive README (242 lines)
  - Production deployment guide (302 lines)
  - Error code documentation
  - Security best practices
  - Troubleshooting guide

### Changed
- OAuth scope alignment across all handlers
- CORE mode now includes all read/write tools (24 tools)
- Updated from `mcp-google-otter` to `google-mcp` naming

### Fixed
- OAuth scope mismatch (drive.readonly → drive)
- Missing dependencies in package.json
- Binary file download support
- TypeScript compilation errors

## [0.1.0] - 2025-10-30

### Added
- **Gmail support** (7 tools)
  - `gmail_search` - Search emails with advanced queries
  - `gmail_send` - Send emails with attachments (dry-run by default)
  - `gmail_reply_latest` - Reply to most recent thread
  - `gmail_create_draft` - Create email drafts
  - `gmail_get_thread` - Get full thread conversation
  - `gmail_label_threads` - Apply/remove labels
  - `gmail_search_unread_from` - Find unread from sender/domain

- **Google Calendar support** (6 tools)
  - `calendar_get_agenda` - Get upcoming events
  - `calendar_create_meeting` - Create calendar events with Google Meet
  - `calendar_quick_add` - Natural language event creation
  - `calendar_reschedule_event` - Move events to new times
  - `calendar_delete_event` - Delete calendar events
  - `calendar_find_slots` - Find available time slots

- **OAuth 2.0 authentication**
  - Multi-service token management
  - Automatic token refresh
  - Secure local token storage (~/.mcp-google/tokens.json)

- **MCP protocol implementation**
  - stdio transport for local clients
  - Tool-based interface
  - JSON-RPC 2.0 protocol
  - Health check endpoint

### Initial Release Features
- Clean TypeScript implementation
- Comprehensive error handling
- Production-ready architecture
- MIT licensed open source

