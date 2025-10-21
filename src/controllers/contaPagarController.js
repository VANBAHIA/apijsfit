const contaPagarService = require('../services/contaPagarService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class ContaPagarController {

  criar = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const conta = await contaPagarService.criar({ ...req.body, empresaId });
    res.status(201).json(new ApiResponse(201, conta, 'Conta criada com sucesso'));
  });

  criarParcelado = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const contas = await contaPagarService.criarParcelado({ ...req.body, empresaId });
    res.status(201).json(new ApiResponse(201, contas, `${contas.length} parcelas criadas com sucesso`));
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { status, categoria, fornecedorId, funcionarioId, dataInicio, dataFim, page, limit } = req.query;
    const empresaId = req.empresaId;

    const resultado = await contaPagarService.listarTodos({
      status,
      categoria,
      fornecedorId,
      funcionarioId,
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
    const conta = await contaPagarService.buscarPorId(req.params.id, empresaId);
    res.status(200).json(new ApiResponse(200, conta, 'Conta encontrada'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const conta = await contaPagarService.atualizar(id, {
      ...req.body,
      empresaId
    });

    res.status(200).json(new ApiResponse(200, conta, 'Conta atualizada com sucesso'));
  });

  registrarPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const conta = await contaPagarService.registrarPagamento(id, {
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

    const conta = await contaPagarService.cancelar(id, empresaId, motivo);
    res.status(200).json(new ApiResponse(200, conta, 'Conta cancelada com sucesso'));
  });

  deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaId = req.empresaId;

    await contaPagarService.deletar(id, empresaId);
    res.status(200).json(new ApiResponse(200, null, 'Conta deletada com sucesso'));
  });

  atualizarVencidas = asyncHandler(async (req, res) => {
    const empresaId = req.empresaId;
    const resultado = await contaPagarService.atualizarStatusVencidas(empresaId);
    res.status(200).json(new ApiResponse(200, resultado, 'Status atualizados'));
  });

  buscarPorCategoria = asyncHandler(async (req, res) => {
    const { categoria } = req.params;
    const { status } = req.query;
    const empresaId = req.empresaId;

    const contas = await contaPagarService.buscarPorCategoria(categoria, status, empresaId);
    res.status(200).json(new ApiResponse(200, contas, 'Contas encontradas'));
  });

  relatorioTotais = asyncHandler(async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    const empresaId = req.empresaId;

    const relatorio = await contaPagarService.relatorioTotaisPorCategoria(dataInicio, dataFim, empresaId);
    res.status(200).json(new ApiResponse(200, relatorio, 'Relatório gerado com sucesso'));
  });
}

module.exports = new ContaPagarController();
