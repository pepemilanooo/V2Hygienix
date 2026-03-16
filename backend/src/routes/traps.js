const express = require('express');
const { listTrapsByLocation, createTrap } = require('../controllers/trapController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.get('/location/:locationId', listTrapsByLocation);
router.post('/', requireFields(['location_id', 'codice', 'tipo']), createTrap);

module.exports = router;
