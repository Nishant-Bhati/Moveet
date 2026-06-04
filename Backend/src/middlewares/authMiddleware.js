import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_placeholder');

      // Attach req.user with userId, _id (for backward compatibility), and phone
      req.user = {
        userId: decoded.userId,
        _id: decoded.userId,
        phone: decoded.phone,
      };

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
