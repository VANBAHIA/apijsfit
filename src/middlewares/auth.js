// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const usuarioRepository = require('../repositories/usuarioRepository');

/**
 * Middleware para verificar autenticação JWT
 */
const verificarAutenticacao = async (req, res, next) => {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'Token não fornecido');
    }

    // Formato: Bearer <token>
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new ApiError(401, 'Token mal formatado');
    }

    const token = parts[1];

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret-key-change-in-production'
    );

    // Buscar usuário
    const usuario = await usuarioRepository.buscarPorId(decoded.id);

    if (!usuario) {
      throw new ApiError(401, 'Usuário não encontrado');
    }

    if (usuario.situacao !== 'ATIVO') {
      throw new ApiError(401, `Usuário ${usuario.situacao.toLowerCase()}`);
    }

    // Adicionar usuário ao request
    req.usuario = {
      id: usuario.id,
      nomeUsuario: usuario.nomeUsuario,
      nome: usuario.nome,
      email: usuario.email,
      empresaId: usuario.empresaId,
      perfil: usuario.perfil,
      permissoes: usuario.permissoes
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Token inválido'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expirado'));
    }
    next(error);
  }
};

/**
 * Middleware para verificar perfil do usuário
 */
const verificarPerfil = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      throw new ApiError(401, 'Usuário não autenticado');
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      throw new ApiError(403, 'Acesso negado. Perfil não autorizado');
    }

    next();
  };
};

/**
 * Middleware para verificar permissão específica
 */
const verificarPermissao = (...permissoesNecessarias) => {
  return (req, res, next) => {
    if (!req.usuario) {
      throw new ApiError(401, 'Usuário não autenticado');
    }

    // Admin tem todas as permissões
    if (req.usuario.perfil === 'ADMIN') {
      return next();
    }

    const permissoesUsuario = req.usuario.permissoes || [];

    const temPermissao = permissoesNecessarias.some(permissao =>
      permissoesUsuario.includes(permissao)
    );

    if (!temPermissao) {
      throw new ApiError(403, 'Acesso negado. Permissão insuficiente');
    }

    next();
  };
};

/**
 * Middleware para verificar licença ativa
 */
const verificarLicenca = async (req, res, next) => {
  try {
    if (!req.usuario) {
      throw new ApiError(401, 'Usuário não autenticado');
    }

    const licencaRepository = require('../repositories/licencaRepository');

    const licenca = await licencaRepository.buscarLicencaAtiva(req.usuario.empresaId);

    if (!licenca) {
      throw new ApiError(403, 'Empresa sem licença ativa');
    }

    const agora = new Date();
    if (agora > licenca.dataExpiracao) {
      throw new ApiError(403, 'Licença expirada');
    }

    // Adicionar licença ao request
    req.licenca = licenca;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar funcionalidade habilitada na licença
 */
const verificarFuncionalidade = (...funcionalidades) => {
  return (req, res, next) => {
    if (!req.licenca) {
      throw new ApiError(403, 'Licença não verificada');
    }

    const funcionalidadesLicenca = req.licenca.funcionalidades || [];

    const temFuncionalidade = funcionalidades.some(func =>
      funcionalidadesLicenca.includes(func)
    );

    if (!temFuncionalidade) {
      throw new ApiError(403, 'Funcionalidade não habilitada na licença');
    }

    next();
  };
};

module.exports = {
  verificarAutenticacao,
  verificarPerfil,
  verificarPermissao,
  verificarLicenca,
  verificarFuncionalidade
};