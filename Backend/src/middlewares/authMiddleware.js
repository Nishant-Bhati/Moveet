import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';
import User from '../modules/user/user.model.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_placeholder');

      // Populate user info (excluding sensitive details like password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return sendError(res, 'Not authorized, user not found', 401);
      }

      return next();
    } catch (error) {
      return sendError(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 401);
  }
};

export default protect;
