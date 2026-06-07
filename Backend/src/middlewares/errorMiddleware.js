import logger from '../utils/logger.js';

const errorMiddleware = (err, req, res, next) => {
  // Log the full error to console for internal visibility
  console.error('FULL ERROR:', err);
  console.error('ERROR MESSAGE:', err.message);
  console.error('ERROR STACK:', err.stack);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      data: errorDetails,
    });
  }

  // Mongoose Cast Error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Resource not found with id of ${err.value}`,
      data: {},
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      data: {},
    });
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Custom or generic error message
  let message = err.message || 'Internal Server Error';

  // Never leak stack traces in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    data: {},
    message,
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export { errorMiddleware as errorHandler };
export default errorMiddleware;
