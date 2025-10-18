// src/controllers/descontoController.js
const descontoService = require('../services/descontoService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class DescontoController {
  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const desconto = await descontoService.criar({ ...req.body, empresaId });
    res.status(201).json(new ApiResponse(201, desconto, 'Desconto criado com sucesso'));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { status, tipo, skip, take } = req.query;

    const resultado = await descontoService.buscarTodos({
      status,
      tipo,
      skip,
      take,
      empresaId,
    });

    res.status(200).json(new ApiResponse(200, resultado, 'Descontos listados com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const desconto = await descontoService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, desconto, 'Desconto encontrado'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const desconto = await descontoService.atualizar(req.params.id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, desconto, 'Desconto atualizado com sucesso'));
  });

  deletar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    await descontoService.deletar(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, null, 'Desconto deletado com sucesso'));
  });

  calcular = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const { id } = req.params;
    const { valorBase } = req.body;

    if (!valorBase || valorBase <= 0) {
      throw new ApiError(400, 'Valor base é obrigatório e deve ser maior que zero');
    }

    const resultado = await descontoService.calcularDesconto(id, Number(valorBase), empresaId);
    res.status(200).json(new ApiResponse(200, resultado, 'Desconto calculado com sucesso'));
  });
}

module.exports = new DescontoController();
