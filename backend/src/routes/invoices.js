const express = require('express');
const { listInvoices, createInvoice } = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.get('/', listInvoices);
router.post('/', requireFields(['client_id', 'numero_fattura']), createInvoice);

module.exports = router;
