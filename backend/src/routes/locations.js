const express = require('express');
const { createLocation, getLocationCard, upsertLocationCard } = require('../controllers/locationController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.post('/', requireFields(['client_id', 'nome_sede']), createLocation);
router.get('/:id/card', getLocationCard);
router.put('/:id/card', upsertLocationCard);

module.exports = router;
