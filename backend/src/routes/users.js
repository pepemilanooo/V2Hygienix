const express = require('express');
const { listUsers, getUser, createUser, updateUser, updatePassword } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, authorize('admin'));
router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', requireFields(['nome', 'cognome', 'email', 'ruolo', 'password']), createUser);
router.put('/:id', updateUser);
router.put('/:id/password', requireFields(['password']), updatePassword);

module.exports = router;
