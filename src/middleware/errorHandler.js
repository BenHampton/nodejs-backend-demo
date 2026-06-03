import logger from "../utils/logger";

const errorHandler = (err, req, res, next) => {
    // --- Normalize known error types --------------------------
    // Errors that come from libraries
    // Covert them to consistent status codes.

    // JWT invalid or malformed
    if (err.name === 'JsonWebTokenError') {
        err.statusCode = 401;
        err.message = 'Invalid token';
        err.isOperational = true;
    }

    //Prisma unique constraint violation (e.g. duplicate email)
    if (err.code === 'P2002') {
        err.statusCode = 409;
        err.message = 'A record with that value already exists';
        err.isOperational = true;
    }

    // Prisma record not found (e.g., update/delete non-existent row)
    if (err.code === 'P2025') {
        err.statusCode = 404;
        err.message = 'Record not found';
        err.isOperational = true;
    }

    // Malformed JSON in request body
    if (err.type === 'entity.parse.failed') {
        err.statusCode = 400;
        err.message = 'Invalid JSON in request body';
        err.isOperational = true;
    }

    // --- Determine status and message --------------------------
    const status = err.statusCode || 500;
    const message = err.isOperational
        ? err.message              // safe to show users
        : 'Internal Server Error'; // hide bug details

    // --- Log Server errors --------------------------------------
    if (status >= 500) {
        logger.error({
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
        })
    }

    // --- Send response ------------------------------------------
    res.status(status).json({
        error: {
            // Only include the stack trace in development
            ...(process.env.NODE_ENV === ' development' && { stack: err.stack }),
        },
    });
};

export default errorHandler;