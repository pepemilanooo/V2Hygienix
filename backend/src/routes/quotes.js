const express = require('express');
const { listQuotes, createQuote } = require('../controllers/quoteController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.get('/', listQuotes);
router.post('/', requireFields(['client_id', 'numero_preventivo', 'oggetto']), createQuote);

module.exports = router;
