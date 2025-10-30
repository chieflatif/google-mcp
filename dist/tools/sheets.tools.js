export const sheetsTools = [
    {
        name: 'sheets_create',
        description: 'Create a new Google Sheet',
        inputSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'Spreadsheet title'
                }
            },
            required: ['title']
        }
    },
    {
        name: 'sheets_read',
        description: 'Read data from a Google Sheet',
        inputSchema: {
            type: 'object',
            properties: {
                spreadsheetId: {
                    type: 'string',
                    description: 'Sheet ID from URL'
                },
                range: {
                    type: 'string',
                    description: 'A1 notation range (e.g., "Sheet1!A1:Z100")',
                    default: 'A:Z'
                }
            },
            required: ['spreadsheetId']
        }
    },
    {
        name: 'sheets_append',
        description: 'Append rows to a Google Sheet',
        inputSchema: {
            type: 'object',
            properties: {
                spreadsheetId: { type: 'string' },
                range: {
                    type: 'string',
                    description: 'Where to append (e.g., "Sheet1!A:Z")'
                },
                values: {
                    type: 'array',
                    items: { type: 'array' },
                    description: '2D array of values'
                }
            },
            required: ['spreadsheetId', 'values']
        }
    },
    {
        name: 'sheets_update',
        description: 'Update specific cells in a Google Sheet',
        inputSchema: {
            type: 'object',
            properties: {
                spreadsheetId: { type: 'string' },
                range: {
                    type: 'string',
                    description: 'Cell range to update'
                },
                values: {
                    type: 'array',
                    items: { type: 'array' }
                }
            },
            required: ['spreadsheetId', 'range', 'values']
        }
    },
    {
        name: 'sheets_search',
        description: 'Search for spreadsheets by name',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search term'
                },
                limit: {
                    type: 'number',
                    default: 10
                }
            },
            required: ['query']
        }
    }
];
//# sourceMappingURL=sheets.tools.js.map