export const workflowTools = [
    {
        name: 'workflow_meeting_followup',
        description: 'Complete meeting follow-up workflow: get transcript, generate summary, send email',
        inputSchema: {
            type: 'object',
            properties: {
                mode: {
                    type: 'string',
                    enum: ['auto', 'manual'],
                    description: 'Auto finds latest meeting, manual uses specified IDs',
                    default: 'auto'
                },
                transcriptSearch: {
                    type: 'string',
                    description: 'Search term to find transcript (for auto mode)'
                },
                calendarEventId: {
                    type: 'string',
                    description: 'Calendar event ID (for manual mode)'
                },
                generateSummary: {
                    type: 'boolean',
                    description: 'Use LLM to enhance Otter summary',
                    default: true
                },
                sendEmail: {
                    type: 'boolean',
                    description: 'Automatically send follow-up email',
                    default: false
                },
                emailTemplate: {
                    type: 'string',
                    enum: ['follow_up', 'thank_you', 'action_items'],
                    description: 'Email template to use',
                    default: 'follow_up'
                },
                dryRun: {
                    type: 'boolean',
                    description: 'Preview email without sending',
                    default: true
                }
            }
        }
    },
    {
        name: 'workflow_schedule_meeting',
        description: 'Schedule a meeting: find contact, check availability, send invite',
        inputSchema: {
            type: 'object',
            properties: {
                contactQuery: {
                    type: 'string',
                    description: 'Apollo query to find contact (e.g., "John at TechCorp")'
                },
                duration: {
                    type: 'number',
                    description: 'Meeting duration in minutes',
                    default: 30
                },
                dateRange: {
                    type: 'object',
                    properties: {
                        start: { type: 'string', description: 'Start date for availability search' },
                        end: { type: 'string', description: 'End date for availability search' }
                    }
                },
                meetingTitle: {
                    type: 'string',
                    description: 'Meeting title/subject'
                },
                agenda: {
                    type: 'string',
                    description: 'Meeting agenda/description'
                }
            },
            required: ['contactQuery', 'dateRange', 'meetingTitle']
        }
    },
    {
        name: 'workflow_schedule_and_invite',
        description: 'Find a slot and send an invite to attendees with Meet link',
        inputSchema: {
            type: 'object',
            properties: {
                attendees: { type: 'array', items: { type: 'string' }, description: 'Attendee emails' },
                duration: { type: 'number', description: 'Minutes', default: 30 },
                dateRange: {
                    type: 'object',
                    properties: {
                        start: { type: 'string' },
                        end: { type: 'string' }
                    },
                    required: ['start', 'end']
                },
                title: { type: 'string' },
                agenda: { type: 'string' },
                dryRun: { type: 'boolean', default: true }
            },
            required: ['attendees', 'dateRange', 'title']
        }
    },
    {
        name: 'workflow_daily_briefing',
        description: 'Generate a daily briefing: today\'s calendar + top unread emails',
        inputSchema: {
            type: 'object',
            properties: {
                days: { type: 'number', default: 1 },
                unreadFrom: { type: 'string', description: 'Optional sender/domain filter' },
                maxEmails: { type: 'number', default: 10 }
            }
        }
    },
    {
        name: 'workflow_followup_nudge',
        description: 'Find threads with no reply in N days and draft bump emails',
        inputSchema: {
            type: 'object',
            properties: {
                days: { type: 'number', default: 3 },
                maxThreads: { type: 'number', default: 10 },
                dryRun: { type: 'boolean', default: true }
            }
        }
    }
];
//# sourceMappingURL=workflow.tools.js.map