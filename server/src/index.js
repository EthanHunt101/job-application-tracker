require('dotenv').config({ quiet: true });
const cron = require('node-cron');
const app = require('./app');
const { sendDueReminders } = require('./jobs/sendReminders');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Checks daily for applications due a reminder (the job itself decides
// "due" based on a 7-day interval per application - see sendReminders.js).
// This only fires while this process is running, which is why the manual
// POST /reminders/send-now route exists too - for local testing now, and as
// a fallback trigger once this is deployed somewhere that isn't always on.
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled reminder check...');
  try {
    const result = await sendDueReminders();
    console.log('Reminder check complete:', result);
  } catch (err) {
    console.error('Scheduled reminder check failed:', err);
  }
});
