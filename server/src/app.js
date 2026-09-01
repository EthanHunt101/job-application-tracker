const express = require('express');
const cors = require('cors');
const pool = require('./db');
const requireAuth = require('./middleware/requireAuth');
const authRoutes = require('./routes/auth');

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

// Temporary protected route, just to prove requireAuth + JWTs work end-to-end.
// Will be replaced by real application routes in Step 4.
app.get('/auth/me', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.userId]);
  res.json({ user: result.rows[0] });
});

module.exports = app;
