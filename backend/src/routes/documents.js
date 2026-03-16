const express = require('express');
const { listClientDocuments } = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/client/:clientId', listClientDocuments);

module.exports = router;
