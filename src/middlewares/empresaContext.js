const ApiError = require('../utils/apiError');

const setEmpresaContext = (req, res, next) => {
  if (!req.usuario) {
    throw new ApiError(401, 'Usuário não autenticado');
  }
  
  req.empresaId = req.usuario.empresaId;
  next();
};

module.exports = { setEmpresaContext };