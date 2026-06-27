const express = require('express');

const {
  createContact,
  deleteContact,
  getMe,
  listContacts,
  updateContact,
  updateMe,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateCreateContact,
  validateProfileUpdate,
  validateUpdateContact,
} = require('../validators/userValidator');

const router = express.Router();

router.use(protect);

router.get('/me', getMe);
router.patch('/me', validateProfileUpdate, updateMe);
router.get('/me/contacts', listContacts);
router.post('/me/contacts', validateCreateContact, createContact);
router.patch('/me/contacts/:contactId', validateUpdateContact, updateContact);
router.delete('/me/contacts/:contactId', deleteContact);

module.exports = router;
