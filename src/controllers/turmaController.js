// src/controllers/turmaController.js
const turmaService = require('../services/turmaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class TurmaController {
  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const turma = await turmaService.criar({ ...req.body, empresaId });
    
    res.status(201).json(new ApiResponse(201, turma, 'Turma criada com sucesso'));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { status, sexo, skip, take } = req.query;

    const resultado = await turmaService.buscarTodos({
      status,
      sexo,
      skip,
      take,
      empresaId,
    });

    res.status(200).json(new ApiResponse(200, resultado, 'Turmas listadas com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const turma = await turmaService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, turma, 'Turma encontrada'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const turma = await turmaService.atualizar(req.params.id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, turma, 'Turma atualizada com sucesso'));
  });

  deletar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    await turmaService.deletar(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, null, 'Turma deletada com sucesso'));
  });

  adicionarHorario = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const turma = await turmaService.adicionarHorario(req.params.id, req.body, empresaId);
    res.status(200).json(new ApiResponse(200, turma, 'Horário adicionado com sucesso'));
  });

  adicionarInstrutor = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const turma = await turmaService.adicionarInstrutor(req.params.id, req.body, empresaId);
    res.status(200).json(new ApiResponse(200, turma, 'Instrutor adicionado com sucesso'));
  });

  removerInstrutor = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { funcionarioId } = req.body;
    const turma = await turmaService.removerInstrutor(req.params.id, funcionarioId, empresaId);
    res.status(200).json(new ApiResponse(200, turma, 'Instrutor removido com sucesso'));
  });
}

module.exports = new TurmaController();
