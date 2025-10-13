const contaReceberRepository = require('../repositories/contaReceberRepository');
const alunoService = require('./alunoService');
const planoService = require('./planoService');
const descontoService = require('./descontoService');
const caixaService = require('./caixaService'); // 🆕 IMPORT ADICIONADO
const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

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

  async criar(data) {
    const { alunoId, planoId, descontoId, dataVencimento, observacoes } = data;

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
      alunoId,
      planoId,
      descontoId,
      valorOriginal,
      valorDesconto,
      valorFinal,
      valorRestante: valorFinal,
      dataVencimento: new Date(dataVencimento),
      observacoes,
      status: 'PENDENTE'
    });
  }

  /**
   * 🆕 NOVO: Registrar pagamento com controle automático de caixa
   * @param {string} id - ID da conta
   * @param {object} data - Dados do pagamento
   */
  async registrarPagamento(id, data) {
    const { valorPago, formaPagamento, dataPagamento } = data;

    // Validações
    if (!valorPago || valorPago <= 0) {
      throw new ApiError(400, 'Valor pago deve ser maior que zero');
    }

    if (!formaPagamento) {
      throw new ApiError(400, 'Forma de pagamento é obrigatória');
    }

    const formasPagamentoValidas = [
      'DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 
      'TRANSFERENCIA', 'BOLETO', 'CHEQUE'
    ];

    if (!formasPagamentoValidas.includes(formaPagamento)) {
      throw new ApiError(400, 'Forma de pagamento inválida');
    }

    // 🆕 1. Buscar caixa aberto AUTOMATICAMENTE
    const caixaAberto = await caixaService.buscarAberto();

    // 🆕 2. Usar TRANSAÇÃO para garantir atomicidade
    return await prisma.$transaction(async (tx) => {
      
      // 3. Buscar conta dentro da transação
      const conta = await tx.contaReceber.findUnique({ where: { id } });
      if (!conta) throw new ApiError(404, 'Conta não encontrada');
      
      if (conta.status === 'PAGO') {
        throw new ApiError(400, 'Conta já está paga');
      }

      if (conta.status === 'CANCELADO') {
        throw new ApiError(400, 'Não é possível pagar conta cancelada');
      }

      // 4. Calcular novos valores
      const novoValorPago = conta.valorPago + Number(valorPago);
      const novoValorRestante = conta.valorFinal - novoValorPago;

      if (novoValorPago > conta.valorFinal) {
        throw new ApiError(400, 
          `Valor pago (R$ ${novoValorPago.toFixed(2)}) excede o valor da conta (R$ ${conta.valorFinal.toFixed(2)})`
        );
      }

      const novoStatus = novoValorRestante <= 0 ? 'PAGO' : 'PENDENTE';

      // 5. Atualizar conta dentro da transação
      const contaAtualizada = await tx.contaReceber.update({
        where: { id },
        data: {
          valorPago: novoValorPago,
          valorRestante: novoValorRestante,
          status: novoStatus,
          dataPagamento: novoStatus === 'PAGO' 
            ? new Date(dataPagamento || Date.now()) 
            : conta.dataPagamento,
          formaPagamento
        }
      });

      // 🆕 6. Registrar movimento no caixa OBRIGATORIAMENTE (dentro da transação)
      await caixaService.registrarMovimento(
        caixaAberto.id,
        {
          tipo: 'ENTRADA',
          valor: valorPago,
          descricao: `Pagamento conta ${conta.numero} - Aluno`,
          formaPagamento,
          contaReceberId: id,
          categoria: 'MENSALIDADE'
        },
        tx // 🆕 Passa a transação
      );

      return contaAtualizada;
    });
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

    if (!motivo || motivo.trim() === '') {
      throw new ApiError(400, 'Motivo do cancelamento é obrigatório');
    }

    return await contaReceberRepository.atualizar(id, {
      status: 'CANCELADO',
      observacoes: `${conta.observacoes || ''}\nCANCELADO: ${motivo.trim()}`
    });
  }

  /**
   * 🆕 NOVO: Atualizar conta (permitir ajustes antes do pagamento)
   */
  async atualizar(id, data) {
    
    const conta = await contaReceberRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    
    if (conta.status === 'PAGO') {
      throw new ApiError(400, 'Não é possível editar conta já paga');
    }

    if (conta.status === 'CANCELADO') {
      throw new ApiError(400, 'Não é possível editar conta cancelada');
    }

    // Recalcular valor final se necessário
    if (data.valorOriginal !== undefined || data.valorDesconto !== undefined) {
      const valorOriginal = data.valorOriginal !== undefined 
        ? Number(data.valorOriginal) 
        : conta.valorOriginal;
      
      const valorDesconto = data.valorDesconto !== undefined 
        ? Number(data.valorDesconto) 
        : conta.valorDesconto;

      data.valorFinal = valorOriginal - valorDesconto;
      data.valorRestante = data.valorFinal - conta.valorPago;
      
    }

    return await contaReceberRepository.atualizar(id, data);
  }
}

module.exports = new ContaReceberService();