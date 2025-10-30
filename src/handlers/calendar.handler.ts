import { calendar_v3 } from '@googleapis/calendar';
import { getCalendarOAuthClient } from '../google/oauth.js';
import { handleGoogleApiError, validateRequired, retryWithBackoff } from '../utils/error-handler.js';

const CAL_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

async function getCalendar(): Promise<calendar_v3.Calendar> {
  const auth = await getCalendarOAuthClient(CAL_SCOPES);
  return new calendar_v3.Calendar({ auth: auth as any });
}

/**
 * Handle Google Calendar tool operations with production-grade error handling
 */
export async function handleCalendarTool(name: string, args: any) {
  try {
    switch (name) {
      case 'calendar_find_slots': {
        const calendarId = args?.calendarId || 'primary';
        const durationMinutes = args?.durationMinutes ?? args?.duration ?? 30;
        const timeMin = args?.timeMin ?? args?.dateRange?.start ?? new Date().toISOString();
        const timeMax = args?.timeMax ?? args?.dateRange?.end ?? new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
        
        return await retryWithBackoff(async () => {
          const cal = await getCalendar();
          const startIso = timeMin;
          const endIso = timeMax;
          
          const fb = await cal.freebusy.query({
            requestBody: {
              timeMin: startIso,
              timeMax: endIso,
              items: [{ id: calendarId }]
            }
          });
          
          const busy = fb.data.calendars?.[calendarId]?.busy || [];
          const slots: Array<{ start: string; end: string }> = [];
          let cursor = new Date(startIso).getTime();
          const end = new Date(endIso).getTime();
          const step = durationMinutes * 60 * 1000;
          const busyWindows = busy.map(b => [new Date(b.start!).getTime(), new Date(b.end!).getTime()] as const);
          
          while (cursor + step <= end) {
            const s = cursor;
            const e = cursor + step;
            const overlaps = busyWindows.some(([bs, be]) => !(e <= bs || s >= be));
            if (!overlaps) {
              slots.push({ start: new Date(s).toISOString(), end: new Date(e).toISOString() });
            }
            cursor += step;
          }
          
          return { status: 'ok', count: slots.length, slots };
        });
      }

      case 'calendar_create_meeting': {
        const validationError = validateRequired(args, ['title', 'start', 'end']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { title, start, end, attendees = [], calendarId = 'primary', description, location } = args || {};
        const addVideoLink = args?.addVideoLink ?? 'meet';
        const createMeet = addVideoLink === 'meet';
        
        return await retryWithBackoff(async () => {
          const cal = await getCalendar();
          const requestBody: calendar_v3.Schema$Event = {
            summary: title,
            start: { dateTime: start },
            end: { dateTime: end },
            attendees: (attendees as string[]).map(e => ({ email: e })),
          };
          
          if (description) requestBody.description = description;
          if (location) requestBody.location = location;
          
          if (createMeet) {
            requestBody.conferenceData = {
              createRequest: { requestId: `req-${Date.now()}` }
            } as any;
          }
          
          const res = await cal.events.insert({
            calendarId,
            requestBody,
            conferenceDataVersion: createMeet ? 1 : undefined
          });
          
          return { 
            status: 'ok', 
            eventId: res.data.id, 
            htmlLink: res.data.htmlLink, 
            hangoutLink: (res.data.conferenceData as any)?.entryPoints?.[0]?.uri 
          };
        });
      }

      case 'calendar_get_agenda': {
        const calendarId = args?.calendarId || 'primary';
        let timeMin = args?.timeMin as string | undefined;
        let timeMax = args?.timeMax as string | undefined;
        const days = args?.days as number | undefined;
        
        if (!timeMin || !timeMax) {
          const now = new Date();
          timeMin = now.toISOString();
          const end = new Date(now.getTime() + (days ?? 1) * 24 * 3600 * 1000);
          timeMax = end.toISOString();
        }
        
        return await retryWithBackoff(async () => {
          const cal = await getCalendar();
          const res = await cal.events.list({ 
            calendarId, 
            timeMin, 
            timeMax, 
            singleEvents: true, 
            orderBy: 'startTime',
            maxResults: 250
          });
          
          const events = (res.data.items || []).map(e => ({
            id: e.id,
            title: e.summary,
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
            attendees: (e.attendees || []).map(a => a.email),
            htmlLink: e.htmlLink,
            hangoutLink: (e.conferenceData as any)?.entryPoints?.[0]?.uri,
            description: e.description,
            location: e.location
          }));
          
          return { status: 'ok', count: events.length, events };
        });
      }

      case 'calendar_quick_add': {
        const validationError = validateRequired(args, ['text']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { text, calendarId = 'primary' } = args || {};
        
        return await retryWithBackoff(async () => {
          const cal = await getCalendar();
          const res = await cal.events.quickAdd({ calendarId, text });
          
          return { 
            status: 'ok', 
            eventId: res.data.id, 
            htmlLink: res.data.htmlLink 
          };
        });
      }

      case 'calendar_delete_event': {
        const validationError = validateRequired(args, ['eventId']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { eventId, calendarId = 'primary' } = args || {};
        
        return await retryWithBackoff(async () => {
          const cal = await getCalendar();
          await cal.events.delete({ calendarId, eventId });
          
          return { status: 'ok', deletedEventId: eventId };
        });
      }

      case 'calendar_reschedule_event': {
        const validationError = validateRequired(args, ['eventId']);
        if (validationError) {
          return { status: 'error', error: validationError };
        }

        const { eventId, calendarId = 'primary', start, end, title, description, notifyAttendees = true } = args || {};
        
        return await retryWithBackoff(async () => {
          const cal = await getCalendar();
          const patch: calendar_v3.Schema$Event = {};
          
          if (start) patch.start = { dateTime: start };
          if (end) patch.end = { dateTime: end };
          if (title) patch.summary = title;
          if (description) patch.description = description;
          
          const res = await cal.events.patch({
            calendarId,
            eventId,
            requestBody: patch,
            sendUpdates: notifyAttendees ? 'all' : 'none'
          });
          
          return { 
            status: 'ok', 
            eventId: res.data.id, 
            htmlLink: res.data.htmlLink 
          };
        });
      }

      default:
        return {
          status: 'error',
          error: `Unknown Calendar tool: ${name}`
        };
    }
  } catch (error: any) {
    return handleGoogleApiError(error, name);
  }
}
