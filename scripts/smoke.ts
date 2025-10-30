import { handleWorkflowTool } from '../src/handlers/workflow.handler.js';
async function main() {
  const now = new Date();
  const start = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  const end = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
  const briefing = await handleWorkflowTool('workflow_daily_briefing', { days: 1, unreadFrom: 'in:inbox', maxEmails: 5 });
  const schedule = await handleWorkflowTool('workflow_schedule_and_invite', { attendees: ['latifhorst@gmail.com'], duration: 30, dateRange: { start, end }, title: 'Smoke Demo', agenda: 'Smoke agenda', dryRun: true });
  const nudge = await handleWorkflowTool('workflow_followup_nudge', { days: 3, maxThreads: 3, dryRun: true });
  console.log(JSON.stringify({ briefing, schedule, nudge }, null, 2));
}
main().catch(err => { console.error('Smoke failed:', err?.message || err); process.exit(1); });
