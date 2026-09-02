const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const reminderRoutes = require('./routes/reminders');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ server: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ server: 'ok', db: 'unavailable', error: err.message });
  }
});

app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);
app.use('/reminders', reminderRoutes);

module.exports = app;
