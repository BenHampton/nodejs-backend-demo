import pino from "pino";

const logger = pino({
  // In production, only log 'info' and above (skip 'debug')
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  // In dev, use pino-pretty for numan-readable output
  // In prod, raw JSON
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined, // raw JSON to stdout
});

export default logger;

// Examples:
// logger.info('Server started');          -> always logged
// logger.warn('Deprecated endpoint');     -> always logged
// logger.error({ err }, 'DB failed');     -> always logged (pass objects for context)
// logger.debug({ body }, 'Request body'); -> dev only (skipped in production)
