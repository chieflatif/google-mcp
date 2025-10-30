import http from 'http';
import { URL } from 'url';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { OAuth2Client } from 'google-auth-library';
const TOKENS_DIR = join(homedir(), '.mcp-google');
const TOKENS_FILE = join(TOKENS_DIR, 'tokens.json');
async function ensureDir() {
    await fs.mkdir(TOKENS_DIR, { recursive: true }).catch(() => { });
}
async function readStoredTokens() {
    try {
        const buf = await fs.readFile(TOKENS_FILE, 'utf8');
        return JSON.parse(buf);
    }
    catch {
        return {};
    }
}
async function writeStoredTokens(tokens) {
    await ensureDir();
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
}
function createOAuthClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = 'http://127.0.0.1:53682/oauth2callback';
    if (!clientId || !clientSecret) {
        throw new Error('Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET in environment');
    }
    return new OAuth2Client({ clientId, clientSecret, redirectUri });
}
async function obtainNewTokens(oauth2Client, scopes) {
    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
    });
    // Print the URL to stdout only when explicitly running auth tests outside MCP
    if (process.env.MCP_DEBUG_AUTH === '1') {
        console.log('\nAuthorize this app by visiting this URL:\n', authorizeUrl, '\n');
    }
    const code = await new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            try {
                if (!req.url)
                    return;
                const url = new URL(req.url, 'http://127.0.0.1:53682');
                if (url.pathname === '/oauth2callback') {
                    const code = url.searchParams.get('code');
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<html><body>You may close this window.</body></html>');
                    server.close();
                    if (code)
                        resolve(code);
                    else
                        reject(new Error('No code received'));
                }
                else {
                    res.writeHead(404).end();
                }
            }
            catch (e) {
                reject(e);
            }
        });
        server.listen(53682, '127.0.0.1');
    });
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}
// Lazy OAuth clients - only authenticate when actually needed
let _gmailClient = null;
let _calendarClient = null;
let _sheetsClient = null;
let _docsClient = null;
let _driveClient = null;
export async function getGmailOAuthClient(scopes) {
    if (_gmailClient)
        return _gmailClient;
    const oauth2Client = createOAuthClient();
    const stored = await readStoredTokens();
    if (stored.gmail) {
        oauth2Client.setCredentials(stored.gmail);
        // Auto-refresh tokens when they expire
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                const updated = { ...stored, gmail: tokens };
                await writeStoredTokens(updated);
            }
        });
        _gmailClient = oauth2Client;
        return oauth2Client;
    }
    const tokens = await obtainNewTokens(oauth2Client, scopes);
    oauth2Client.setCredentials(tokens);
    // Auto-refresh setup for new tokens
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            const updated = { ...stored, gmail: tokens };
            await writeStoredTokens(updated);
        }
    });
    await writeStoredTokens({ ...stored, gmail: tokens });
    _gmailClient = oauth2Client;
    return oauth2Client;
}
export async function getCalendarOAuthClient(scopes) {
    if (_calendarClient)
        return _calendarClient;
    const oauth2Client = createOAuthClient();
    const stored = await readStoredTokens();
    if (stored.calendar) {
        oauth2Client.setCredentials(stored.calendar);
        // Auto-refresh tokens when they expire
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                const updated = { ...stored, calendar: tokens };
                await writeStoredTokens(updated);
            }
        });
        _calendarClient = oauth2Client;
        return oauth2Client;
    }
    const tokens = await obtainNewTokens(oauth2Client, scopes);
    oauth2Client.setCredentials(tokens);
    // Auto-refresh setup for new tokens
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            const updated = { ...stored, calendar: tokens };
            await writeStoredTokens(updated);
        }
    });
    await writeStoredTokens({ ...stored, calendar: tokens });
    _calendarClient = oauth2Client;
    return oauth2Client;
}
export async function getSheetsOAuthClient(scopes) {
    if (_sheetsClient)
        return _sheetsClient;
    const oauth2Client = createOAuthClient();
    const stored = await readStoredTokens();
    if (stored.sheets) {
        oauth2Client.setCredentials(stored.sheets);
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                const updated = { ...stored, sheets: tokens };
                await writeStoredTokens(updated);
            }
        });
        _sheetsClient = oauth2Client;
        return oauth2Client;
    }
    const tokens = await obtainNewTokens(oauth2Client, scopes);
    oauth2Client.setCredentials(tokens);
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            const updated = { ...stored, sheets: tokens };
            await writeStoredTokens(updated);
        }
    });
    await writeStoredTokens({ ...stored, sheets: tokens });
    _sheetsClient = oauth2Client;
    return oauth2Client;
}
export async function getDocsOAuthClient(scopes) {
    if (_docsClient)
        return _docsClient;
    const oauth2Client = createOAuthClient();
    const stored = await readStoredTokens();
    if (stored.docs) {
        oauth2Client.setCredentials(stored.docs);
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                const updated = { ...stored, docs: tokens };
                await writeStoredTokens(updated);
            }
        });
        _docsClient = oauth2Client;
        return oauth2Client;
    }
    const tokens = await obtainNewTokens(oauth2Client, scopes);
    oauth2Client.setCredentials(tokens);
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            const updated = { ...stored, docs: tokens };
            await writeStoredTokens(updated);
        }
    });
    await writeStoredTokens({ ...stored, docs: tokens });
    _docsClient = oauth2Client;
    return oauth2Client;
}
export async function getDriveOAuthClient(scopes) {
    if (_driveClient)
        return _driveClient;
    const oauth2Client = createOAuthClient();
    const stored = await readStoredTokens();
    if (stored.drive) {
        oauth2Client.setCredentials(stored.drive);
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                const updated = { ...stored, drive: tokens };
                await writeStoredTokens(updated);
            }
        });
        _driveClient = oauth2Client;
        return oauth2Client;
    }
    const tokens = await obtainNewTokens(oauth2Client, scopes);
    oauth2Client.setCredentials(tokens);
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            const updated = { ...stored, drive: tokens };
            await writeStoredTokens(updated);
        }
    });
    await writeStoredTokens({ ...stored, drive: tokens });
    _driveClient = oauth2Client;
    return oauth2Client;
}
//# sourceMappingURL=oauth.js.map