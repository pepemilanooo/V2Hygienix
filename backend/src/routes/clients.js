const express = require('express');
const { listClients, getClient, createClient, updateClient } = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', requireFields(['ragione_sociale']), createClient);
router.put('/:id', updateClient);

module.exports = router;
