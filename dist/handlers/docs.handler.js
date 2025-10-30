import { docs_v1 } from '@googleapis/docs';
import { getDocsOAuthClient } from '../google/oauth.js';
import { handleGoogleApiError, validateRequired, sanitizeQuery, retryWithBackoff } from '../utils/error-handler.js';
const DOCS_SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive'
];
async function getDocs() {
    const auth = await getDocsOAuthClient(DOCS_SCOPES);
    return new docs_v1.Docs({ auth: auth });
}
/**
 * Handle Google Docs tool operations with production-grade error handling
 */
export async function handleDocsTool(name, args) {
    try {
        switch (name) {
            case 'docs_create': {
                const validationError = validateRequired(args, ['title']);
                if (validationError) {
                    return { status: 'error', error: validationError };
                }
                const { title, content } = args;
                return await retryWithBackoff(async () => {
                    const docs = await getDocs();
                    // Create the document
                    const createRes = await docs.documents.create({
                        requestBody: { title }
                    });
                    const documentId = createRes.data.documentId;
                    if (!documentId) {
                        throw new Error('Failed to create document - no ID returned');
                    }
                    // If content provided, insert it
                    if (content) {
                        await docs.documents.batchUpdate({
                            documentId,
                            requestBody: {
                                requests: [{
                                        insertText: {
                                            location: { index: 1 },
                                            text: content
                                        }
                                    }]
                            }
                        });
                    }
                    return {
                        status: 'ok',
                        documentId,
                        title: createRes.data.title,
                        documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
                    };
                });
            }
            case 'docs_read': {
                const validationError = validateRequired(args, ['documentId']);
                if (validationError) {
                    return { status: 'error', error: validationError };
                }
                const { documentId } = args;
                return await retryWithBackoff(async () => {
                    const docs = await getDocs();
                    const res = await docs.documents.get({ documentId });
                    // Extract text content from document
                    const content = res.data.body?.content || [];
                    let text = '';
                    for (const element of content) {
                        if (element.paragraph) {
                            const paragraphElements = element.paragraph.elements || [];
                            for (const elem of paragraphElements) {
                                if (elem.textRun?.content) {
                                    text += elem.textRun.content;
                                }
                            }
                        }
                    }
                    return {
                        status: 'ok',
                        documentId,
                        title: res.data.title,
                        text: text.trim(),
                        characterCount: text.length,
                        documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
                    };
                });
            }
            case 'docs_update': {
                const validationError = validateRequired(args, ['documentId', 'text']);
                if (validationError) {
                    return { status: 'error', error: validationError };
                }
                const { documentId, text, index = 1 } = args;
                return await retryWithBackoff(async () => {
                    const docs = await getDocs();
                    await docs.documents.batchUpdate({
                        documentId,
                        requestBody: {
                            requests: [{
                                    insertText: {
                                        location: { index },
                                        text
                                    }
                                }]
                        }
                    });
                    return {
                        status: 'ok',
                        documentId,
                        inserted: text.length,
                        documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
                    };
                });
            }
            case 'docs_search': {
                const validationError = validateRequired(args, ['query']);
                if (validationError) {
                    return { status: 'error', error: validationError };
                }
                const { query, limit = 10 } = args;
                const sanitizedQuery = sanitizeQuery(query);
                return await retryWithBackoff(async () => {
                    const { google } = await import('googleapis');
                    const auth = await getDocsOAuthClient(DOCS_SCOPES);
                    const drive = google.drive({ version: 'v3', auth: auth });
                    const res = await drive.files.list({
                        q: `name contains '${sanitizedQuery}' and mimeType='application/vnd.google-apps.document' and trashed=false`,
                        pageSize: Math.min(limit, 100), // Cap at 100
                        fields: 'files(id, name, webViewLink, createdTime, modifiedTime)',
                        orderBy: 'modifiedTime desc'
                    });
                    return {
                        status: 'ok',
                        count: (res.data.files || []).length,
                        documents: (res.data.files || []).map((f) => ({
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
                    error: `Unknown Docs tool: ${name}`
                };
        }
    }
    catch (error) {
        return handleGoogleApiError(error, name);
    }
}
//# sourceMappingURL=docs.handler.js.map