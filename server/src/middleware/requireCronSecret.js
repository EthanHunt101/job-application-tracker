// Protects endpoints meant to be triggered by a scheduler/operator, not a
// logged-in user - so this checks a shared secret header instead of a JWT.
// This is the same pattern real hosting platforms use for HTTP-triggered
// cron jobs (e.g. Render Cron Jobs hitting a URL with a secret query param
// or header) - a plain, pre-shared secret rather than a full auth system,
// since the caller isn't a "user" with an account at all.
function requireCronSecret(req, res, next) {
  const provided = req.headers['x-cron-secret'];
  if (!provided || provided !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Invalid or missing cron secret' });
  }
  next();
}

module.exports = requireCronSecret;
