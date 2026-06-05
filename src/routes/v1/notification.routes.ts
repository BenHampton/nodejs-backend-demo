import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { notify } from '../../controllers/notifications.controller.js';

const router = Router();

router.use('/', authenticate, notify);

export default router;
