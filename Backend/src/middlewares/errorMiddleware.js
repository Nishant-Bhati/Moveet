import logger from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  let message = err.message;
  let errors = [];

  if (err.name === 'ValidationError') {
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val) => val.message);
    return sendError(res, message, 400, errors);
  } 
  
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    return sendError(res, message, 400);
  }

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
