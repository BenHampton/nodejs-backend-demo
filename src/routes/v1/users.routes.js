import express from 'express';
import ctrl from '../../controllers/users.controller';
import authenticate from '../../middleware/authenticate';
import { validateUser } from '../../middleware/validate'

const router = express.Router();

// Every route here requires a valid JWT (authenticate runs first)
router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, ctrl.getOne);
router.patch('/:id', authenticate, validateUser, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

export default router;

