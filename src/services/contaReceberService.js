const contaReceberRepository = require('../repositories/contaReceberRepository');
const alunoService = require('./alunoService');
const planoService = require('./planoService');
const descontoService = require('./descontoService');
const caixaService = require('./caixaService');
const ApiError = require('../utils/apiError');
const prisma = require('../config/database');

class ContaReceberService {
  async gerarNumero(empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const ultimaConta = await prisma.contaReceber.findFirst({
      where: { empresaId },
      orderBy: { numero: 'desc' },
      select: { numero: true }
    });

    if (!ultimaConta) return 'CR00001';

    const ultimoNumero = parseInt(ultimaConta.numero.replace('CR', ''));
    const proximoNumero = ultimoNumero + 1;

    return `CR${proximoNumero.toString().padStart(5, '0')}`;
  }

  async criar(data) {
    let {
      empresaId,
      matriculaId,
      alunoId,
      planoId,
      descontoId,
      dataVencimento,
      observacoes,
      numeroParcela,
      totalParcelas
    } = data;

    
    if (!descontoId) descontoId = null;


    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    if (!alunoId) throw new ApiError(400, 'Aluno é obrigatório');
    if (!planoId) throw new ApiError(400, 'Plano é obrigatório');
    if (!dataVencimento) throw new ApiError(400, 'Data de vencimento é obrigatória');

    await alunoService.buscarPorId(alunoId, empresaId);

    const plano = await planoService.buscarPorId(planoId);
    let valorOriginal = plano.valorMensalidade;

    let valorDesconto = 0;
    if (descontoId) {
      const resultado = await descontoService.calcularDesconto(descontoId, valorOriginal);
      valorDesconto = resultado.valorDesconto;
    }

    const valorFinal = valorOriginal - valorDesconto;
    const numero = await this.gerarNumero(empresaId);

    return await contaReceberRepository.criar({
      empresaId,
      numero,
      matriculaId: matriculaId || null,
      alunoId,
      planoId,
      descontoId,
      valorOriginal,
      valorDesconto,
      valorFinal,
      valorRestante: valorFinal,
      dataVencimento: new Date(dataVencimento),
      observacoes,
      numeroParcela: numeroParcela || null,
      totalParcelas: totalParcelas || null,
      status: 'PENDENTE'
    });
  }

  async registrarPagamento(id, data) {
    const { empresaId, valorPago, formaPagamento, dataPagamento } = data;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const conta = await contaReceberRepository.buscarPorId(id, empresaId);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    if (conta.status === 'PAGO') throw new ApiError(400, 'Conta já está paga');

    if (!valorPago || valorPago <= 0) throw new ApiError(400, 'Valor pago deve ser maior que zero');
    if (!formaPagamento) throw new ApiError(400, 'Forma de pagamento é obrigatória');

    const novoValorPago = conta.valorPago + Number(valorPago);
    const novoValorRestante = conta.valorFinal - novoValorPago;
    const novoStatus = novoValorRestante <= 0 ? 'PAGO' : 'PENDENTE';

    const contaAtualizada = await contaReceberRepository.atualizar(id, {
      empresaId,
      valorPago: novoValorPago,
      valorRestante: novoValorRestante,
      status: novoStatus,
      dataPagamento: novoStatus === 'PAGO'
        ? new Date(dataPagamento || Date.now())
        : null,
      formaPagamento
    });

    // Sempre registra no caixa aberto da empresa
    const caixaAberto = await caixaService.buscarAberto(empresaId);
    await caixaService.registrarMovimento(
      caixaAberto.id,
      {
        tipo: 'ENTRADA',
        valor: valorPago,
        descricao: `Recebimento conta ${conta.numero}`,
        contaReceberId: id,
        formaPagamento
      },
      empresaId
    );

    return contaAtualizada;
  }

  async atualizarStatusVencidas(empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const contasVencidas = await contaReceberRepository.buscarVencidas(empresaId);
    for (const conta of contasVencidas) {
      await contaReceberRepository.atualizar(conta.id, { status: 'VENCIDO', empresaId });
    }

    return { atualizadas: contasVencidas.length };
  }

  async listarTodos(filtros) {
    if (!filtros.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await contaReceberRepository.buscarTodos(filtros);
  }

  async buscarPorId(id, empresaId) {
    const conta = await contaReceberRepository.buscarPorId(id, empresaId);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    return conta;
  }

  async cancelar(id, empresaId, motivo) {
    const conta = await contaReceberRepository.buscarPorId(id, empresaId);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    if (conta.status === 'PAGO') throw new ApiError(400, 'Conta já está paga');

    return await contaReceberRepository.atualizar(id, {
      empresaId,
      status: 'CANCELADO',
      observacoes: `${conta.observacoes || ''}\nCANCELADO: ${motivo}`
    });
  }

  async atualizar(id, data,) {
    console.log('Data recebido em atualizar:', data);

    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const conta = await contaReceberRepository.buscarPorId(id, data.empresaId);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    if (conta.status === 'PAGO') throw new ApiError(400, 'Conta já está paga');

    return await contaReceberRepository.atualizar(id, data);
  }
}

module.exports = new ContaReceberService();
