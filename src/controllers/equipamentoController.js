const equipamentoService = require('../services/equipamentoService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class EquipamentoController {
  async criar(req, res) {
    const dados = req.body;
    const empresaId = req.empresaId;

    console.log('📋 Controller recebeu:', {
      empresaId,
      nome: dados.nome
    });

    if (!dados.nome) {
      throw new ApiError(400, 'Nome do equipamento é obrigatório');
    }

    if (!empresaId) {
      console.error('❌ ERRO: empresaId ausente no request');
      throw new ApiError(401, 'Usuário não autenticado ou empresaId ausente');
    }

    const equipamento = await equipamentoService.criar(dados, empresaId);

    res.status(201).json(
      new ApiResponse(201, equipamento, 'Equipamento criado com sucesso')
    );
  }

  async listarTodos(req, res) {
    const { page, limit, busca } = req.query;
    const empresaId = req.empresaId;

    const resultado = await equipamentoService.listarTodos({
      page,
      limit,
      busca,
      empresaId
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Equipamentos listados com sucesso')
    );
  }

  async buscarPorId(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const equipamento = await equipamentoService.buscarPorId(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, equipamento, 'Equipamento encontrado')
    );
  }

  async buscarPorCodigo(req, res) {
    const { codigo } = req.params;
    const empresaId = req.empresaId;

    const equipamento = await equipamentoService.buscarPorCodigo(codigo, empresaId);

    res.status(200).json(
      new ApiResponse(200, equipamento, 'Equipamento encontrado')
    );
  }

  async atualizar(req, res) {
    const { id } = req.params;
    const dados = req.body;
    const empresaId = req.empresaId;

    const equipamento = await equipamentoService.atualizar(id, dados, empresaId);

    res.status(200).json(
      new ApiResponse(200, equipamento, 'Equipamento atualizado com sucesso')
    );
  }

  async deletar(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    await equipamentoService.deletar(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, null, 'Equipamento deletado com sucesso')
    );
  }
}

module.exports = new EquipamentoController();