import { handleOtterTool } from './otter.handler.js';
import { handleGmailTool } from './gmail.handler.js';
import { handleCalendarTool } from './calendar.handler.js';
export async function handleWorkflowTool(name, args) {
    switch (name) {
        case 'workflow_meeting_followup': {
            const { mode = 'auto', transcriptSearch, generateSummary = true, sendEmail = false, dryRun = true } = args;
            // Step 1: Get transcript
            const transcriptResult = await handleOtterTool('otter_get_transcript', {
                search: transcriptSearch,
                lastN: 1
            });
            if (!transcriptResult.found) {
                return {
                    status: 'error',
                    message: 'No transcript found matching criteria'
                };
            }
            const transcript = transcriptResult.transcripts[0];
            // Step 2: Generate enhanced summary (mock for now)
            const enhancedSummary = generateSummary ? {
                original: transcript.summary,
                enhanced: `Enhanced summary would be generated here by LLM`,
                keyPoints: ['Key point 1', 'Key point 2'],
                nextSteps: ['Follow up on action item 1', 'Schedule next meeting']
            } : null;
            // Step 3: Send follow-up email
            let emailResult = null;
            if (sendEmail) {
                emailResult = await handleGmailTool('gmail_send', {
                    to: ['attendee@example.com'], // Would extract from transcript
                    subject: `Follow-up: ${transcript.title}`,
                    body: `Thank you for the meeting. Here's a summary:\n\n${transcript.summary}`,
                    dryRun
                });
            }
            return {
                status: 'success',
                meeting: {
                    title: transcript.title,
                    date: transcript.date,
                    attendees: transcript.attendees || []
                },
                transcript: {
                    original: transcript.transcript.substring(0, 500) + '...', // Truncate for response
                    summary: enhancedSummary || transcript.summary,
                    actionItems: transcript.actionItems || []
                },
                email: emailResult
            };
        }
        case 'workflow_schedule_meeting': {
            const { contactQuery, duration = 30, dateRange, meetingTitle, agenda } = args;
            // This would integrate with Apollo MCP to get contact
            const mockContact = {
                name: 'John Doe',
                email: 'john@techcorp.com',
                company: 'TechCorp'
            };
            // Find available slots
            const slotsResult = await handleCalendarTool('calendar_find_slots', {
                durationMinutes: duration,
                timeMin: dateRange?.start,
                timeMax: dateRange?.end
            });
            // Ensure we have at least one available slot
            const slots = (slotsResult && Array.isArray(slotsResult.slots)) ? slotsResult.slots : [];
            if (slots.length === 0) {
                return {
                    status: 'error',
                    message: 'No available time slots found'
                };
            }
            // Create meeting (mock)
            const meetingResult = await handleCalendarTool('calendar_create_meeting', {
                title: meetingTitle,
                start: slots[0].start,
                end: slots[0].end,
                attendees: [mockContact.email],
                description: agenda
            });
            // Send invite
            const inviteResult = await handleGmailTool('gmail_send', {
                to: [mockContact.email],
                subject: `Meeting Invitation: ${meetingTitle}`,
                body: `Hi ${mockContact.name},\n\nI'd like to schedule a meeting...\n\nAgenda:\n${agenda}`,
                dryRun: true
            });
            return {
                status: 'success',
                contact: mockContact,
                meeting: meetingResult,
                invite: inviteResult
            };
        }
        case 'workflow_schedule_and_invite': {
            return await handleWorkflowScheduleAndInvite(args);
        }
        case 'workflow_daily_briefing': {
            const days = args?.days ?? 1;
            const timeMin = new Date().toISOString();
            const timeMax = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
            const agenda = await handleCalendarTool('calendar_get_agenda', { timeMin, timeMax });
            const unreadFrom = args?.unreadFrom;
            let emails = null;
            if (unreadFrom) {
                emails = await handleGmailTool('gmail_search_unread_from', { from: unreadFrom, maxResults: args?.maxEmails ?? 10 });
            }
            return { status: 'ok', agenda, emails };
        }
        case 'workflow_followup_nudge': {
            // Heuristic: find messages in inbox older than N days with no recent reply
            const days = args?.days ?? 3;
            const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000);
            // Simple approximation: search inbox before cutoff and draft bump
            const search = await handleGmailTool('gmail_search', { query: `in:inbox older_than:${days}d`, maxResults: args?.maxThreads ?? 10 });
            const threads = ('threads' in search) ? (search.threads || []) : [];
            const subjectT = args?.subjectTemplate || 'Quick bump on this';
            const bodyT = args?.bodyTemplate || 'Hi — following up on this. Do you have a moment to take a look?';
            const drafts = threads.map((t) => ({
                threadId: t.id,
                draft: {
                    subject: subjectT,
                    bodyPreview: bodyT
                }
            }));
            if (args?.dryRun !== false) {
                return { status: 'dry_run', count: drafts.length, drafts };
            }
            // If real send is requested, convert drafts into replies
            const results = [];
            for (const d of drafts) {
                const r = await handleGmailTool('gmail_reply_latest', { fromQuery: '', body: d.draft.bodyPreview, dryRun: false });
                results.push(r);
            }
            return { status: 'ok', sent: results.length };
        }
        default:
            throw new Error(`Unknown workflow tool: ${name}`);
    }
}
// New handler for schedule_and_invite
export async function handleWorkflowScheduleAndInvite(args) {
    const { attendees, duration = 30, dateRange, title, agenda, dryRun = true } = args || {};
    const slotsResult = await handleCalendarTool('calendar_find_slots', {
        durationMinutes: duration,
        timeMin: dateRange?.start,
        timeMax: dateRange?.end
    });
    const slots = (slotsResult && Array.isArray(slotsResult.slots)) ? slotsResult.slots : [];
    if (slots.length === 0) {
        return { status: 'error', message: 'No available time slots found' };
    }
    const start = slots[0].start;
    const end = slots[0].end;
    const meeting = await handleCalendarTool('calendar_create_meeting', {
        title,
        start,
        end,
        attendees,
        addVideoLink: 'meet'
    });
    const invite = await handleGmailTool('gmail_send', {
        to: attendees,
        subject: `Invitation: ${title}`,
        body: `Agenda:\n${agenda || '(none)'}\n\nWhen: ${start} - ${end}`,
        dryRun
    });
    return { status: 'success', meeting, invite };
}
//# sourceMappingURL=workflow.handler.js.map