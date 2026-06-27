const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const normalizeEmail = (email) => email.trim().toLowerCase();

const createAuthError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
});

const registerUser = async ({ name, email, password, phone }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createAuthError('Email is already registered', 409);
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone ? phone.trim() : '',
  });

  return {
    user: formatUser(user),
    token: generateToken(user._id),
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw createAuthError('Invalid email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw createAuthError('Invalid email or password', 401);
  }

  return {
    user: formatUser(user),
    token: generateToken(user._id),
  };
};

module.exports = {
  formatUser,
  loginUser,
  registerUser,
};
