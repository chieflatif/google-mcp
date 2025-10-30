# Quick Start Guide - Google MCP Server

**Get up and running in 10 minutes**

---

## What You'll Need

- Node.js 20+ installed ([Download](https://nodejs.org/))
- A Google account
- Claude Desktop, Cursor, or ChatGPT Desktop

---

## Step 1: Install (1 minute)

```bash
npm install -g @chieflatif/google-mcp
```

---

## Step 2: Create Google Cloud Project (3 minutes)

### 2.1 Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "New Project"
3. Name: "My Google MCP"
4. Click "Create"

### 2.2 Enable APIs

Click "Enable APIs and Services" and enable these 5 APIs:
1. Gmail API
2. Google Calendar API
3. Google Sheets API
4. Google Docs API
5. Google Drive API

### 2.3 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Desktop app**
4. Name: "Google MCP Desktop"
5. Click "Create"
6. **Save the Client ID and Client Secret** (you'll need these)

---

## Step 3: Authenticate (2 minutes)

Run this command with your credentials:

```bash
GOOGLE_CLIENT_ID="your-actual-client-id-here.apps.googleusercontent.com" \
GOOGLE_CLIENT_SECRET="your-actual-client-secret-here" \
npx -y @chieflatif/google-mcp setup-oauth
```

**What happens:**
1. Browser opens to Google sign-in
2. You grant permissions
3. Tokens saved to `~/.mcp-google/tokens.json`
4. Setup complete!

---

## Step 4: Configure Your AI Client (2 minutes)

### For Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "npx",
      "args": ["-y", "@chieflatif/google-mcp"],
      "env": {
        "MCP_CORE_TOOLS": "1",
        "GOOGLE_CLIENT_ID": "paste-your-client-id-here",
        "GOOGLE_CLIENT_SECRET": "paste-your-client-secret-here"
      }
    }
  }
}
```

### For Cursor

Edit `~/.cursor/mcp.json` - same format as above.

### For ChatGPT Desktop

Edit ChatGPT's config file - same format as Claude.

---

## Step 5: Use It! (2 minutes)

**Restart your AI client**, then try:

- "What's on my calendar today?"
- "Read my spreadsheet named 'Tasks'"
- "Send email to colleague@example.com about meeting"
- "Create a new document called 'Project Plan'"
- "List files in my Drive folder"

---

## Troubleshooting

### "Authentication failed"

**Solution:** Re-run Step 3 with your credentials

### "Tool not found"

**Solution:** Verify MCP_CORE_TOOLS is set to "1" in your config

### "Rate limit exceeded"

**Normal!** The server automatically retries. Wait a few moments.

### Still having issues?

1. Check the [full documentation](./README.md)
2. [Open an issue](https://github.com/chieflatif/google-mcp/issues)

---

## What's Next?

- Explore all 28 tools in the [README](./README.md)
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced configuration
- Star the repo if this helps you! ⭐

---

**Total setup time: ~10 minutes**

**You now have voice-controlled access to your entire Google Workspace! 🎉**

