# Zapier → Local Folder Setup Guide

## Overview
This guide shows how to configure Zapier to save Otter.ai transcripts to a local folder that the MCP server can read.

## Prerequisites
- Otter.ai account (Pro/Business/Enterprise)
- Zapier account
- Local folder access

## Step 1: Create Local Folder Structure

```bash
# Create the transcript folders
mkdir -p ~/.mcp-google/otter-transcripts
mkdir -p ~/.mcp-google/processed

# Set permissions
chmod 755 ~/.mcp-google/otter-transcripts
```

## Step 2: Generate Otter.ai API Key

1. Log into Otter.ai
2. Go to Settings → Apps
3. Find "Zapier" integration
4. Click "Generate API Key"
5. **Save this key** - it won't be shown again

## Step 3: Create Zapier Workflow

### Option A: Using Google Drive (Recommended)

1. **Create Zap**
   - Trigger: Otter.ai → "Speech Processing Complete"
   - Action: Google Drive → "Create Document from Text"

2. **Configure Trigger**
   - Connect Otter.ai using API key from Step 2
   - Test with a recent transcript

3. **Configure Action**
   ```
   Folder: Create "Otter Transcripts" folder in Drive
   Filename: {{created_at}}_{{title}}.json
   Content: (Use this exact JSON structure)
   ```
   ```json
   {
     "id": "{{speech_id}}",
     "title": "{{title}}",
     "date": "{{created_at}}",
     "duration": {{duration}},
     "transcript": "{{transcript_text}}",
     "summary": "{{summary}}",
     "action_items": "{{action_items}}",
     "attendees": "{{speakers}}",
     "share_link": "{{share_url}}"
   }
   ```

4. **Sync Google Drive Locally**
   - Use Google Drive desktop app
   - Sync "Otter Transcripts" folder
   - Create symlink:
   ```bash
   ln -s ~/Google\ Drive/Otter\ Transcripts/* ~/.mcp-google/otter-transcripts/
   ```

### Option B: Using Dropbox

Similar to Google Drive, but use Dropbox → "Create Text File" action.

### Option C: Direct File Write (Requires Zapier Desktop App)

1. Install Zapier Desktop App (Mac/Windows)
2. Use "Desktop App" → "Create File" action
3. Set path: `/Users/[username]/.mcp-google/otter-transcripts/{{created_at}}_{{title}}.json`

## Step 4: Test the Integration

1. **Process a test recording in Otter.ai**
   - Upload a short audio file
   - Wait for processing to complete

2. **Check Zapier history**
   - Verify the Zap triggered
   - Check for any errors

3. **Verify local file**
   ```bash
   ls -la ~/.mcp-google/otter-transcripts/
   # Should see your new transcript JSON file
   ```

4. **Test with MCP server**
   ```bash
   # Install dependencies
   npm install
   
   # Run test
   npm run test:transcript
   ```

## Step 5: Configure MCP Server

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mcp-google-otter": {
      "command": "npx",
      "args": ["mcp-google-otter"],
      "env": {
        "TRANSCRIPT_DIR": "~/.mcp-google/otter-transcripts"
      }
    }
  }
}
```

## Troubleshooting

### Transcript not appearing
- Check Zapier history for errors
- Verify folder permissions
- Check file sync if using cloud storage

### JSON parse errors
- Ensure Zapier is creating valid JSON
- Check for special characters in transcript
- Use "Formatter" step in Zapier to clean text

### Large transcripts
- Zapier has 30MB limit
- Consider splitting very long transcripts
- Use summary-only mode for long meetings

## Usage Examples

Once configured, use these commands in Cursor:

```
"Get the transcript from today's meeting"
"Search all transcripts for discussions about pricing"
"Send follow-up email from the TechCorp meeting"
```

## Security Notes

- Transcripts are stored locally (not in cloud)
- Use encrypted disk for sensitive content
- Regularly clean old transcripts:
  ```bash
  # Move old transcripts to archive
  find ~/.mcp-google/otter-transcripts -mtime +30 -exec mv {} ~/.mcp-google/processed/ \;
  ```

## Support

For issues:
1. Check Zapier logs
2. Verify Otter.ai API key is valid
3. Test with simple transcript first
4. Check MCP server logs
