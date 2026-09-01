exports.shorthands = undefined;

// Status is a plain text column with a CHECK constraint (not a Postgres ENUM type).
// A CHECK constraint is easier to alter later (ENUM types require ALTER TYPE and
// can't be changed inside a transaction on older PG versions) at the cost of the
// database not exposing a named enum type - a fine tradeoff for a project that
// will keep evolving its status pipeline.
const STATUSES = [
  'applied',
  'oa',
  'phone_screen',
  'onsite',
  'offer',
  'rejected',
];

exports.up = (pgm) => {
  pgm.createTable('applications', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'cascade',
    },
    company: { type: 'text', notNull: true },
    role: { type: 'text', notNull: true },
    status: {
      type: 'text',
      notNull: true,
      default: 'applied',
      check: `status IN (${STATUSES.map((s) => `'${s}'`).join(', ')})`,
    },
    date_applied: { type: 'date', notNull: true, default: pgm.func('current_date') },
    job_link: { type: 'text' },
    notes: { type: 'text' },
    source: { type: 'text' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('applications', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('applications');
};
