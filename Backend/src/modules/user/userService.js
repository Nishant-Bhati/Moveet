import User from './user.model.js';

export const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

export const updateUserProfile = async (id, profileData) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }

  user.name = profileData.name || user.name;
  if (profileData.password) {
    user.password = profileData.password;
  }

  const updatedUser = await user.save();
  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  };
};

export default {
  getUserById,
  updateUserProfile,
};
