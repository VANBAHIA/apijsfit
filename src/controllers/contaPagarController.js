const contaPagarService = require('../services/contaPagarService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class ContaPagarController {
  
  criar = asyncHandler(async (req, res) => {
    const conta = await contaPagarService.criar(req.body);
    res.status(201).json(new ApiResponse(201, conta, 'Conta criada com sucesso'));
  });

  criarParcelado = asyncHandler(async (req, res) => {
    const contas = await contaPagarService.criarParcelado(req.body);
    res.status(201).json(
      new ApiResponse(201, contas, `${contas.length} parcelas criadas com sucesso`)
    );
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { 
      status, 
      categoria, 
      fornecedorId, 
      funcionarioId,
      dataInicio, 
      dataFim, 
      page, 
      limit 
    } = req.query;
    
    const resultado = await contaPagarService.listarTodos({
      status,
      categoria,
      fornecedorId,
      funcionarioId,
      dataInicio,
      dataFim,
      page,
      limit
    });

    res.status(200).json(new ApiResponse(200, resultado, 'Contas listadas com sucesso'));
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const conta = await contaPagarService.buscarPorId(req.params.id);
    res.status(200).json(new ApiResponse(200, conta, 'Conta encontrada'));
  });

  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const conta = await contaPagarService.atualizar(id, req.body);
    res.status(200).json(new ApiResponse(200, conta, 'Conta atualizada com sucesso'));
  });

  registrarPagamento = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const conta = await contaPagarService.registrarPagamento(id, req.body);
    res.status(200).json(new ApiResponse(200, conta, 'Pagamento registrado com sucesso'));
  });

  cancelar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body;
    
    const conta = await contaPagarService.cancelar(id, motivo);
    res.status(200).json(new ApiResponse(200, conta, 'Conta cancelada com sucesso'));
  });

  deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await contaPagarService.deletar(id);
    res.status(200).json(new ApiResponse(200, null, 'Conta deletada com sucesso'));
  });

  atualizarVencidas = asyncHandler(async (req, res) => {
    const resultado = await contaPagarService.atualizarStatusVencidas();
    res.status(200).json(new ApiResponse(200, resultado, 'Status atualizados'));
  });

  buscarPorCategoria = asyncHandler(async (req, res) => {
    const { categoria } = req.params;
    const { status } = req.query;
    
    const contas = await contaPagarService.buscarPorCategoria(categoria, status);
    res.status(200).json(new ApiResponse(200, contas, 'Contas encontradas'));
  });

  relatorioTotais = asyncHandler(async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    
    const relatorio = await contaPagarService.relatorioTotaisPorCategoria(
      dataInicio, 
      dataFim
    );
    
    res.status(200).json(
      new ApiResponse(200, relatorio, 'Relatório gerado com sucesso')
    );
  });
}

module.exports = new ContaPagarController();