const express = require('express');
const { listProducts, createProduct } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.get('/', listProducts);
router.post('/', requireFields(['nome_commerciale']), createProduct);

module.exports = router;
