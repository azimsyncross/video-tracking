const { errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/customErrors');
const logger = require('../utils/logger');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id || 'anonymous',
  });

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return errorResponse(res, err.statusCode, err.message);
  }

  // Programming or other unknown error: don't leak error details
  if (process.env.NODE_ENV === 'development') {
    return errorResponse(res, err.statusCode, err.message, {
      stack: err.stack,
      error: err,
    });
  }

  // Specific error handlers
  if (err.name === 'CastError') err = handleCastErrorDB(err);
  if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  // Send generic error message in production
  return errorResponse(res, 500, 'Something went wrong!');
}; 