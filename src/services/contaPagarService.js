const contaPagarRepository = require('../repositories/contaPagarRepository');
const funcionarioService = require('./funcionarioService');
const caixaService = require('./caixaService'); // ✅ Import já existe
const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

class ContaPagarService {
  
  async gerarNumero() {
    const ultimaConta = await prisma.contaPagar.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true }
    });

    if (!ultimaConta) return 'CP00001';
    
    const ultimoNumero = parseInt(ultimaConta.numero.replace('CP', ''));
    const proximoNumero = ultimoNumero + 1;
    
    return `CP${proximoNumero.toString().padStart(5, '0')}`;
  }

  async validarDados(data) {
    const { categoria, descricao, valorOriginal, dataVencimento } = data;

    if (!categoria) {
      throw new ApiError(400, 'Categoria é obrigatória');
    }

    const categoriasValidas = [
      'FORNECEDOR', 'SALARIO', 'ALUGUEL', 'ENERGIA', 'AGUA', 
      'TELEFONE', 'INTERNET', 'EQUIPAMENTO', 'MANUTENCAO', 'OUTROS'
    ];

    if (!categoriasValidas.includes(categoria)) {
      throw new ApiError(400, 'Categoria inválida');
    }

    if (!descricao || descricao.trim() === '') {
      throw new ApiError(400, 'Descrição é obrigatória');
    }

    if (!valorOriginal || valorOriginal <= 0) {
      throw new ApiError(400, 'Valor deve ser maior que zero');
    }

    if (!dataVencimento) {
      throw new ApiError(400, 'Data de vencimento é obrigatória');
    }

    // Validações específicas por categoria
    if (categoria === 'SALARIO' && !data.funcionarioId) {
      throw new ApiError(400, 'Funcionário é obrigatório para categoria SALARIO');
    }

    if (categoria === 'FORNECEDOR' && !data.fornecedorId && !data.fornecedorNome) {
      throw new ApiError(400, 'Fornecedor é obrigatório para categoria FORNECEDOR');
    }
  }

  async criar(data) {
    await this.validarDados(data);

    const {
      categoria,
      descricao,
      valorOriginal,
      dataVencimento,
      fornecedorId,
      fornecedorNome,
      fornecedorDoc,
      funcionarioId,
      valorDesconto = 0,
      documento,
      observacoes,
      numeroParcela,
      totalParcelas,
      anexos = []
    } = data;

    // Se for salário, verificar se funcionário existe
    if (categoria === 'SALARIO' && funcionarioId) {
      await funcionarioService.buscarPorId(funcionarioId);
    }

    const valorFinal = Number(valorOriginal) - Number(valorDesconto);
    const numero = await this.gerarNumero();

    return await contaPagarRepository.criar({
      numero,
      categoria,
      descricao: descricao.trim(),
      valorOriginal: Number(valorOriginal),
      valorDesconto: Number(valorDesconto),
      valorFinal,
      valorRestante: valorFinal,
      dataVencimento: new Date(dataVencimento),
      fornecedorId,
      fornecedorNome,
      fornecedorDoc,
      funcionarioId,
      documento,
      observacoes,
      numeroParcela,
      totalParcelas,
      anexos,
      status: 'PENDENTE'
    });
  }

  /**
   * 🆕 NOVO: Registrar pagamento com controle automático de caixa
   * @param {string} id - ID da conta
   * @param {object} data - Dados do pagamento
   */
  async registrarPagamento(id, data) {
    const { 
      valorPago, 
      formaPagamento, 
      dataPagamento,
      valorJuros = 0,
      valorMulta = 0
    } = data;

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
      const conta = await tx.contaPagar.findUnique({ where: { id } });
      if (!conta) throw new ApiError(404, 'Conta não encontrada');
      
      if (conta.status === 'PAGO') {
        throw new ApiError(400, 'Conta já está paga');
      }

      if (conta.status === 'CANCELADO') {
        throw new ApiError(400, 'Não é possível pagar conta cancelada');
      }

      // 4. Calcular novos valores
      const novoValorJuros = conta.valorJuros + Number(valorJuros);
      const novoValorMulta = conta.valorMulta + Number(valorMulta);
      const valorTotalPago = conta.valorPago + Number(valorPago);
      const valorFinalAtualizado = conta.valorFinal + Number(valorJuros) + Number(valorMulta);
      const novoValorRestante = valorFinalAtualizado - valorTotalPago;

      if (valorTotalPago > valorFinalAtualizado) {
        throw new ApiError(400, 
          `Valor pago (R$ ${valorTotalPago.toFixed(2)}) excede o valor da conta (R$ ${valorFinalAtualizado.toFixed(2)})`
        );
      }

      const novoStatus = novoValorRestante <= 0 ? 'PAGO' : 'PENDENTE';

      // 5. Atualizar conta dentro da transação
      const contaAtualizada = await tx.contaPagar.update({
        where: { id },
        data: {
          valorPago: valorTotalPago,
          valorRestante: novoValorRestante,
          valorJuros: novoValorJuros,
          valorMulta: novoValorMulta,
          valorFinal: valorFinalAtualizado,
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
          tipo: 'SAIDA',
          valor: valorPago,
          descricao: `Pagamento conta ${conta.numero} - ${conta.categoria} - ${conta.descricao}`,
          formaPagamento,
          contaPagarId: id,
          categoria: conta.categoria
        },
        tx // 🆕 Passa a transação
      );

      return contaAtualizada;
    });
  }

  async atualizarStatusVencidas() {
    const contasVencidas = await contaPagarRepository.buscarVencidas();
    
    for (const conta of contasVencidas) {
      await contaPagarRepository.atualizar(conta.id, { status: 'VENCIDO' });
    }

    return { atualizadas: contasVencidas.length };
  }

  async listarTodos(filtros) {
    return await contaPagarRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const conta = await contaPagarRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    return conta;
  }

  async atualizar(id, data) {
    const conta = await contaPagarRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    
    if (conta.status === 'PAGO') {
      throw new ApiError(400, 'Não é possível editar conta já paga');
    }

    if (conta.status === 'CANCELADO') {
      throw new ApiError(400, 'Não é possível editar conta cancelada');
    }

    // Validar dados se foram enviados
    if (data.categoria || data.descricao || data.valorOriginal || data.dataVencimento) {
      await this.validarDados({
        categoria: data.categoria || conta.categoria,
        descricao: data.descricao || conta.descricao,
        valorOriginal: data.valorOriginal || conta.valorOriginal,
        dataVencimento: data.dataVencimento || conta.dataVencimento,
        funcionarioId: data.funcionarioId || conta.funcionarioId,
        fornecedorId: data.fornecedorId || conta.fornecedorId,
        fornecedorNome: data.fornecedorNome || conta.fornecedorNome
      });
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

    return await contaPagarRepository.atualizar(id, data);
  }

  async cancelar(id, motivo) {
    const conta = await contaPagarRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    
    if (conta.status === 'PAGO') {
      throw new ApiError(400, 'Não é possível cancelar conta já paga');
    }

    if (!motivo || motivo.trim() === '') {
      throw new ApiError(400, 'Motivo do cancelamento é obrigatório');
    }

    return await contaPagarRepository.atualizar(id, {
      status: 'CANCELADO',
      observacoes: `${conta.observacoes || ''}\nCANCELADO: ${motivo.trim()}`
    });
  }

  async deletar(id) {
    const conta = await contaPagarRepository.buscarPorId(id);
    if (!conta) throw new ApiError(404, 'Conta não encontrada');
    
    if (conta.status === 'PAGO') {
      throw new ApiError(400, 'Não é possível deletar conta já paga');
    }

    return await contaPagarRepository.deletar(id);
  }

  async buscarPorCategoria(categoria, status) {
    return await contaPagarRepository.buscarPorCategoria(categoria, status);
  }

  async relatorioTotaisPorCategoria(dataInicio, dataFim) {
    const totais = await contaPagarRepository.totaisPorCategoria(dataInicio, dataFim);
    
    let totalGeral = 0;
    const resultado = totais.map(item => {
      totalGeral += item._sum.valorFinal || 0;
      return {
        categoria: item.categoria,
        total: item._sum.valorFinal || 0,
        quantidade: item._count.id
      };
    });

    return {
      categorias: resultado,
      totalGeral
    };
  }

  async criarParcelado(data) {
    const { 
      totalParcelas, 
      valorTotal, 
      dataVencimentoPrimeira,
      categoria,
      descricao,
      fornecedorId,
      fornecedorNome,
      fornecedorDoc,
      funcionarioId,
      documento,
      observacoes
    } = data;

    if (!totalParcelas || totalParcelas < 2) {
      throw new ApiError(400, 'Total de parcelas deve ser no mínimo 2');
    }

    if (!valorTotal || valorTotal <= 0) {
      throw new ApiError(400, 'Valor total deve ser maior que zero');
    }

    const valorParcela = Number(valorTotal) / Number(totalParcelas);
    const contas = [];

    for (let i = 1; i <= totalParcelas; i++) {
      const dataVencimento = new Date(dataVencimentoPrimeira);
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));

      const conta = await this.criar({
        categoria,
        descricao: `${descricao} - Parcela ${i}/${totalParcelas}`,
        valorOriginal: valorParcela,
        dataVencimento,
        fornecedorId,
        fornecedorNome,
        fornecedorDoc,
        funcionarioId,
        documento,
        observacoes,
        numeroParcela: i,
        totalParcelas
      });

      contas.push(conta);
    }

    return contas;
  }
}

module.exports = new ContaPagarService();