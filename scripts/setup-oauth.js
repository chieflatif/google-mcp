#!/usr/bin/env node

import { OAuth2Client } from 'google-auth-library';
import { createServer } from 'http';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const TOKENS_DIR = join(homedir(), '.mcp-google');
const TOKENS_FILE = join(TOKENS_DIR, 'tokens.json');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3333/callback';

// All scopes required for full Google Workspace access
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive'
];

async function setup() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    process.exit(1);
  }

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 Opening Google OAuth consent page...\n');
  
  const server = createServer(async (req, res) => {
    if (req.url.startsWith('/callback')) {
      const url = new URL(req.url, `http://localhost:3333`);
      const code = url.searchParams.get('code');
      
      if (code) {
        try {
          const { tokens } = await oauth2Client.getToken(code);
          
          // Save tokens in multi-service format expected by oauth.ts
          const multiServiceTokens = {
            gmail: tokens,
            calendar: tokens,
            sheets: tokens,
            docs: tokens,
            drive: tokens
          };
          
          await mkdir(TOKENS_DIR, { recursive: true });
          await writeFile(TOKENS_FILE, JSON.stringify(multiServiceTokens, null, 2));
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>✅ Success!</h1><p>OAuth tokens saved. You can close this window.</p>');
          
          console.log('\n✅ OAuth tokens saved to:', TOKENS_FILE);
          console.log('\n🎉 Setup complete! Your MCP server can now authenticate with Google.\n');
          
          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 1000);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>❌ Error</h1><p>Failed to exchange code for tokens.</p>');
          console.error('Token exchange failed:', error.message);
          server.close();
          process.exit(1);
        }
      }
    }
  });

  server.listen(3333, () => {
    console.log('✅ Temporary callback server running on http://localhost:3333');
    console.log('\n🔗 Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n');
  });
}

setup();

