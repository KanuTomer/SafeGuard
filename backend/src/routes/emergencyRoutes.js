const express = require('express');

const {
  createEmergency,
  endEmergency,
  getActiveEmergency,
  getEmergency,
  listEmergencies,
} = require('../controllers/emergencyController');
const { createLocation, listLocations } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateEmergencyId,
  validateInitialLocation,
} = require('../validators/emergencyValidator');
const { validateCreateLocation } = require('../validators/locationValidator');

const router = express.Router();

router.use(protect);

router.post('/', validateInitialLocation, createEmergency);
router.get('/active', getActiveEmergency);
router.get('/', listEmergencies);
router.post('/:emergencyId/locations', validateEmergencyId, validateCreateLocation, createLocation);
router.get('/:emergencyId/locations', validateEmergencyId, listLocations);
router.get('/:emergencyId', validateEmergencyId, getEmergency);
router.patch('/:emergencyId/end', validateEmergencyId, endEmergency);

module.exports = router;
