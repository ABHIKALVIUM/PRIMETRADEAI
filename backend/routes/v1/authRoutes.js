import express from 'express';
import { register, login, getMe } from '../../controllers/authController.js';
import { validateUserRegistration, validateUserLogin } from '../../middlewares/validateMiddleware.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.get('/me', protect, getMe);

export default router;