const { loginUser, registerUser, formatUser } = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const authData = await registerUser(req.body);
    return sendSuccess(res, 201, 'User registered successfully', authData);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const authData = await loginUser(req.body);
    return sendSuccess(res, 200, 'Login successful', authData);
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Current user retrieved successfully', {
    user: formatUser(req.user),
  });
};

module.exports = {
  getMe,
  login,
  register,
};
