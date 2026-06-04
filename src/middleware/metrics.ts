import client from 'prom-client';
import type { RequestHandler } from 'express';

client.collectDefaultMetrics();

const duration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  const end = duration.startTimer();

  res.on('finish', () =>
    end({
      method: req.method,
      route: req.route?.path ?? req.path,
      status: String(res.statusCode),
    }),
  );

  next();
};

export const metricsEndpoint: RequestHandler = async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
};
