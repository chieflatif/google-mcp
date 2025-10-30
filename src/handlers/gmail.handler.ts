import { gmail_v1 } from '@googleapis/gmail';
import { promises as fs } from 'fs';
import { resolve as resolvePath } from 'path';
import { getGmailOAuthClient } from '../google/oauth.js';
import { handleGoogleApiError, validateRequired, retryWithBackoff } from '../utils/error-handler.js';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

async function getGmail(): Promise<gmail_v1.Gmail> {
  const auth = await getGmailOAuthClient(GMAIL_SCOPES);
  return new gmail_v1.Gmail({ auth: auth as any });
}

async function buildRawMime(options: {
  to: string[] | string,
  cc?: string[],
  bcc?: string[],
  subject: string,
  textBody: string,
  htmlBody?: string,
  attachments?: Array<{ path?: string, filename?: string, contentBase64?: string, contentType?: string }>
}): Promise<string> {
  const { to, cc, bcc, subject, textBody, htmlBody, attachments = [] } = options;
  const recipients = Array.isArray(to) ? to.join(', ') : to;
  const boundaryMixed = `mixed_${Date.now()}`;
  const boundaryAlt = `alt_${Date.now()}`;

  const headers: string[] = [];
  headers.push(`To: ${recipients}`);
  if (cc && cc.length) headers.push(`Cc: ${cc.join(', ')}`);
  if (bcc && bcc.length) headers.push(`Bcc: ${bcc.join(', ')}`);
  headers.push('MIME-Version: 1.0');

  const hasAttachments = attachments.length > 0;
  const hasHtml = !!htmlBody;

  let bodyParts: string[] = [];

  if (hasAttachments || hasHtml) {
    headers.push(`Subject: ${subject}`);
    headers.push(`Content-Type: multipart/mixed; boundary="${boundaryMixed}"`);

    // Start mixed
    bodyParts.push(`--${boundaryMixed}`);
    if (hasHtml) {
      // multipart/alternative part
      bodyParts.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`);
      bodyParts.push('');
      // text
      bodyParts.push(`--${boundaryAlt}`);
      bodyParts.push('Content-Type: text/plain; charset="UTF-8"');
      bodyParts.push('');
      bodyParts.push(textBody || '');
      // html
      bodyParts.push(`--${boundaryAlt}`);
      bodyParts.push('Content-Type: text/html; charset="UTF-8"');
      bodyParts.push('');
      bodyParts.push(htmlBody || '');
      bodyParts.push(`--${boundaryAlt}--`);
    } else {
      // simple text part directly in mixed
      bodyParts.push('Content-Type: text/plain; charset="UTF-8"');
      bodyParts.push('');
      bodyParts.push(textBody || '');
    }

    // attachments
    for (const att of attachments) {
      const contentType = att.contentType || 'application/octet-stream';
      const filename = att.filename || (att.path ? att.path.split('/').pop() || 'attachment' : 'attachment');
      let contentB64 = att.contentBase64;
      if (!contentB64 && att.path) {
        const abs = resolvePath(att.path);
        const buf = await fs.readFile(abs);
        contentB64 = buf.toString('base64');
      }
      if (!contentB64) continue;
      bodyParts.push(`--${boundaryMixed}`);
      bodyParts.push(`Content-Type: ${contentType}; name="${filename}"`);
      bodyParts.push('Content-Transfer-Encoding: base64');
      bodyParts.push(`Content-Disposition: attachment; filename="${filename}"`);
      bodyParts.push('');
      bodyParts.push(contentB64.replace(/.{76}/g, '$&\r\n'));
    }
    bodyParts.push(`--${boundaryMixed}--`);
  } else {
    headers.push(`Subject: ${subject}`);
    headers.push('Content-Type: text/plain; charset="UTF-8"');
    bodyParts.push('');
    bodyParts.push(textBody || '');
  }

  const message = headers.join('\r\n') + '\r\n' + bodyParts.join('\r\n');
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Handle Gmail tool operations with production-grade error handling
 */
export async function handleGmailTool(name: string, args: any) {
  try {
    switch (name) {
      case 'gmail_search': {
        const validationError = validateRequired(args, ['query']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { query, maxResults = 10 } = args;
        
        return await retryWithBackoff(async () => {
          const gmail = await getGmail();
          const res = await gmail.users.messages.list({ 
            userId: 'me', 
            q: query, 
            maxResults: Math.min(maxResults, 100) 
          });
          
          const messages = res.data.messages || [];
          const results = [] as any[];
          
          for (const m of messages) {
            if (!m.id) continue;
            const msg = await gmail.users.messages.get({ 
              userId: 'me', 
              id: m.id, 
              format: 'metadata', 
              metadataHeaders: ['Subject','From','Date'] 
            });
            const headers = (msg.data.payload?.headers || []) as Array<{name?: string, value?: string}>;
            const h = (name: string) => headers.find(x => x.name?.toLowerCase() === name.toLowerCase())?.value || '';
            results.push({
              id: msg.data.threadId || msg.data.id,
              messageId: msg.data.id,
              subject: h('Subject'),
              from: h('From'),
              date: h('Date'),
              snippet: msg.data.snippet
            });
          }
          
          return { status: 'ok', count: results.length, threads: results };
        });
      }
      
      case 'gmail_search_unread_from': {
        const validationError = validateRequired(args, ['from']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { from, maxResults = 10 } = args;
        
        return await retryWithBackoff(async () => {
          const gmail = await getGmail();
          const q = `is:unread from:${from}`;
          const res = await gmail.users.messages.list({ 
            userId: 'me', 
            q, 
            maxResults: Math.min(maxResults, 100) 
          });
          
          return { 
            status: 'ok', 
            count: (res.data.messages || []).length, 
            messages: res.data.messages 
          };
        });
      }

      case 'gmail_reply_latest': {
        const validationError = validateRequired(args, ['fromQuery', 'body']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { fromQuery, body, replyAll = true, dryRun = true } = args;
        
        return await retryWithBackoff(async () => {
          const gmail = await getGmail();
          const res = await gmail.users.threads.list({ 
            userId: 'me', 
            q: `from:${fromQuery}`, 
            maxResults: 1 
          });
          
          const thread = (res.data.threads || [])[0];
          if (!thread?.id) {
            return { 
              status: 'error', 
              error: 'No thread found for fromQuery',
              code: 'NOT_FOUND'
            };
          }
          
          if (dryRun) {
            return { 
              status: 'dry_run', 
              threadId: thread.id, 
              bodyLength: body.length,
              message: 'Email validated but not sent (dry run mode)'
            };
          }
          
          // Send reply in thread
          const raw = await buildRawMime({ to: [], subject: 'Re:', textBody: body });
          const sendRes = await gmail.users.messages.send({ 
            userId: 'me', 
            requestBody: { raw, threadId: thread.id } 
          });
          
          return { 
            status: 'sent', 
            id: sendRes.data.id, 
            threadId: sendRes.data.threadId 
          };
        });
      }

      case 'gmail_label_threads': {
        const validationError = validateRequired(args, ['query']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { query, addLabels = [], removeLabels = [] } = args;
        
        if (!Array.isArray(addLabels) || !Array.isArray(removeLabels)) {
          return { 
            status: 'error', 
            error: 'addLabels and removeLabels must be arrays' 
          };
        }
        
        return await retryWithBackoff(async () => {
          const gmail = await getGmail();
          const res = await gmail.users.threads.list({ 
            userId: 'me', 
            q: query, 
            maxResults: 50 
          });
          
          const threads = res.data.threads || [];
          for (const t of threads) {
            if (!t.id) continue;
            await gmail.users.threads.modify({ 
              userId: 'me', 
              id: t.id, 
              requestBody: { 
                addLabelIds: addLabels, 
                removeLabelIds: removeLabels 
              } 
            });
          }
          
          return { status: 'ok', modified: threads.length };
        });
      }
      
      case 'gmail_send': {
        const validationError = validateRequired(args, ['to', 'subject', 'body']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { to, cc, bcc, subject, body, htmlBody, attachments = [], replyToThreadId, dryRun = true } = args;
        
        if (!Array.isArray(to)) {
          return { 
            status: 'error', 
            error: 'to must be an array of email addresses' 
          };
        }
        
        if (dryRun) {
          return { 
            status: 'dry_run', 
            message: 'Email validated but not sent (dry run mode)', 
            preview: { 
              to, 
              cc, 
              bcc, 
              subject, 
              bodyLength: (body||'').length, 
              attachments: (attachments||[]).map((a:any)=>a.filename||a.path||'attachment') 
            } 
          };
        }
        
        return await retryWithBackoff(async () => {
          const gmail = await getGmail();
          const raw = await buildRawMime({ to, cc, bcc, subject, textBody: body, htmlBody, attachments });
          const res = await gmail.users.messages.send({ 
            userId: 'me', 
            requestBody: { raw, threadId: replyToThreadId } 
          });
          
          return { 
            status: 'sent', 
            id: res.data.id, 
            threadId: res.data.threadId 
          };
        });
      }
      
      case 'gmail_create_draft': {
        const validationError = validateRequired(args, ['to', 'subject', 'body']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { to, cc, bcc, subject, body, htmlBody, attachments = [] } = args;
        
        if (!Array.isArray(to)) {
          return { 
            status: 'error', 
            error: 'to must be an array of email addresses' 
          };
        }
        
        return await retryWithBackoff(async () => {
          const gmail = await getGmail();
          const raw = await buildRawMime({ to, cc, bcc, subject, textBody: body, htmlBody, attachments });
          const res = await gmail.users.drafts.create({ 
            userId: 'me', 
            requestBody: { message: { raw } } 
          });
          
          return { 
            status: 'ok', 
            draftId: res.data.id, 
            messageId: res.data.message?.id 
          };
        });
      }
      
      case 'gmail_get_thread': {
        const validationError = validateRequired(args, ['threadId']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { threadId } = args;
        
        return await retryWithBackoff(async () => {
          const gmail = await getGmail();
          const res = await gmail.users.threads.get({ userId: 'me', id: threadId });
          
          const messages = (res.data.messages || []).map(m => ({
            id: m.id,
            snippet: m.snippet,
            internalDate: m.internalDate
          }));
          
          return { 
            status: 'ok', 
            threadId, 
            messagesCount: messages.length, 
            messages 
          };
        });
      }
      
      default:
        return {
          status: 'error',
          error: `Unknown Gmail tool: ${name}`
        };
    }
  } catch (error: any) {
    return handleGoogleApiError(error, name);
  }
}
