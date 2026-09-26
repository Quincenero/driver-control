import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRegister, validateLogin } from '../middlewares/validator.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Rutas protegidas
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;