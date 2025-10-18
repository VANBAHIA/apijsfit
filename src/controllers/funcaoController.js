// src/controllers/funcaoController.js
const funcaoService = require('../services/funcaoService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class FuncaoController {
  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const funcao = await funcaoService.criar({ ...req.body, empresaId });
    res.status(201).json(new ApiResponse(201, funcao, 'Função criada com sucesso'));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { status, skip, take } = req.query;
    const resultado = await funcaoService.buscarTodos({ status, skip, take, empresaId });
    res.status(200).json(new ApiResponse(200, resultado, 'Funções listadas com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const funcao = await funcaoService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, funcao, 'Função encontrada'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const funcao = await funcaoService.atualizar(req.params.id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, funcao, 'Função atualizada com sucesso'));
  });

  deletar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    await funcaoService.deletar(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, null, 'Função deletada com sucesso'));
  });
}

module.exports = new FuncaoController();
