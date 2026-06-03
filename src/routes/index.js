import express from "express";
import authRoutes from './v1/auth.routes';
import userRoutes from './v1/users.routes';

const router = express.Router();

// /api + /v1/auth = /api/v1/auth/login, /api/v1/auth/register, etc.
router.use('/v1/auth', authRoutes)
router.use('/v1/users', userRoutes)

// When v2 comes: router.use('/v2/users', userRoutesV2);

export default router;