import userService from './user.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(req.user.userId);
    return sendSuccess(res, user, 'Profile retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.userId, req.body);
    return sendSuccess(res, user, 'Profile updated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const preferences = await userService.updatePreferences(req.user.userId, req.body);
    return sendSuccess(res, preferences, 'Preferences updated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const updateContacts = async (req, res, next) => {
  try {
    const contacts = await userService.updateContacts(req.user.userId, req.body);
    return sendSuccess(res, contacts, 'Emergency contacts updated successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const toggleAutoRenew = async (req, res, next) => {
  try {
    const result = await userService.toggleAutoRenew(req.user.userId);
    return sendSuccess(res, result, 'Auto renew toggled successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export default {
  getMe,
  updateProfile,
  updatePreferences,
  updateContacts,
  toggleAutoRenew,
};
