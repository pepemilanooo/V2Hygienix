const express = require('express');
const { listInterventions, createIntervention, completeIntervention } = require('../controllers/interventionController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.get('/', listInterventions);
router.post('/', requireFields(['client_id', 'location_id']), createIntervention);
router.post('/:id/complete', completeIntervention);

module.exports = router;
