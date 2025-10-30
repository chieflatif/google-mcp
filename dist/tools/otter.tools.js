export const otterTools = [
    {
        name: 'otter_get_transcript',
        description: 'Get transcript(s) from local Otter folder. Searches by title, date, or returns most recent.',
        inputSchema: {
            type: 'object',
            properties: {
                search: {
                    type: 'string',
                    description: 'Search in title or transcript content'
                },
                date: {
                    type: 'string',
                    description: 'ISO date to match (e.g., "2024-01-15")'
                },
                lastN: {
                    type: 'number',
                    description: 'Return last N transcripts (default: 1)',
                    default: 1
                }
            }
        }
    },
    {
        name: 'otter_list_transcripts',
        description: 'List all available transcripts with metadata',
        inputSchema: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: 'Maximum number to return (default: 10)',
                    default: 10
                }
            }
        }
    },
    {
        name: 'otter_search_insights',
        description: 'Search across all transcripts for specific topics or discussions',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Topic or keyword to search for',
                    required: true
                },
                dateRange: {
                    type: 'object',
                    properties: {
                        start: { type: 'string', description: 'Start date (ISO)' },
                        end: { type: 'string', description: 'End date (ISO)' }
                    }
                }
            },
            required: ['query']
        }
    }
];
//# sourceMappingURL=otter.tools.js.map