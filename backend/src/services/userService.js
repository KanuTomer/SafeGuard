const formatContact = (contact) => ({
  id: contact._id.toString(),
  name: contact.name,
  phone: contact.phone || '',
  email: contact.email || '',
  relationship: contact.relationship || '',
});

const formatUserProfile = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  contacts: user.contacts.map(formatContact),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createUserError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getUserProfile = (user) => {
  return formatUserProfile(user);
};

const updateUserProfile = async (user, updates) => {
  if (updates.name !== undefined) {
    user.name = updates.name.trim();
  }

  if (updates.phone !== undefined) {
    user.phone = updates.phone.trim();
  }

  await user.save();
  return formatUserProfile(user);
};

const getUserContacts = (user) => {
  return user.contacts.map(formatContact);
};

const addUserContact = async (user, contactData) => {
  user.contacts.push({
    name: contactData.name.trim(),
    phone: contactData.phone ? contactData.phone.trim() : '',
    email: contactData.email ? contactData.email.trim().toLowerCase() : '',
    relationship: contactData.relationship ? contactData.relationship.trim() : '',
  });

  await user.save();
  return formatContact(user.contacts[user.contacts.length - 1]);
};

const findContactById = (user, contactId) => {
  const contact = user.contacts.id(contactId);

  if (!contact) {
    throw createUserError('Contact not found', 404);
  }

  return contact;
};

const updateUserContact = async (user, contactId, updates) => {
  const contact = findContactById(user, contactId);

  if (updates.name !== undefined) {
    contact.name = updates.name.trim();
  }

  if (updates.phone !== undefined) {
    contact.phone = updates.phone.trim();
  }

  if (updates.email !== undefined) {
    contact.email = updates.email.trim().toLowerCase();
  }

  if (updates.relationship !== undefined) {
    contact.relationship = updates.relationship.trim();
  }

  await user.save();
  return formatContact(contact);
};

const deleteUserContact = async (user, contactId) => {
  const contact = findContactById(user, contactId);
  contact.deleteOne();

  await user.save();
};

module.exports = {
  addUserContact,
  deleteUserContact,
  formatUserProfile,
  getUserContacts,
  getUserProfile,
  updateUserContact,
  updateUserProfile,
};
