const errorMiddleware = (err, req, res, next) => {
  console.error('FULL ERROR:', err);
  console.error('ERROR MESSAGE:', err.message);
  console.error('ERROR STACK:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

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
