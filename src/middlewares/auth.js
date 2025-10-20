const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const usuarioRepository = require('../repositories/usuarioRepository');

const verificarAutenticacao = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'Token não fornecido');
    }

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

    console.log('🔍 Token Decodificado:', {
      usuarioId: decoded.id,
      empresaId: decoded.empresaId,
      nomeUsuario: decoded.nomeUsuario,
      PerfiUsuario: decoded.perfil
    });

    // Buscar usuário
    const usuario = await usuarioRepository.buscarPorId(decoded.id);

    if (!usuario) {
      throw new ApiError(401, 'Usuário não encontrado');
    }

    if (usuario.situacao !== 'ATIVO') {
      throw new ApiError(401, `Usuário ${usuario.situacao.toLowerCase()}`);
    }

    // ✅ PASSO CRÍTICO: Adicionar usuário E empresaId ao request
    req.usuario = {
      id: usuario.id,
      nomeUsuario: usuario.nomeUsuario,
      nome: usuario.nome,
      email: usuario.email,
      empresaId: usuario.empresaId,  // ← VERIFICAR SE EXISTE NO BANCO
      perfil: usuario.perfil,
      permissoes: usuario.permissoes
    };

    // ✅ ADICIONAR DIRETO AO REQUEST (DUPLICADO PARA SEGURANÇA)
    req.empresaId = usuario.empresaId;

    console.log('✅ empresaId adicionado ao request:', req.empresaId);

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

module.exports = { verificarAutenticacao };

