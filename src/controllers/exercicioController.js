const exercicioService = require('../services/exercicioService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class ExercicioController {
  async criar(req, res) {
    const dados = req.body;
    const empresaId = req.empresaId;

    const exercicio = await exercicioService.criar(dados, empresaId);

    res.status(201).json(
      new ApiResponse(201, exercicio, 'Exercício criado com sucesso')
    );
  }

  async listarTodos(req, res) {
    const { page, limit, busca, grupoId } = req.query;
    const empresaId = req.empresaId;

    const resultado = await exercicioService.listarTodos({
      page,
      limit,
      busca,
      grupoId,
      empresaId
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Exercícios listados com sucesso')
    );
  }

  async buscarPorId(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const exercicio = await exercicioService.buscarPorId(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, exercicio, 'Exercício encontrado')
    );
  }

  async atualizar(req, res) {
    const { id } = req.params;
    const dados = req.body;
    const empresaId = req.empresaId;

    const exercicio = await exercicioService.atualizar(id, dados, empresaId);

    res.status(200).json(
      new ApiResponse(200, exercicio, 'Exercício atualizado com sucesso')
    );
  }

  async deletar(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    await exercicioService.deletar(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, null, 'Exercício deletado com sucesso')
    );
  }
}

module.exports = new ExercicioController();
