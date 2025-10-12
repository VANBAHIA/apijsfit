const contaReceberService = require('../services/contaReceberService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class ContaReceberController {
  
  criar = asyncHandler(async (req, res) => {
    const conta = await contaReceberService.criar(req.body);
    res.status(201).json(new ApiResponse(201, conta, 'Conta criada com sucesso'));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { status, alunoId, dataInicio, dataFim, page, limit } = req.query;
    
    const resultado = await contaReceberService.listarTodos({
      status,
      alunoId,
      dataInicio,
      dataFim,
      page,
      limit
    });

    res.status(200).json(new ApiResponse(200, resultado, 'Contas listadas com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const conta = await contaReceberService.buscarPorId(req.params.id);
    res.status(200).json(new ApiResponse(200, conta, 'Conta encontrada'));
  });

  registrarPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const conta = await contaReceberService.registrarPagamento(id, req.body);
    res.status(200).json(new ApiResponse(200, conta, 'Pagamento registrado com sucesso'));
  });

  cancelar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;
    
    if (!motivo) throw new ApiError(400, 'Motivo do cancelamento é obrigatório');
    
    const conta = await contaReceberService.cancelar(id, motivo);
    res.status(200).json(new ApiResponse(200, conta, 'Conta cancelada com sucesso'));
  });

  atualizarVencidas = asyncHandler(async (req, res) => {
    const resultado = await contaReceberService.atualizarStatusVencidas();
    res.status(200).json(new ApiResponse(200, resultado, 'Status atualizados'));
  });
}

module.exports = new ContaReceberController();