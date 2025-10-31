# ChatGPT Desktop Setup Guide

Complete guide for using Google MCP Server with ChatGPT Desktop.

---

## Prerequisites

- **ChatGPT Desktop** installed (download from [OpenAI](https://openai.com/chatgpt/desktop/))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **Google account**

---

## Step 1: Install Google MCP Server

```bash
npm install -g @chieflatif/google-mcp
```

---

## Step 2: Create Google Cloud OAuth Credentials

### 2.1 Create Project (1 minute)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "New Project"
3. Name: "ChatGPT Google MCP"
4. Click "Create"

### 2.2 Enable APIs (2 minutes)

Enable these 5 APIs:
1. [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
2. [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
3. [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
4. [Google Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com)
5. [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)

### 2.3 Create OAuth Client ID (2 minutes)

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Desktop app**
4. Name: "ChatGPT Desktop"
5. Click "Create"
6. **Copy Client ID and Client Secret**

---

## Step 3: Authenticate with Google

Run this command with your credentials:

```bash
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com" \
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET" \
npx @chieflatif/google-mcp setup-oauth
```

**What happens:**
1. Browser opens to Google login
2. You grant permissions (Gmail, Calendar, Sheets, Docs, Drive)
3. Tokens saved to `~/.mcp-google/tokens.json`
4. ✅ Setup complete!

---

## Step 4: Configure ChatGPT Desktop

### Find ChatGPT Config File

**macOS:**
```bash
~/Library/Application Support/ChatGPT/config.json
```

**Windows:**
```
%APPDATA%\ChatGPT\config.json
```

**Linux:**
```bash
~/.config/ChatGPT/config.json
```

### Edit Config File

Create or edit the config file with:

```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "npx",
      "args": ["-y", "@chieflatif/google-mcp"],
      "env": {
        "MCP_CORE_TOOLS": "1",
        "GOOGLE_CLIENT_ID": "YOUR_CLIENT_ID.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "YOUR_CLIENT_SECRET"
      }
    }
  }
}
```

**Replace:**
- `YOUR_CLIENT_ID` with your actual Client ID
- `YOUR_CLIENT_SECRET` with your actual Client Secret

---

## Step 5: Restart ChatGPT

1. Quit ChatGPT Desktop completely
2. Relaunch ChatGPT Desktop
3. The Google MCP tools will be available automatically

---

## Step 6: Test It! 

Try these commands in ChatGPT:

### Gmail
- "What unread emails do I have?"
- "Send an email to colleague@example.com about the meeting"
- "Search my inbox for messages from John about the project"

### Calendar
- "What's on my calendar today?"
- "Schedule a meeting tomorrow at 2pm called 'Team Sync'"
- "Find an open slot in my calendar this week for a 1-hour meeting"

### Google Sheets
- "Read my spreadsheet called 'Task List'"
- "Create a new spreadsheet called 'Q4 Planning'"
- "Add a row to my Budget spreadsheet"

### Google Docs
- "Create a new document called 'Project Proposal'"
- "Read my doc titled 'Meeting Notes'"
- "Update my 'Status Report' doc with new information"

### Google Drive
- "List files in my Drive"
- "Search my Drive for files about 'Q4 planning'"
- "Download the file 'report.pdf' from my Drive"

---

## What's Available

### 28 Google Workspace Tools

**Gmail (7 tools):**
- Search emails
- Send emails (with dry-run safety)
- Reply to threads
- Create drafts
- Manage labels
- Find unread messages

**Calendar (6 tools):**
- View agenda
- Create events with Google Meet
- Quick add (natural language)
- Reschedule events
- Delete events
- Find available time slots

**Sheets (5 tools):**
- Create spreadsheets
- Read data
- Append rows
- Update cells
- Search spreadsheets

**Docs (4 tools):**
- Create documents
- Read content
- Update text
- Search documents

**Drive (6 tools):**
- List files
- Search files
- Download files (up to 10MB)
- Upload files
- Share files
- Create folders

---

## Troubleshooting

### "I don't see Google tools in ChatGPT"

**Solution:**
1. Verify config file is in correct location
2. Check config file syntax is valid JSON
3. Restart ChatGPT Desktop completely (Quit → Relaunch)

### "Authentication failed" errors

**Solution:** Re-run authentication:
```bash
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID" \
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET" \
npx @chieflatif/google-mcp setup-oauth
```

### "Rate limit exceeded"

**Normal!** The server automatically retries. Wait a few moments and try again.

### "Tool not found"

**Solution:** Verify `MCP_CORE_TOOLS` is set to `"1"` in your config file.

### ChatGPT says "I don't have access to your Google account"

**Check:**
1. Config file is in correct location
2. Environment variables (CLIENT_ID and SECRET) are set correctly
3. You completed the OAuth setup in Step 3
4. ChatGPT was restarted after config change

---

## Configuration Modes

### CORE Mode (Recommended - Default)

```json
"MCP_CORE_TOOLS": "1"
```

**24 essential tools** for full read/write access to all services. Best for most users.

### Full Mode (All 28 tools)

```json
"MCP_CORE_TOOLS": "0"
```

Includes advanced calendar features like rescheduling and slot-finding.

### Minimal Mode (Read-only)

```json
"MCP_MINIMAL_TOOLS": "1"
```

**5 basic read-only tools** - fastest, lowest quota usage.

---

## Security & Privacy

✅ **Your data never leaves your computer**
- OAuth tokens stored locally at `~/.mcp-google/tokens.json`
- MCP server runs on your machine
- No cloud intermediary

✅ **You control permissions**
- Grant only the Google services you want
- Revoke access anytime in [Google Account Settings](https://myaccount.google.com/permissions)

✅ **Dry-run safety for destructive operations**
- Email sending defaults to dry-run mode
- Preview actions before they execute

---

## Advanced: Using with OpenAI Agents SDK

If you're building AI agents with the OpenAI Agents SDK:

```typescript
import { Agent } from 'openai-agents';

const agent = new Agent({
  mcpServers: {
    'google-mcp': {
      command: 'npx',
      args: ['-y', '@chieflatif/google-mcp'],
      env: {
        MCP_CORE_TOOLS: '1',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
      }
    }
  }
});
```

Your agent now has full Google Workspace access!

---

## Support

- **Issues:** [GitHub Issues](https://github.com/chieflatif/google-mcp/issues)
- **Docs:** [Full Documentation](./README.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)

---

**You now have voice-controlled Google Workspace in ChatGPT! 🎉**

