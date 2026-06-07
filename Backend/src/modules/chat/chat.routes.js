import express from 'express';
import { z } from 'zod';
import protect from '../../middlewares/authMiddleware.js';
import validateRequest from '../../middlewares/validationMiddleware.js';
import { sendSuccess } from '../../utils/apiResponse.js';

const router = express.Router();

const sendChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

router.post('/send', protect, validateRequest(sendChatSchema), (req, res) => {
  return sendSuccess(res, { message: req.body.message }, 'Message sent successfully');
});

export default router;
