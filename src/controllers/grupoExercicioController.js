const grupoExercicioService = require('../services/grupoExercicioService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class GrupoExercicioController {
  async criar(req, res) {
    const dados = req.body;
    const empresaId = req.empresaId;
    
    console.log('📋 Controller recebeu:', {
      empresaId,
      nome: dados.nome

    });

    if (!dados.nome) {
      throw new ApiError(400, 'Nome do grupo de exercício é obrigatório');
    }

    if (!empresaId) {
      console.error('❌ ERRO: empresaId ausente no request');
      throw new ApiError(401, 'Usuário não autenticado ou empresaId ausente');
    }

    const grupo = await grupoExercicioService.criar(dados, empresaId);

    res.status(201).json(
      new ApiResponse(201, grupo, 'Grupo de exercício criado com sucesso')
    );
  }

  async listarTodos(req, res) {
    const { page, limit, busca } = req.query;
    const empresaId = req.empresaId;

    const resultado = await grupoExercicioService.listarTodos({
      page,
      limit,
      busca,
      empresaId
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Grupos de exercício listados com sucesso')
    );
  }

  async buscarPorId(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const grupo = await grupoExercicioService.buscarPorId(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, grupo, 'Grupo de exercício encontrado')
    );
  }

  async atualizar(req, res) {
    const { id } = req.params;
    const dados = req.body;
    const empresaId = req.empresaId;

    const grupo = await grupoExercicioService.atualizar(id, dados, empresaId);

    res.status(200).json(
      new ApiResponse(200, grupo, 'Grupo de exercício atualizado com sucesso')
    );
  }

  async deletar(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    await grupoExercicioService.deletar(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, null, 'Grupo de exercício deletado com sucesso')
    );
  }
}

module.exports = new GrupoExercicioController();