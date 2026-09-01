exports.shorthands = undefined;

// One row per status change on an application. This history (not just the
// current `applications.status` field) is what powers funnel/analytics
// features later (time-in-stage, drop-off by stage, etc.).
exports.up = (pgm) => {
  pgm.createTable('status_events', {
    id: 'id',
    application_id: {
      type: 'integer',
      notNull: true,
      references: 'applications',
      onDelete: 'cascade',
    },
    status: { type: 'text', notNull: true },
    changed_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('status_events', 'application_id');
};

exports.down = (pgm) => {
  pgm.dropTable('status_events');
};
