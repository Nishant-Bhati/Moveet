import express from 'express';
import { body } from 'express-validator';
import { register, login } from './authController.js';
import validateRequest from '../../middlewares/validationMiddleware.js';

const router = express.Router();

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateRequest,
];

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

export default router;
