import express from 'express';
import { z } from 'zod';
import { login, verify } from './auth.controller.js';
import { sendError } from '../../utils/apiResponse.js';

const router = express.Router();

// Helper middleware to validate request body using Zod schemas
const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 'Validation failed', 400, errorDetails);
    }
    next(error);
  }
};

const loginSchema = z.object({
  phone: z.string().length(10, { message: 'Phone number must be exactly 10 characters long' }),
});

const verifySchema = z.object({
  phone: z.string().length(10, { message: 'Phone number must be exactly 10 characters long' }),
  otp: z.string().length(6, { message: 'OTP must be exactly 6 characters long' }),
});

router.post('/login', validateBody(loginSchema), login);
router.post('/verify', validateBody(verifySchema), verify);

export default router;
