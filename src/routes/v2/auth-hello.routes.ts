import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authHelloV2 } from '../../controllers/v2/auth.controller.js';

const router = Router();

router.get('/', authenticate, authHelloV2);

export default router;
