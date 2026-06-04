import userService from './userService.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user._id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, user, 'User profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user._id, req.body);
    return sendSuccess(res, updatedUser, 'Profile updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
};
