import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authHelloV1 } from '../../controllers/auth-hello.controller.js';

const router = Router();

router.get('/', authenticate, authHelloV1);

export default router;