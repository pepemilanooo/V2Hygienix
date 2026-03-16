const express = require('express');
const { listSurveys, createSurvey, completeSurvey } = require('../controllers/surveyController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);
router.get('/', listSurveys);
router.post('/', requireFields(['client_id', 'location_id', 'tipo_modulo']), createSurvey);
router.post('/:id/complete', completeSurvey);

module.exports = router;
