const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../utils/security');
const pool = require('../config/database');

async function run() {
  const adminEmail = 'admin@hygienix.it';
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

  if (existing.rows.length === 0) {
    const passwordHash = await hashPassword('Admin123!');
    await pool.query(
      `INSERT INTO users (id, nome, cognome, email, password_hash, telefono, ruolo, attivo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
      [uuidv4(), 'Admin', 'Hygienix', adminEmail, passwordHash, '+39 320 0000000', 'admin']
    );
  }

  await pool.query(`
    INSERT INTO pest_types (id, nome, descrizione, categoria) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Zanzare', 'Infestazione zanzare', 'insetti'),
    ('20000000-0000-0000-0000-000000000002', 'Ratti', 'Infestazione roditori', 'roditori'),
    ('20000000-0000-0000-0000-000000000003', 'Blatte', 'Infestazione blatte', 'insetti')
    ON CONFLICT (id) DO NOTHING
  `);

  await pool.query(`
    INSERT INTO treatment_methods (id, nome, descrizione) VALUES
    ('30000000-0000-0000-0000-000000000001', 'Larvicida', 'Trattamento larvicida'),
    ('30000000-0000-0000-0000-000000000002', 'Adulticida', 'Trattamento adulticida'),
    ('30000000-0000-0000-0000-000000000003', 'Derattizzazione', 'Trattamento derattizzazione')
    ON CONFLICT (id) DO NOTHING
  `);

  await pool.end();
  console.log('Seed completato');
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
