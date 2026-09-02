const express = require('express');
const requireCronSecret = require('../middleware/requireCronSecret');
const { sendDueReminders } = require('../jobs/sendReminders');

const router = express.Router();

// POST /reminders/send-now - manually fire the same job the scheduled cron
// runs. Useful for testing locally (nobody wants to wait 7 real days to
// verify this works) and, once deployed, as a backup way to trigger it from
// an external scheduler instead of relying on the Node process's own timer.
router.post('/send-now', requireCronSecret, async (req, res) => {
  try {
    const result = await sendDueReminders();
    res.json(result);
  } catch (err) {
    console.error('Failed to send reminders:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
