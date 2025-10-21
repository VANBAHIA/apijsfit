const contaReceberService = require('../services/contaReceberService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class ContaReceberController {

  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const conta = await contaReceberService.criar({ ...req.body, empresaId });
    res.status(201).json(new ApiResponse(201, conta, 'Conta criada com sucesso'));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { status, alunoId, dataInicio, dataFim, page, limit } = req.query;
    const empresaId = req.empresaId;

    const resultado = await contaReceberService.listarTodos({
      status,
      alunoId,
      dataInicio,
      dataFim,
      page,
      limit,
      empresaId
    });

    res.status(200).json(new ApiResponse(200, resultado, 'Contas listadas com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const conta = await contaReceberService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, conta, 'Conta encontrada'));
  });

  registrarPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const conta = await contaReceberService.registrarPagamento(id, {
      ...req.body,
      empresaId
    });

    res.status(200).json(new ApiResponse(200, conta, 'Pagamento registrado com sucesso'));
  });

  cancelar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;
    const empresaId = req.empresaId;

    if (!motivo) throw new ApiError(400, 'Motivo do cancelamento é obrigatório');

    const conta = await contaReceberService.cancelar(id, empresaId, motivo);
    res.status(200).json(new ApiResponse(200, conta, 'Conta cancelada com sucesso'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const conta = await contaReceberService.atualizar(id, {
      ...req.body,
      empresaId
    });
console.log(empresaId)
    res.status(200).json(new ApiResponse(200, conta, 'Conta atualizada com sucesso'));
  });

  atualizarVencidas = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const resultado = await contaReceberService.atualizarStatusVencidas(empresaId);
    res.status(200).json(new ApiResponse(200, resultado, 'Status atualizados'));
  });
}

module.exports = new ContaReceberController();
