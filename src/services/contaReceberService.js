const contaReceberRepository = require('../repositories/contaReceberRepository');
const alunoService = require('./alunoService');
const planoService = require('./planoService');
const descontoService = require('./descontoService');
const ApiError = require('../utils/apiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ContaReceberService {
  
  async gerarNumero() {
    const ultimaConta = await prisma.contaReceber.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true }
    });

    if (!ultimaConta) return 'CR00001';
    
    const ultimoNumero = parseInt(ultimaConta.numero.replace('CR', ''));
    const proximoNumero = ultimoNumero + 1;
    
    return `CR${proximoNumero.toString().padStart(5, '0')}`;
  }

  /**
   * ✅ ATUALIZADO: Criar conta a receber com suporte a matrícula e parcelas
   */
  async criar(data) {
    const { 
      matriculaId,  // 🆕 NOVO
      alunoId, 
      planoId, 
      descontoId, 
      dataVencimento, 
      observacoes,
      numeroParcela,
      totalParcelas
    } = data;

    // Validações
    if (!alunoId) throw new ApiError(400, 'Aluno é obrigatório');
    if (!planoId) throw new ApiError(400, 'Plano é obrigatório');
    if (!dataVencimento) throw new ApiError(400, 'Data de vencimento é obrigatória');

    // Verificar se aluno existe
    await alunoService.buscarPorId(alunoId);

    // Buscar plano
    const plano = await planoService.buscarPorId(planoId);
    let valorOriginal = plano.valorMensalidade;

    // Calcular desconto se houver
    let valorDesconto = 0;
    if (descontoId) {
      const resultado = await descontoService.calcularDesconto(descontoId, valorOriginal);
      valorDesconto = resultado.valorDesconto;
    }

    const valorFinal = valorOriginal - valorDesconto;
    const numero = await this.gerarNumero();

    return await contaReceberRepository.criar({
      numero,
      matriculaId: matriculaId || null,  // 🆕 NOVO
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
    const { valorPago, formaPagamento, dataPagamento, caixaId } = data;

    const conta = await contaReceberRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    
    if (conta.status === 'PAGO') {
      throw new ApiError(400, 'Conta já está paga');
    }

    if (!valorPago || valorPago <= 0) {
      throw new ApiError(400, 'Valor pago deve ser maior que zero');
    }

    if (!formaPagamento) {
      throw new ApiError(400, 'Forma de pagamento é obrigatória');
    }

    const novoValorPago = conta.valorPago + Number(valorPago);
    const novoValorRestante = conta.valorFinal - novoValorPago;

    const novoStatus = novoValorRestante <= 0 ? 'PAGO' : 'PENDENTE';

    // Atualizar conta
    const contaAtualizada = await contaReceberRepository.atualizar(id, {
      valorPago: novoValorPago,
      valorRestante: novoValorRestante,
      status: novoStatus,
      dataPagamento: novoStatus === 'PAGO' ? new Date(dataPagamento || Date.now()) : null,
      formaPagamento
    });

    // Registrar movimento no caixa (se caixaId fornecido)
    if (caixaId) {
      const caixaService = require('./caixaService');
      await caixaService.registrarMovimento(caixaId, {
        tipo: 'ENTRADA',
        valor: valorPago,
        descricao: `Recebimento conta ${conta.numero}`,
        contaReceberId: id,
        formaPagamento
      });
    }

    return contaAtualizada;
  }

  async atualizarStatusVencidas() {
    const contasVencidas = await contaReceberRepository.buscarVencidas();
    
    for (const conta of contasVencidas) {
      await contaReceberRepository.atualizar(conta.id, { status: 'VENCIDO' });
    }

    return { atualizadas: contasVencidas.length };
  }

  async listarTodos(filtros) {
    return await contaReceberRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const conta = await contaReceberRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    return conta;
  }

  async cancelar(id, motivo) {
    const conta = await contaReceberRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    
    if (conta.status === 'PAGO') {
      throw new ApiError(400, 'Não é possível cancelar conta já paga');
    }

    return await contaReceberRepository.atualizar(id, {
      status: 'CANCELADO',
      observacoes: `${conta.observacoes || ''}\nCANCELADO: ${motivo}`
    });
  }

  // 🆕 NOVO: Atualizar conta (antes do pagamento)
  async atualizar(id, data) {
    const conta = await contaReceberRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    
    if (conta.status === 'PAGO') {
      throw new ApiError(400, 'Não é possível atualizar conta já paga');
    }

    return await contaReceberRepository.atualizar(id, data);
  }
}

module.exports = new ContaReceberService();