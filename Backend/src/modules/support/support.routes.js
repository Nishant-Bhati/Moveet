import express from 'express';
import supportController from './support.controller.js';

const router = express.Router();

router.get('/support/contact', supportController.getSupportContact);

export default router;
