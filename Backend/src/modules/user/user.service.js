import User from './user.model.js';
import UserPreferences from './userPreferences.model.js';
import EmergencyContact from './emergencyContact.model.js';

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    id: user.publicUserId,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone,
    kycStatus: user.kycStatus,
    walletBalance: user.walletBalance,
    activePlanId: user.activePlanId || null,
    planExpiryDate: user.planExpiryDate || null,
    autoRenew: user.autoRenew,
    notifications: [], // Placeholder for notifications array
  };
};

export const updateProfile = async (userId, body) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (body.firstName !== undefined) user.firstName = body.firstName;
  if (body.lastName !== undefined) user.lastName = body.lastName;
  if (body.email !== undefined) user.email = body.email;

  const updatedUser = await user.save();

  return {
    id: updatedUser.publicUserId,
    firstName: updatedUser.firstName || '',
    lastName: updatedUser.lastName || '',
    email: updatedUser.email || '',
    phone: updatedUser.phone,
    kycStatus: updatedUser.kycStatus,
    walletBalance: updatedUser.walletBalance,
    activePlanId: updatedUser.activePlanId || null,
    planExpiryDate: updatedUser.planExpiryDate || null,
    autoRenew: updatedUser.autoRenew,
    notifications: [],
  };
};

export const updatePreferences = async (userId, body) => {
  return await UserPreferences.findOneAndUpdate(
    { userId },
    { $set: body },
    { new: true, upsert: true }
  );
};

export const updateContacts = async (userId, body) => {
  const contactsList = Array.isArray(body) ? body : (body.contacts || []);
  
  return await EmergencyContact.findOneAndUpdate(
    { userId },
    { contacts: contactsList },
    { new: true, upsert: true }
  );
};

export const toggleAutoRenew = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.autoRenew = !user.autoRenew;
  await user.save();

  return { autoRenew: user.autoRenew };
};

export default {
  getMe,
  updateProfile,
  updatePreferences,
  updateContacts,
  toggleAutoRenew,
};
