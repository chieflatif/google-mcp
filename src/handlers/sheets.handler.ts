import { sheets_v4 } from '@googleapis/sheets';
import { getSheetsOAuthClient } from '../google/oauth.js';
import { handleGoogleApiError, validateRequired, sanitizeQuery, retryWithBackoff } from '../utils/error-handler.js';

const SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

async function getSheets(): Promise<sheets_v4.Sheets> {
  const auth = await getSheetsOAuthClient(SHEETS_SCOPES);
  return new sheets_v4.Sheets({ auth: auth as any });
}

/**
 * Handle Google Sheets tool operations with production-grade error handling
 */
export async function handleSheetsTool(name: string, args: any) {
  try {
    switch (name) {
      case 'sheets_create': {
        // Validate required parameters
        const validationError = validateRequired(args, ['title']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { title } = args;
        
        return await retryWithBackoff(async () => {
          const sheets = await getSheets();
          const res = await sheets.spreadsheets.create({
            requestBody: {
              properties: { title }
            }
          });
          
          return {
            status: 'ok',
            spreadsheetId: res.data.spreadsheetId,
            spreadsheetUrl: res.data.spreadsheetUrl,
            title: res.data.properties?.title
          };
        });
      }

      case 'sheets_read': {
        const validationError = validateRequired(args, ['spreadsheetId']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { spreadsheetId, range = 'A:Z' } = args;
        
        return await retryWithBackoff(async () => {
          const sheets = await getSheets();
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
          });
          
          return {
            status: 'ok',
            range: res.data.range,
            values: res.data.values || [],
            rowCount: (res.data.values || []).length
          };
        });
      }

      case 'sheets_append': {
        const validationError = validateRequired(args, ['spreadsheetId', 'values']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { spreadsheetId, range, values } = args;
        
        // Validate values is an array
        if (!Array.isArray(values)) {
          return { status: 'error', error: 'values must be a 2D array' };
        }
        
        return await retryWithBackoff(async () => {
          const sheets = await getSheets();
          const res = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: range || 'Sheet1!A:Z',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
          });
          
          return {
            status: 'ok',
            updatedRange: res.data.updates?.updatedRange,
            updatedRows: res.data.updates?.updatedRows,
            updatedCells: res.data.updates?.updatedCells
          };
        });
      }

      case 'sheets_update': {
        const validationError = validateRequired(args, ['spreadsheetId', 'range', 'values']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { spreadsheetId, range, values } = args;
        
        // Validate values is an array
        if (!Array.isArray(values)) {
          return { status: 'error', error: 'values must be a 2D array' };
        }
        
        return await retryWithBackoff(async () => {
          const sheets = await getSheets();
          const res = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
          });
          
          return {
            status: 'ok',
            updatedRange: res.data.updatedRange,
            updatedRows: res.data.updatedRows,
            updatedCells: res.data.updatedCells
          };
        });
      }

      case 'sheets_search': {
        const validationError = validateRequired(args, ['query']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { query, limit = 10 } = args;
        const sanitizedQuery = sanitizeQuery(query);
        
        return await retryWithBackoff(async () => {
          const { google } = await import('googleapis');
          const auth = await getSheetsOAuthClient(SHEETS_SCOPES);
          const drive = google.drive({ version: 'v3', auth: auth as any });
          
          const res = await drive.files.list({
            q: `name contains '${sanitizedQuery}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
            pageSize: Math.min(limit, 100), // Cap at 100
            fields: 'files(id, name, webViewLink, createdTime, modifiedTime)',
            orderBy: 'modifiedTime desc'
          });
          
          return {
            status: 'ok',
            count: (res.data.files || []).length,
            spreadsheets: (res.data.files || []).map((f: any) => ({
              id: f.id,
              name: f.name,
              url: f.webViewLink,
              created: f.createdTime,
              modified: f.modifiedTime
            }))
          };
        });
      }

      default:
        return {
          status: 'error',
          error: `Unknown Sheets tool: ${name}`
        };
    }
  } catch (error: any) {
    return handleGoogleApiError(error, name);
  }
}
