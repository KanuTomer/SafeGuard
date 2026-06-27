const {
  addUserContact,
  deleteUserContact,
  getUserContacts,
  getUserProfile,
  updateUserContact,
  updateUserProfile,
} = require('../services/userService');
const { sendSuccess } = require('../utils/apiResponse');

const getMe = (req, res) => {
  return sendSuccess(res, 200, 'User profile retrieved successfully', {
    user: getUserProfile(req.user),
  });
};

const updateMe = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user, req.body);
    return sendSuccess(res, 200, 'User profile updated successfully', { user });
  } catch (error) {
    return next(error);
  }
};

const listContacts = (req, res) => {
  return sendSuccess(res, 200, 'Emergency contacts retrieved successfully', {
    contacts: getUserContacts(req.user),
  });
};

const createContact = async (req, res, next) => {
  try {
    const contact = await addUserContact(req.user, req.body);
    return sendSuccess(res, 201, 'Emergency contact added successfully', { contact });
  } catch (error) {
    return next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await updateUserContact(req.user, req.params.contactId, req.body);
    return sendSuccess(res, 200, 'Emergency contact updated successfully', { contact });
  } catch (error) {
    return next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    await deleteUserContact(req.user, req.params.contactId);
    return sendSuccess(res, 200, 'Emergency contact deleted successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createContact,
  deleteContact,
  getMe,
  listContacts,
  updateContact,
  updateMe,
};
