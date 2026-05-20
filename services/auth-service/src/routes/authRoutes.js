import express from 'express';
import { getMe, login, logout, refreshToken, register } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

export default router;