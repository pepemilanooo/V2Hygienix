const pool = require('../config/database');

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { query };
