const caixaService = require('../services/caixaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class CaixaController {
  abrir = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId; // ✅ vem do middleware
    const caixa = await caixaService.abrir({ ...req.body, empresaId });
    res.status(201).json(new ApiResponse(201, caixa, 'Caixa aberto com sucesso'));
  });

  fechar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;
    const caixa = await caixaService.fechar(id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, caixa, 'Caixa fechado com sucesso'));
  });

  registrarMovimento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;
    const caixa = await caixaService.registrarMovimento(id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, caixa, 'Movimento registrado com sucesso'));
  });

  removerMovimento = asyncHandler(async (req, res) => {
    const { id, movimentoId } = req.params;
    const empresaId = req.empresaId;
    const caixa = await caixaService.removerMovimento(id, movimentoId, empresaId);
    res.status(200).json(new ApiResponse(200, caixa, 'Movimento removido com sucesso'));
  });

  buscarAberto = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const caixa = await caixaService.buscarAberto(empresaId);
    res.status(200).json(new ApiResponse(200, caixa, 'Caixa aberto encontrado'));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { status, dataInicio, dataFim, page, limit } = req.query;
    const empresaId = req.empresaId;
    const resultado = await caixaService.listarTodos({
      empresaId,
      status,
      dataInicio,
      dataFim,
      page,
      limit
    });
    res.status(200).json(new ApiResponse(200, resultado, 'Caixas listados com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const caixa = await caixaService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, caixa, 'Caixa encontrado'));
  });

  relatorio = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;
    const relatorio = await caixaService.relatorioCaixa(id, empresaId);
    res.status(200).json(new ApiResponse(200, relatorio, 'Relatório gerado com sucesso'));
  });

  sangria = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;
    const caixa = await caixaService.sangria(id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, caixa, 'Sangria realizada com sucesso'));
  });

  suprimento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;
    const caixa = await caixaService.suprimento(id, { ...req.body, empresaId });
    res.status(200).json(new ApiResponse(200, caixa, 'Suprimento realizado com sucesso'));
  });
}

module.exports = new CaixaController();