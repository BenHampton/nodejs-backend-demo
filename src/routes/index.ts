import { Router } from 'express';
import helloRoutes from './v1/hello.routes.js';
import authRoutes from "./v1/auth.routes.js";
import authHelloRoutes from "./v1/auth-hello.routes.js";

const router = Router();

// public endpoints
router.use('/v1/hello', helloRoutes);


// authenticated endpoints
router.use('/v1/auth', authRoutes)
router.use('/v1/auth-hello', authHelloRoutes)


export default router;
