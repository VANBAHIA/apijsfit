// src/controllers/matriculaController.js
const matriculaService = require('../services/matriculaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class MatriculaController {
  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const resultado = await matriculaService.criar({ ...req.body, empresaId });

    res.status(201).json(
      new ApiResponse(
        201,
        resultado,
        'Matrícula criada com sucesso e primeira cobrança gerada'
      )
    );
  });

  listarTodos = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { situacao, alunoId, page, limit } = req.query;

    const resultado = await matriculaService.listarTodos({
      situacao,
      alunoId,
      empresaId,
      skip: page ? (Number(page) - 1) * Number(limit || 10) : 0,
      take: limit,
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Matrículas listadas com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const matricula = await matriculaService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, matricula, 'Matrícula encontrada'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const matricula = await matriculaService.atualizar(req.params.id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, matricula, 'Matrícula atualizada com sucesso'));
  });

  inativar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { motivo } = req.body;
    const matricula = await matriculaService.inativar(req.params.id, motivo, empresaId);
    res.status(200).json(new ApiResponse(200, matricula, 'Matrícula inativada com sucesso'));
  });

  reativar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const matricula = await matriculaService.reativar(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, matricula, 'Matrícula reativada com sucesso'));
  });

deletar = asyncHandler(async (req, res) => {
  const empresaId = req.empresaId;
  const resultado = await matriculaService.deletar(req.params.id, empresaId);
  res.status(200).json(new ApiResponse(200, resultado, 'Matrícula excluída com sucesso'));
});

}

module.exports = new MatriculaController();
