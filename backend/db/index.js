const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://kfashn_user:yourpassword@localhost:5432/kfashn',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
