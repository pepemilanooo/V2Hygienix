const { Pool } = require('pg');
const env = require('./env');

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL mancante');
}

const ssl = env.databaseUrl.includes('localhost')
  ? false
  : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl
});

module.exports = pool;
