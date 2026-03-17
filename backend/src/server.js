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
// TEMP: Endpoint di migrate - crea tutte le tabelle direttamente
app.get('/api/migrate', async (req, res) => {
  try {
    const pool = require('./config/database');
    
    const migrations = [
      { name: 'extensions', sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` },
      
      { name: 'users', sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome VARCHAR(100) NOT NULL,
          cognome VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          telefono VARCHAR(50),
          ruolo VARCHAR(20) NOT NULL CHECK (ruolo IN ('admin', 'tecnico')),
          attivo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'clients', sql: `
        CREATE TABLE IF NOT EXISTS clients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          ragione_sociale VARCHAR(255) NOT NULL,
          indirizzo VARCHAR(255),
          citta VARCHAR(100),
          cap VARCHAR(20),
          provincia VARCHAR(10),
          telefono VARCHAR(50),
          email VARCHAR(255),
          piva VARCHAR(50),
          cf VARCHAR(50),
          consulente VARCHAR(255),
          numero_consulente VARCHAR(50),
          note TEXT,
          attivo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'locations', sql: `
        CREATE TABLE IF NOT EXISTS locations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          nome VARCHAR(255) NOT NULL,
          indirizzo VARCHAR(255),
          citta VARCHAR(100),
          cap VARCHAR(20),
          provincia VARCHAR(10),
          latitudine DECIMAL(10,8),
          longitudine DECIMAL(11,8),
          note TEXT,
          attivo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'pest_types', sql: `
        CREATE TABLE IF NOT EXISTS pest_types (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome VARCHAR(100) NOT NULL,
          descrizione TEXT,
          categoria VARCHAR(50)
        );
      `},
      
      { name: 'treatment_methods', sql: `
        CREATE TABLE IF NOT EXISTS treatment_methods (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome VARCHAR(100) NOT NULL,
          descrizione TEXT
        );
      `},
      
      { name: 'products', sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          codice VARCHAR(50) UNIQUE NOT NULL,
          nome VARCHAR(255) NOT NULL,
          descrizione TEXT,
          unita_misura VARCHAR(50) DEFAULT 'pz',
          prezzo_unitario DECIMAL(10,2) DEFAULT 0,
          attivo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'interventions', sql: `
        CREATE TABLE IF NOT EXISTS interventions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          numero VARCHAR(50) UNIQUE NOT NULL,
          location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
          tecnico_id UUID REFERENCES users(id),
          data_intervento DATE NOT NULL,
          ora_inizio TIME,
          ora_fine TIME,
          tipo_trattamento VARCHAR(50),
          note TEXT,
          stato VARCHAR(20) DEFAULT 'pianificato',
          firma_cliente TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'traps', sql: `
        CREATE TABLE IF NOT EXISTS traps (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
          codice VARCHAR(50) NOT NULL,
          tipo VARCHAR(50),
          posizione_descrizione TEXT,
          latitudine DECIMAL(10,8),
          longitudine DECIMAL(11,8),
          attivo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(location_id, codice)
        );
      `},
      
      { name: 'trap_checks', sql: `
        CREATE TABLE IF NOT EXISTS trap_checks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          trap_id UUID NOT NULL REFERENCES traps(id) ON DELETE CASCADE,
          data_controllo DATE NOT NULL,
          stato VARCHAR(50),
          note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'quotes', sql: `
        CREATE TABLE IF NOT EXISTS quotes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          numero VARCHAR(50) UNIQUE NOT NULL,
          client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          data_emissione DATE NOT NULL,
          importo_totale DECIMAL(12,2) DEFAULT 0,
          note TEXT,
          stato VARCHAR(20) DEFAULT 'bozza',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'invoices', sql: `
        CREATE TABLE IF NOT EXISTS invoices (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          numero VARCHAR(50) UNIQUE NOT NULL,
          client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          data_emissione DATE NOT NULL,
          importo_totale DECIMAL(12,2) DEFAULT 0,
          stato VARCHAR(20) DEFAULT 'emessa',
          note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'documents', sql: `
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          nome_file VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          tipo VARCHAR(100),
          descrizione TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'surveys', sql: `
        CREATE TABLE IF NOT EXISTS surveys (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          numero VARCHAR(50) UNIQUE NOT NULL,
          client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          data_sopralluogo DATE NOT NULL,
          infestazione_tipo VARCHAR(100),
          note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `},
      
      { name: 'notifications', sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          tipo VARCHAR(50) NOT NULL,
          titolo VARCHAR(255) NOT NULL,
          messaggio TEXT,
          letta BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `}
    ];

    const results = [];
    
    for (const migration of migrations) {
      try {
        await pool.query(migration.sql);
        results.push({ table: migration.name, status: 'created' });
      } catch (error) {
        if (error.message.includes('already exists')) {
          results.push({ table: migration.name, status: 'already_exists' });
        } else {
          results.push({ table: migration.name, status: 'error', error: error.message });
        }
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
