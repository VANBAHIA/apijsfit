const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      campo: err.path,
      mensagem: err.msg
    }));
    
    throw new ApiError(400, 'Erro de validação', true, JSON.stringify(errorMessages));
  }
  
  next();
};

module.exports = validateRequest;