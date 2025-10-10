const turmaService = require('../services/turmaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class TurmaController {
  criar = asyncHandler(async (req, res) => {
    const turma = await turmaService.criar(req.body);

    res.status(201).json(
      new ApiResponse(201, turma, 'Turma criada com sucesso')
    );
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { status, sexo, skip, take } = req.query;

    const resultado = await turmaService.buscarTodos({
      status,
      sexo,
      skip,
      take
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Turmas listadas com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const turma = await turmaService.buscarPorId(req.params.id);

    res.status(200).json(
      new ApiResponse(200, turma, 'Turma encontrada')
    );
  });

  atualizar = asyncHandler(async (req, res) => {
    const turma = await turmaService.atualizar(req.params.id, req.body);

    res.status(200).json(
      new ApiResponse(200, turma, 'Turma atualizada com sucesso')
    );
  });

  deletar = asyncHandler(async (req, res) => {
    await turmaService.deletar(req.params.id);

    res.status(200).json(
      new ApiResponse(200, null, 'Turma deletada com sucesso')
    );
  });

  adicionarHorario = asyncHandler(async (req, res) => {
    const turma = await turmaService.adicionarHorario(req.params.id, req.body);

    res.status(200).json(
      new ApiResponse(200, turma, 'Horário adicionado com sucesso')
    );
  });

  adicionarInstrutor = asyncHandler(async (req, res) => {
    const turma = await turmaService.adicionarInstrutor(req.params.id, req.body);

    res.status(200).json(
      new ApiResponse(200, turma, 'Instrutor adicionado com sucesso')
    );
  });

  removerInstrutor = asyncHandler(async (req, res) => {
    const { funcionarioId } = req.body;
    const turma = await turmaService.removerInstrutor(req.params.id, funcionarioId);

    res.status(200).json(
      new ApiResponse(200, turma, 'Instrutor removido com sucesso')
    );
  });
}

module.exports = new TurmaController();