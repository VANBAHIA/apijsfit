const ApiError = require('../utils/apiError');

const verificarPermissaoModulo = (modulo, acao) => {
  return (req, res, next) => {
    try {
      const { usuario } = req;

      if (!usuario) {
        throw new ApiError(401, 'Usuário não autenticado');
      }

      // ADMIN tem acesso total
      if (usuario.perfil === 'ADMIN') {
        return next();
      }

      const permissoes = usuario.permissoes?.modulos?.[modulo];

      if (!permissoes || !permissoes[acao]) {
        throw new ApiError(
          403,
          `Sem permissão para ${acao} em ${modulo}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const verificarAcaoEspecial = (acao) => {
  return (req, res, next) => {
    try {
      const { usuario } = req;

      if (!usuario) {
        throw new ApiError(401, 'Usuário não autenticado');
      }

      if (usuario.perfil === 'ADMIN') {
        return next();
      }

      const acoesEspeciais = usuario.permissoes?.acoes_especiais || [];

      if (!acoesEspeciais.includes(acao)) {
        throw new ApiError(403, `Ação "${acao}" não permitida`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const temPermissao = (usuario, modulo, acao) => {
  if (usuario.perfil === 'ADMIN') return true;
  return usuario.permissoes?.modulos?.[modulo]?.[acao] === true;
};

const temAcaoEspecial = (usuario, acao) => {
  if (usuario.perfil === 'ADMIN') return true;
  return usuario.permissoes?.acoes_especiais?.includes(acao);
};

module.exports = {
  verificarPermissaoModulo,
  verificarAcaoEspecial,
  temPermissao,
  temAcaoEspecial
};