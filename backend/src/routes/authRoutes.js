const express = require('express');

const { getMe, login, register } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateLogin, validateRegister } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;
