export const calendarTools = [
    {
        name: 'calendar_find_slots',
        description: 'Find available time slots in calendar',
        inputSchema: {
            type: 'object',
            properties: {
                duration: {
                    type: 'number',
                    description: 'Meeting duration in minutes (30, 60, etc)'
                },
                dateRange: {
                    type: 'object',
                    properties: {
                        start: { type: 'string', description: 'Start date (ISO format)' },
                        end: { type: 'string', description: 'End date (ISO format)' }
                    },
                    required: ['start', 'end']
                },
                preferredTimes: {
                    type: 'object',
                    properties: {
                        earliestHour: { type: 'number', description: 'Earliest hour (0-23)' },
                        latestHour: { type: 'number', description: 'Latest hour (0-23)' },
                        avoidDays: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Days to avoid (e.g., ["Saturday", "Sunday"])'
                        }
                    }
                }
            },
            required: ['duration', 'dateRange']
        }
    },
    {
        name: 'calendar_reschedule_event',
        description: 'Reschedule or update an existing event (time/title/description)',
        inputSchema: {
            type: 'object',
            properties: {
                eventId: { type: 'string', description: 'Event ID' },
                calendarId: { type: 'string', description: 'Calendar ID (default: primary)' },
                start: { type: 'string', description: 'New start (ISO)' },
                end: { type: 'string', description: 'New end (ISO)' },
                title: { type: 'string' },
                description: { type: 'string' },
                notifyAttendees: { type: 'boolean', description: 'Send updates to attendees', default: true }
            },
            required: ['eventId']
        }
    },
    {
        name: 'calendar_quick_add',
        description: 'Quick add an event from natural language text (e.g., "Lunch with Sam tomorrow 1pm")',
        inputSchema: {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'Quick add text' },
                calendarId: { type: 'string', description: 'Calendar ID (default: primary)' }
            },
            required: ['text']
        }
    },
    {
        name: 'calendar_create_meeting',
        description: 'Create a calendar event/meeting',
        inputSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'Event title'
                },
                start: {
                    type: 'string',
                    description: 'Start time (ISO format)'
                },
                end: {
                    type: 'string',
                    description: 'End time (ISO format)'
                },
                attendees: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Attendee email addresses'
                },
                description: {
                    type: 'string',
                    description: 'Event description'
                },
                location: {
                    type: 'string',
                    description: 'Event location'
                },
                addVideoLink: {
                    type: 'string',
                    enum: ['meet', 'none'],
                    description: 'Add Google Meet link',
                    default: 'meet'
                }
            },
            required: ['title', 'start', 'end']
        }
    },
    {
        name: 'calendar_get_agenda',
        description: 'Get upcoming calendar events',
        inputSchema: {
            type: 'object',
            properties: {
                calendarId: {
                    type: 'string',
                    description: 'Calendar ID (default: primary)'
                },
                days: {
                    type: 'number',
                    description: 'Number of days ahead to look (default: 1)',
                    default: 1
                },
                timeMin: { type: 'string' },
                timeMax: { type: 'string' }
            }
        }
    },
    {
        name: 'calendar_delete_event',
        description: 'Delete a calendar event by ID',
        inputSchema: {
            type: 'object',
            properties: {
                eventId: { type: 'string', description: 'Event ID' },
                calendarId: { type: 'string', description: 'Calendar ID (default: primary)' }
            },
            required: ['eventId']
        }
    }
];
//# sourceMappingURL=calendar.tools.js.map