// src/controllers/localController.js
const localService = require('../services/localService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class LocalController {
  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const local = await localService.criar({ ...req.body, empresaId });
    res.status(201).json(new ApiResponse(201, local, 'Local criado com sucesso'));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { status, skip, take } = req.query;

    const resultado = await localService.buscarTodos({ status, skip, take, empresaId });
    res.status(200).json(new ApiResponse(200, resultado, 'Locais listados com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const local = await localService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, local, 'Local encontrado'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const local = await localService.atualizar(req.params.id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, local, 'Local atualizado com sucesso'));
  });

  deletar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    await localService.deletar(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, null, 'Local deletado com sucesso'));
  });
}

module.exports = new LocalController();
