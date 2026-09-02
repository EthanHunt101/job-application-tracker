exports.shorthands = undefined;

// Tracks when an application last got a reminder email, so the weekly-reminder
// job knows which applications are "due" (never reminded + 7 days old, or
// last reminded 7+ days ago) without needing a separate log table.
exports.up = (pgm) => {
  pgm.addColumn('applications', {
    last_reminder_at: { type: 'timestamptz' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('applications', 'last_reminder_at');
};
