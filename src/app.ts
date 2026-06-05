import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { apiReference } from '@scalar/express-api-reference';
import { openapiDocument } from './docs/openapi.js';
import config from './config/env.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import routes from './routes/index.js';
import correlationId from './middleware/correlationId.js';
import { metricsEndpoint, metricsMiddleware } from './middleware/metrics.js';
import { live, ready } from './controllers/health.controller.js';

const app = express();
app.get('/openapi.json', (_req, res) => res.json(openapiDocument));

// 1. Security Headers
// Sets X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options and more. Always first.
app.use(helmet());

// 2. Cors
// Only your frontends can call the API.
// credentials: true allows cookies (needed for refresh token)
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);

// 3. Body Parsing
// express.json() parses JSON request bodies into req.body.
// Limit prevents denial-of-service via massive payloads
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 4. HTTP Logging
// pino-http logs every request as structured JSON.
if (config.nodeEnv !== 'test') {
  app.use(pinoHttp({ logger }));
}

app.use(correlationId);
app.use(metricsMiddleware);

// 5. Rate Limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    limit: 100,
    standardHeaders: true, // sends RateLimit-* headers
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.',
    },
  }),
);

// 6. API Routes
app.use('/health', live);
app.use('/health/ready', ready);
app.use('/metrics', metricsEndpoint);
app.use('/api', routes);

// 7. API Docs (Scalar)
// Interactive docs at /docs - powered by our OpenAPI spec.
app.use(
  '/docs',
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdn.jsdelivr.net',
          'data:',
        ],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://api.scalar.com',
        ],
        workerSrc: ["'self'", 'blob:'],
      },
    },
  }),
  apiReference({ content: openapiDocument }),
);
app.use(express.static('docs'));

// 8. 404 Handler
// Catches any request that didn't match a route above.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// 9. Global Error Handler
// Must be LAST. Must have 4 params. Catches every error.
app.use(errorHandler);

export default app;
