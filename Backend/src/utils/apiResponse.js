export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = undefined) => {
  return res.status(statusCode).json({
    success: false,
    data: errors || null,
    message,
  });
};

export default {
  sendSuccess,
  sendError,
};
