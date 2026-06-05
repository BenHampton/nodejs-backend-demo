import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import * as ctrl from '../../controllers/users.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

export default router;
