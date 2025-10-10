const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!err.isOperational) {
    statusCode = 500;
    message = 'Erro interno do servidor';
  }

  res.locals.errorMessage = err.message;

  const response = {
    statusCode,
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;