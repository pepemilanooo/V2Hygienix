const express = require('express');
const { login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.post('/login', requireFields(['email', 'password']), login);
router.get('/me', authenticate, me);

module.exports = router;
