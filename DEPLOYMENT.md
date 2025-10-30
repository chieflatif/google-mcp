# Deployment Guide

Production deployment guide for Google MCP Server

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] OAuth credentials configured
- [ ] Google APIs enabled in Cloud Console
- [ ] package.json version bumped
- [ ] README up to date
- [ ] Git repository clean

## Google Cloud Configuration

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Google MCP Production"
3. Enable billing (required for API access)

### 2. Enable APIs

Enable these APIs in the project:
```
- Gmail API
- Google Calendar API
- Google Sheets API
- Google Docs API
- Google Drive API
```

Navigate to: APIs & Services → Library → Search & Enable each

### 3. Configure OAuth Consent Screen

1. Go to APIs & Services → OAuth consent screen
2. User Type: **External** (for public use) or **Internal** (for organization)
3. App Information:
   - App name: `Google MCP Server`
   - User support email: `your-email@domain.com`
   - App logo: (optional)
4. Scopes:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/spreadsheets
   https://www.googleapis.com/auth/documents
   https://www.googleapis.com/auth/drive
   ```
5. Test users: Add your email for testing
6. Submit for verification (for production/public use)

### 4. Create OAuth Credentials

1. Go to APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Application type: **Desktop app**
4. Name: `Google MCP Desktop Client`
5. Save Client ID and Client Secret

**Authorized Redirect URIs:**
```
http://localhost:3333/callback
http://127.0.0.1:3333/callback
```

## Production Deployment

### Option 1: npm Package (Public)

1. **Update package.json:**
```json
{
  "name": "@your-org/google-mcp",
  "version": "0.2.0",
  "description": "Production MCP server for Google Workspace",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/google-mcp.git"
  },
  "keywords": ["mcp", "google", "workspace", "gmail", "calendar", "sheets"],
  "author": "Your Name <email@domain.com>",
  "license": "MIT"
}
```

2. **Build and test:**
```bash
npm run build
npm pack --dry-run
```

3. **Publish to npm:**
```bash
npm login
npm publish --access public
```

### Option 2: GitHub Release

1. **Tag version:**
```bash
git tag -a v0.2.0 -m "Production release: Full Google Workspace support"
git push origin v0.2.0
```

2. **Create GitHub Release:**
- Go to repository → Releases → Draft new release
- Tag: `v0.2.0`
- Title: `Google MCP Server v0.2.0`
- Description: Copy from README features
- Attach: `google-mcp-0.2.0.tgz` (from `npm pack`)

### Option 3: Docker Container

1. **Create Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

2. **Build and push:**
```bash
docker build -t your-org/google-mcp:0.2.0 .
docker push your-org/google-mcp:0.2.0
```

## User Installation Instructions

### For npm Package

```bash
npm install -g @your-org/google-mcp
google-mcp-setup  # Run OAuth setup
```

Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "npx",
      "args": ["-y", "@your-org/google-mcp"],
      "env": {
        "MCP_CORE_TOOLS": "1",
        "GOOGLE_CLIENT_ID": "user-client-id",
        "GOOGLE_CLIENT_SECRET": "user-client-secret"
      }
    }
  }
}
```

### For Git Clone

```bash
git clone https://github.com/your-org/google-mcp.git
cd google-mcp
npm install
npm run build

# Add to Cursor config with absolute path
```

## Production Monitoring

### Health Checks

Test the server:
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | \
GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." \
node dist/index.js | jq '.result.tools | length'
```

Expected output: `28` (or `24` in CORE mode)

### Error Tracking

Monitor these error patterns:
- `RATE_LIMIT_EXCEEDED` - Increase backoff delays
- `AUTH_FAILED` - OAuth token refresh failed
- `SERVER_ERROR` - Google API downtime

### Performance Metrics

Track:
- Tool execution time (target: <2s for reads, <5s for writes)
- Error rate (target: <1% excluding quota errors)
- Retry success rate (target: >90%)

## Security Considerations

### Production Checklist

- [ ] OAuth credentials stored in environment variables (not in code)
- [ ] Tokens stored in secure location (`~/.mcp-google/tokens.json` with 0600 permissions)
- [ ] HTTPS used for OAuth redirect in production
- [ ] OAuth consent screen verified by Google (for public apps)
- [ ] Minimal scopes requested (only what's needed)
- [ ] Regular security audits of dependencies

### Token Security

```bash
# Set proper permissions
chmod 600 ~/.mcp-google/tokens.json

# Backup tokens (encrypted)
gpg -c ~/.mcp-google/tokens.json
```

### Revocation Process

If credentials compromised:
1. Revoke tokens in [Google Account Permissions](https://myaccount.google.com/permissions)
2. Delete `~/.mcp-google/tokens.json`
3. Rotate OAuth client secret in Google Cloud Console
4. Re-authenticate all users

## Updating the Server

### For Users

**npm package:**
```bash
npm update -g @your-org/google-mcp
```

**Git clone:**
```bash
cd google-mcp
git pull origin main
npm install
npm run build
# Restart Cursor
```

### For Developers

1. Update code
2. Run tests
3. Bump version in `package.json`
4. Update CHANGELOG
5. Create git tag
6. Publish to npm or create GitHub release

## Rollback Procedure

If new version has issues:

### npm
```bash
npm install -g @your-org/google-mcp@0.1.9  # Previous version
```

### Git
```bash
git checkout v0.1.9
npm install
npm run build
```

## Support

### Common Issues

**"Authentication failed"**
- Re-run `node scripts/setup-oauth.js`
- Check OAuth credentials are correct
- Verify APIs are enabled in Google Cloud

**"Rate limit exceeded"**
- Normal during heavy use
- Server auto-retries with backoff
- Check quota in Google Cloud Console

**"Tool not found"**
- Check MCP_CORE_TOOLS setting
- Verify Cursor restarted after config change
- Check server logs for startup errors

### Getting Help

- GitHub Issues: https://github.com/your-org/google-mcp/issues
- Google Workspace API Status: https://www.google.com/appsstatus
- MCP Discord: https://discord.gg/mcp

---

**Last Updated:** 2025-10-30  
**Maintainer:** Your Name  
**Production Status:** Ready for Deployment

