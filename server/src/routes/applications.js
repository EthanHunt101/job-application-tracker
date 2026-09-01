const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const STATUSES = ['applied', 'oa', 'phone_screen', 'onsite', 'offer', 'rejected'];

// Every route in this file requires a valid JWT, and every query below is
// scoped to req.userId - a user can only ever see or touch their own rows.
router.use(requireAuth);

function isValidStatus(status) {
  return STATUSES.includes(status);
}

// POST /applications - create a new application for the logged-in user
router.post('/', async (req, res) => {
  const { company, role, status, date_applied, job_link, notes, source } = req.body || {};

  if (typeof company !== 'string' || !company.trim()) {
    return res.status(400).json({ error: 'company is required' });
  }
  if (typeof role !== 'string' || !role.trim()) {
    return res.status(400).json({ error: 'role is required' });
  }
  if (status !== undefined && !isValidStatus(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO applications (user_id, company, role, status, date_applied, job_link, notes, source)
       VALUES ($1, $2, $3, COALESCE($4, 'applied'), COALESCE($5, CURRENT_DATE), $6, $7, $8)
       RETURNING *`,
      [req.userId, company.trim(), role.trim(), status, date_applied, job_link, notes, source]
    );
    const application = result.rows[0];

    // Log the initial status as the first status_events row, so the funnel
    // history is complete from the moment an application is created.
    await pool.query(
      'INSERT INTO status_events (application_id, status) VALUES ($1, $2)',
      [application.id, application.status]
    );

    res.status(201).json({ application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /applications - list all applications belonging to the logged-in user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ applications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /applications/:id - get one application, only if it belongs to the logged-in user
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ application: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// PUT /applications/:id - edit an application; logs a status_events row if status changed
router.put('/:id', async (req, res) => {
  const { company, role, status, date_applied, job_link, notes, source } = req.body || {};

  if (status !== undefined && !isValidStatus(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }

  try {
    const existingResult = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    const existing = existingResult.rows[0];
    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = {
      company: company !== undefined ? company.trim() : existing.company,
      role: role !== undefined ? role.trim() : existing.role,
      status: status !== undefined ? status : existing.status,
      date_applied: date_applied !== undefined ? date_applied : existing.date_applied,
      job_link: job_link !== undefined ? job_link : existing.job_link,
      notes: notes !== undefined ? notes : existing.notes,
      source: source !== undefined ? source : existing.source,
    };

    const result = await pool.query(
      `UPDATE applications
       SET company = $1, role = $2, status = $3, date_applied = $4,
           job_link = $5, notes = $6, source = $7, updated_at = now()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        updated.company,
        updated.role,
        updated.status,
        updated.date_applied,
        updated.job_link,
        updated.notes,
        updated.source,
        req.params.id,
        req.userId,
      ]
    );
    const application = result.rows[0];

    if (updated.status !== existing.status) {
      await pool.query(
        'INSERT INTO status_events (application_id, status) VALUES ($1, $2)',
        [application.id, application.status]
      );
    }

    res.json({ application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// DELETE /applications/:id - delete an application, only if it belongs to the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
