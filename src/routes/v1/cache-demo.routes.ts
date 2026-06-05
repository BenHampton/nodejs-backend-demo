import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { cacheDemo } from '../../controllers/cache-demo.controller.js';
const router = Router();

router.get('/:id', authenticate, cacheDemo); // payload: { source: 'cache'|'db', user }

export default router;
