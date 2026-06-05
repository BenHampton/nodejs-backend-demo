import { Router } from 'express';
import helloRoutes from './v1/hello.routes.js';
import authRoutes from './v1/auth.routes.js';
import authHelloRoutes from './v1/auth-hello.routes.js';
import authHelloV2Routes from './v2/auth-hello.routes.js';
import authUserRoutes from './v1/users.routes.js';
import authNotificationsRoutes from './v1/notification.routes.js';
import { deprecate } from '../middleware/deprecate.js';

const router = Router();

// public endpoints
router.use('/v1/hello', helloRoutes);

// authenticated endpoints
router.use('/v1/auth', deprecate('Thur, 04 Jun 2026 10:30:49 GMT'), authRoutes);

router.use('/v1/auth-hello', authHelloRoutes);
router.use('/v2/auth-hello', authHelloV2Routes);

router.use('/v1/users', authUserRoutes);

router.use('/v1/notifications', authNotificationsRoutes);

export default router;
