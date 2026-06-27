const express = require('express');

const {
  createEmergency,
  endEmergency,
  getActiveEmergency,
  getEmergency,
  listEmergencies,
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateEmergencyId,
  validateInitialLocation,
} = require('../validators/emergencyValidator');

const router = express.Router();

router.use(protect);

router.post('/', validateInitialLocation, createEmergency);
router.get('/active', getActiveEmergency);
router.get('/', listEmergencies);
router.get('/:emergencyId', validateEmergencyId, getEmergency);
router.patch('/:emergencyId/end', validateEmergencyId, endEmergency);

module.exports = router;
