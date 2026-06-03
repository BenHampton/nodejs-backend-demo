import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { apiReference } from '@scalar/express-api-reference'
import config from './config/env'
import logger from './utils/logger.js'
import routes from './utils/index.js'
import errorHandler from './middleware/errorHandler'

const app = express()

// 1. Security Headers
// Sets X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options and more. Always first.
app.use(helmet())

// 2. Cors
// Only your frontends can call the API.
// credentials: true allows cookies (needed for refresh token)
app.use(cors({
    origin: config.corsOrigins,
    credentials: true
}));

// 3. Body Parsing
// express.json() parses JSON request bodies into req.body.
// Limit prevents denial-of-service via massive payloads
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 4. HTTP Logging
// pino-http logs every request as structured JSON.
if (config.nodeEnv  !== 'test') {
    app.use(pinoHttp({ logger: logger }));
}

// 5. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100,
    standardHeaders: true, // sends RateLimit-* headers
    legacyHeaders: false,
    message: {
        error: 'Too many requests, please try again later.'
    }
});
app.use('/api', limiter);

// 6. API Routes
app.use('/api', routes);

// 7. API Docs (Scalar)
// Interactive docs at /docs - powered by our OpenAPI spec.
app.use('/doc', apiReference({
    spec: {
        url: '/docs/openapi.yaml'
    }
}));

// 8. Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime()
    });
});

// 9. 404 Handler
// Catches any request that didn't match a route above.
app.use((req, res) => {
    res.status(404)
        .json({error: `Route ${req.method} ${req.url} not found`});
});

// 10. Global Error Handler
// Must be LAST. Must have 4 params. Catches every error.
app.use(errorHandler);

export default app;