import 'dotenv/config';
import { handleCalendarTool } from '../src/handlers/calendar.handler.js';

function getTomorrowWindow() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0, 0, 0);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

function fmt(dtIso?: string | null) {
  if (!dtIso) return '';
  const d = new Date(dtIso);
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(d);
}

(async () => {
  const { timeMin, timeMax } = getTomorrowWindow();
  const res = await handleCalendarTool('calendar_get_agenda', { timeMin, timeMax });
  if (res.status !== 'ok') {
    console.log(JSON.stringify(res, null, 2));
    process.exit(1);
  }
  const events = (res.events || []) as Array<{ title?: string; start?: string; end?: string; attendees?: string[]; htmlLink?: string; hangoutLink?: string }>;
  const summary = {
    date: new Date(timeMin).toDateString(),
    count: events.length,
    items: events.map((e) => ({
      title: e.title || '(no title)',
      time: `${fmt(e.start)} – ${fmt(e.end)}`,
      attendees: e.attendees || [],
      link: e.htmlLink || undefined,
      video: e.hangoutLink || undefined,
    }))
  };
  console.log(JSON.stringify(summary, null, 2));
})().catch((err) => {
  console.error('Failed to fetch agenda:', err?.message || err);
  process.exit(1);
});
