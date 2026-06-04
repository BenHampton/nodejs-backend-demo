/**
 * Custom error class for operational (expected) errors.
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Email already taken', 409);
 *   throw new AppError('Insufficient permissions', 403);
 */

class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;
  public readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    // this.isOperational = true; // distinguishes expected error from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
