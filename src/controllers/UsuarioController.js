const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const usuarioService = require('../services/usuarioService');

class UsuarioController {
  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const dados = { ...req.body, empresaId };

    const usuario = await usuarioService.criar(dados);

    delete usuario.senha;

    res.status(201).json(
      new ApiResponse(201, usuario, 'Usuário criado com sucesso')
    );
  });

  login = asyncHandler(async (req, res) => {
    const { nomeUsuario, senha, empresaId } = req.body; // 👈 aqui sim
    if (!nomeUsuario || !senha) {
      throw new ApiError(400, 'Nome de usuário e senha são obrigatórios');
    }
    if (!empresaId) {
      throw new ApiError(400, 'Empresa não selecionada');
    }

    const resultado = await usuarioService.login(nomeUsuario, senha, empresaId);
    res.status(200).json(new ApiResponse(200, resultado, 'Login realizado com sucesso'));
  });


  buscarTodos = asyncHandler(async (req, res) => {

    const empresaId = req.empresaId;

    const { situacao, page, limit } = req.query;

    const skip = page ? (Number(page) - 1) * Number(limit || 10) : 0;
    const take = limit ? Number(limit) : 10;

    const resultado = await usuarioService.buscarTodos({
      empresaId,
      perfil: req.usuario.perfil,
      situacao,
      skip,
      take
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Usuários listados com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const usuario = await usuarioService.buscarPorId(req.params.id, empresaId);

    res.status(200).json(
      new ApiResponse(200, usuario, 'Usuário encontrado')
    );
  });

  atualizar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;

    const dados = { ...req.body, empresaId };

    const usuario = await usuarioService.atualizar(req.params.id, dados);

    res.status(200).json(
      new ApiResponse(200, usuario, 'Usuário atualizado com sucesso')
    );
  });

  alterarSenha = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      throw new ApiError(400, 'Senha atual e nova senha são obrigatórias');
    }

    await usuarioService.alterarSenha(req.params.id, senhaAtual, novaSenha, empresaId);

    res.status(200).json(
      new ApiResponse(200, null, 'Senha alterada com sucesso')
    );
  });

  deletar = asyncHandler(async (req, res) => {
  
    const empresaId = req.empresaId;
    await usuarioService.deletar(req.params.id, empresaId);

    res.status(200).json(
      new ApiResponse(200, null, 'Usuário deletado com sucesso')
    );
  });

  alterarSituacao = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { situacao } = req.body;

    if (!situacao) {
      throw new ApiError(400, 'Situação é obrigatória');
    }

    const usuario = await usuarioService.alterarSituacao(req.params.id, situacao, empresaId);

    res.status(200).json(
      new ApiResponse(200, usuario, 'Situação alterada com sucesso')
    );
  });

  validarToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      throw new ApiError(400, 'Token é obrigatório');
    }

    const resultado = await usuarioService.validarToken(token);

    res.status(200).json(
      new ApiResponse(200, resultado, 'Token validado com sucesso')
    );
  });
}

module.exports = new UsuarioController();
