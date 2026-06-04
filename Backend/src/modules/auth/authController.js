import authService from './authService.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error) {
    if (error.message === 'User already exists') {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, result, 'User logged in successfully', 200);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return sendError(res, error.message, 401);
    }
    next(error);
  }
};

export default {
  register,
  login,
};
