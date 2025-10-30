import { drive_v3 } from '@googleapis/drive';
import { getDriveOAuthClient } from '../google/oauth.js';
import { handleGoogleApiError, validateRequired, sanitizeQuery, retryWithBackoff } from '../utils/error-handler.js';
import { promises as fs } from 'fs';
import { resolve as resolvePath } from 'path';
import { Readable } from 'stream';

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive'
];

async function getDrive(): Promise<drive_v3.Drive> {
  const auth = await getDriveOAuthClient(DRIVE_SCOPES);
  return new drive_v3.Drive({ auth: auth as any });
}

/**
 * Handle Google Drive tool operations with production-grade error handling
 */
export async function handleDriveTool(name: string, args: any) {
  try {
    switch (name) {
      case 'drive_list': {
        const { folderId = 'root', limit = 20 } = args;
        
        return await retryWithBackoff(async () => {
          const drive = await getDrive();
          const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            pageSize: Math.min(limit, 100), // Cap at 100
            fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime, size)',
            orderBy: 'modifiedTime desc'
          });
          
          return {
            status: 'ok',
            count: (res.data.files || []).length,
            files: (res.data.files || []).map(f => ({
              id: f.id,
              name: f.name,
              type: f.mimeType,
              url: f.webViewLink,
              created: f.createdTime,
              modified: f.modifiedTime,
              size: f.size
            }))
          };
        });
      }

      case 'drive_search': {
        const validationError = validateRequired(args, ['query']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { query, limit = 20 } = args;
        const sanitizedQuery = sanitizeQuery(query);
        
        return await retryWithBackoff(async () => {
          const drive = await getDrive();
          const res = await drive.files.list({
            q: `name contains '${sanitizedQuery}' and trashed=false`,
            pageSize: Math.min(limit, 100),
            fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime, size)',
            orderBy: 'modifiedTime desc'
          });
          
          return {
            status: 'ok',
            count: (res.data.files || []).length,
            files: (res.data.files || []).map(f => ({
              id: f.id,
              name: f.name,
              type: f.mimeType,
              url: f.webViewLink,
              created: f.createdTime,
              modified: f.modifiedTime,
              size: f.size
            }))
          };
        });
      }

      case 'drive_download': {
        const validationError = validateRequired(args, ['fileId']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { fileId, asBase64 = false } = args;
        
        return await retryWithBackoff(async () => {
          const drive = await getDrive();
          
          // Get file metadata first
          const metadata = await drive.files.get({
            fileId,
            fields: 'name, mimeType, size'
          });
          
          const fileName = metadata.data.name || 'unknown';
          const mimeType = metadata.data.mimeType || 'application/octet-stream';
          const fileSize = parseInt(metadata.data.size || '0');
          
          // Warn if file is very large (>10MB)
          if (fileSize > 10 * 1024 * 1024) {
            return {
              status: 'error',
              error: `File is too large (${Math.round(fileSize / 1024 / 1024)}MB). Maximum supported size is 10MB.`,
              code: 'FILE_TOO_LARGE'
            };
          }
          
          // Download file content as buffer
          const res = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
          );
          
          // Convert buffer to base64 or text
          const buffer = Buffer.from(res.data as ArrayBuffer);
          let content: string;
          
          if (asBase64 || !mimeType.startsWith('text/')) {
            // Return as base64 for binary files
            content = buffer.toString('base64');
          } else {
            // Return as UTF-8 text for text files
            content = buffer.toString('utf-8');
          }
          
          return {
            status: 'ok',
            fileId,
            fileName,
            mimeType,
            size: fileSize,
            content,
            encoding: asBase64 || !mimeType.startsWith('text/') ? 'base64' : 'utf-8'
          };
        });
      }

      case 'drive_upload': {
        const validationError = validateRequired(args, ['fileName', 'content']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { fileName, mimeType, content, folderId = 'root', fromPath, fromBase64 } = args;
        
        return await retryWithBackoff(async () => {
          const drive = await getDrive();
          
          let fileContent: string | Readable;
          let finalMimeType = mimeType || 'text/plain';
          
          // Handle different content sources
          if (fromPath) {
            // Upload from file path
            try {
              const absolutePath = resolvePath(fromPath);
              fileContent = await fs.readFile(absolutePath, 'utf-8');
              // Infer mime type if not provided
              if (!mimeType) {
                if (fromPath.endsWith('.txt')) finalMimeType = 'text/plain';
                else if (fromPath.endsWith('.json')) finalMimeType = 'application/json';
                else if (fromPath.endsWith('.csv')) finalMimeType = 'text/csv';
              }
            } catch (error: any) {
              return {
                status: 'error',
                error: `Failed to read file from path: ${error.message}`,
                code: 'FILE_READ_ERROR'
              };
            }
          } else if (fromBase64) {
            // Decode base64 content
            try {
              fileContent = Buffer.from(content, 'base64').toString('utf-8');
            } catch (error: any) {
              return {
                status: 'error',
                error: 'Invalid base64 content',
                code: 'INVALID_BASE64'
              };
            }
          } else {
            // Use content as-is
            fileContent = content;
          }
          
          const res = await drive.files.create({
            requestBody: {
              name: fileName,
              mimeType: finalMimeType,
              parents: [folderId]
            },
            media: {
              mimeType: finalMimeType,
              body: fileContent
            },
            fields: 'id, name, webViewLink, mimeType'
          });
          
          return {
            status: 'ok',
            fileId: res.data.id,
            fileName: res.data.name,
            url: res.data.webViewLink,
            mimeType: res.data.mimeType
          };
        });
      }

      case 'drive_share': {
        const validationError = validateRequired(args, ['fileId', 'email']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { fileId, email, role = 'reader' } = args;
        
        // Validate role
        if (!['reader', 'writer', 'commenter'].includes(role)) {
          return {
            status: 'error',
            error: 'role must be one of: reader, writer, commenter'
          };
        }
        
        return await retryWithBackoff(async () => {
          const drive = await getDrive();
          
          const res = await drive.permissions.create({
            fileId,
            requestBody: {
              type: 'user',
              role,
              emailAddress: email
            },
            sendNotificationEmail: true,
            fields: 'id'
          });
          
          return {
            status: 'ok',
            fileId,
            sharedWith: email,
            role,
            permissionId: res.data.id
          };
        });
      }

      case 'drive_create_folder': {
        const validationError = validateRequired(args, ['name']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { name, parentId = 'root' } = args;
        
        return await retryWithBackoff(async () => {
          const drive = await getDrive();
          
          const res = await drive.files.create({
            requestBody: {
              name,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [parentId]
            },
            fields: 'id, name, webViewLink'
          });
          
          return {
            status: 'ok',
            folderId: res.data.id,
            folderName: res.data.name,
            url: res.data.webViewLink
          };
        });
      }

      default:
        return {
          status: 'error',
          error: `Unknown Drive tool: ${name}`
        };
    }
  } catch (error: any) {
    return handleGoogleApiError(error, name);
  }
}
