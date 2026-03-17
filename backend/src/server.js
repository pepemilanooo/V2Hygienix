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

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
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
