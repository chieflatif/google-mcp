import { calendar_v3 } from '@googleapis/calendar';
import { getCalendarOAuthClient } from '../src/google/oauth.js';

const CAL_SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function main() {
  const eventId = process.argv[2];
  if (!eventId) throw new Error('Usage: tsx scripts/delete-event.ts <eventId>');
  const auth = await getCalendarOAuthClient(CAL_SCOPES);
  const cal = new calendar_v3.Calendar({ auth: auth as any });
  await cal.events.delete({ calendarId: 'primary', eventId });
  console.log(JSON.stringify({ ok: true, deletedEventId: eventId }, null, 2));
}

main().catch((err) => {
  console.error('Delete failed:', err?.message || err);
  process.exit(1);
});
