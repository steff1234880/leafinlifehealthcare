/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  const error = new Error(`Resource not found at ${req.originalUrl}`);
  res.status(404);
  next(error);
}

/**
 * Centralized Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  // Determine HTTP status code (fallback to err.statusCode or err.status, then 500)
  const statusCode = err.statusCode || err.status || (res.statusCode !== 200 ? res.statusCode : 500);

  console.error(`[Error Handler] ${req.method} ${req.originalUrl} - ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  // Handle common Mongoose / JWT error types
  let message = err.message || 'An unexpected internal server error occurred.';

  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
  } else if (err.code === 11000) {
    message = 'Duplicate field value entered. A record with this value already exists.';
  } else if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  } else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token provided.';
  } else if (err.name === 'TokenExpiredError') {
    message = 'Your session has expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      errorDetails: err,
    }),
  });
}

