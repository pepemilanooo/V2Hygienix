const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const locationRoutes = require('./routes/locations');
const trapRoutes = require('./routes/traps');
const productRoutes = require('./routes/products');
const interventionRoutes = require('./routes/interventions');
const surveyRoutes = require('./routes/surveys');
const quoteRoutes = require('./routes/quotes');
const invoiceRoutes = require('./routes/invoices');
const documentRoutes = require('./routes/documents');

const app = express();

// TEMP: Endpoint di seed per inizializzare il database
app.get('/api/seed', async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const { hashPassword } = require('./utils/security');
    const pool = require('./config/database');
    
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

    res.json({ 
      status: 'ok', 
      message: 'Seed completato',
      adminCreated: existing.rows.length === 0,
      adminEmail: adminEmail,
      adminPassword: 'Admin123!'
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      error: error.toString()
    });
  }
});

// TEMP: Endpoint di migrate
app.get('/api/migrate', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const pool = require('./config/database');
    
    const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      return res.status(500).json({
        status: 'error',
        message: 'Migrations directory not found: ' + migrationsDir
      });
    }
    
    const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const results = [];
    for (const file of files) {
      const already = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
      if (already.rows.length > 0) {
        results.push({ file, status: 'skipped' });
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await pool.query('COMMIT');
        results.push({ file, status: 'executed' });
      } catch (error) {
        await pool.query('ROLLBACK');
        results.push({ file, status: 'error', error: error.message });
      }
    }

    res.json({ 
      status: 'ok', 
      message: 'Migrazioni completate',
      migrations: results
    });
  } catch (error) {
    console.error('Migrate error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      error: error.toString()
    });
  }
});

app.use(helmet());
app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

const mockStorageDir = path.join(__dirname, '..', 'mock-storage');
if (!fs.existsSync(mockStorageDir)) {
  fs.mkdirSync(mockStorageDir, { recursive: true });
}
app.use('/mock-storage', express.static(mockStorageDir));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hygienix-backend',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/traps', trapRoutes);
app.use('/api/products', productRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/documents', documentRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Hygienix backend avviato sulla porta ${env.port}`);
});
