const pool = require('../db');
const { sendWeeklyReminderEmail } = require('../email');

// Once an application reaches one of these, it's "resolved" - no more
// reminders needed.
const TERMINAL_STATUSES = ['offer', 'rejected'];
const REMINDER_INTERVAL_DAYS = 7;

// Finds every non-terminal application that's either never been reminded
// (and is old enough to warrant a first one) or hasn't been reminded in
// REMINDER_INTERVAL_DAYS, emails each one, and stamps last_reminder_at so it
// isn't picked up again until the interval passes once more.
//
// Checking "due" on every run (rather than only running exactly once a
// week) makes this resilient to the server being restarted or offline for a
// stretch - nothing gets permanently skipped, it just goes out a bit late.
async function sendDueReminders() {
  const dueResult = await pool.query(
    `SELECT applications.*, users.email AS user_email
     FROM applications
     JOIN users ON users.id = applications.user_id
     WHERE applications.status <> ALL($1)
       AND (
         (applications.last_reminder_at IS NULL AND applications.created_at <= NOW() - make_interval(days => $2))
         OR applications.last_reminder_at <= NOW() - make_interval(days => $2)
       )`,
    [TERMINAL_STATUSES, REMINDER_INTERVAL_DAYS]
  );

  let sent = 0;
  let failed = 0;

  for (const app of dueResult.rows) {
    try {
      await sendWeeklyReminderEmail({
        to: app.user_email,
        company: app.company,
        role: app.role,
        status: app.status,
      });
      await pool.query('UPDATE applications SET last_reminder_at = now() WHERE id = $1', [app.id]);
      sent += 1;
    } catch (err) {
      console.error(`Failed to send reminder for application ${app.id}:`, err.message);
      failed += 1;
    }
  }

  return { checked: dueResult.rows.length, sent, failed };
}

module.exports = { sendDueReminders, TERMINAL_STATUSES, REMINDER_INTERVAL_DAYS };
