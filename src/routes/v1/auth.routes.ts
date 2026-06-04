import { Router } from 'express';
import { authLimiter } from '../../middleware/rateLimiter.js';
import validate from '../../middleware/validate.js';
import { loginSchema, registerSchema } from '../../types/auth.dto.js';
import * as ctrl from '../../controllers/auth.controller.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

export default router;
