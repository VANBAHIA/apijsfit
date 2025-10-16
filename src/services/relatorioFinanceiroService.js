const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

class RelatorioFinanceiroService {
  
  /**
   * Buscar resumo financeiro por período
   */
  async resumoFinanceiro(dataInicio, dataFim) {
    try {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);

      // 1. RECEITAS (Contas a Receber PAGAS)
      const receitas = await prisma.contaReceber.aggregate({
        where: {
          status: 'PAGO',
          dataPagamento: {
            gte: inicio,
            lte: fim
          }
        },
        _sum: { valorPago: true },
        _count: { id: true }
      });

      // 2. DESPESAS (Contas a Pagar PAGAS)
      const despesas = await prisma.contaPagar.aggregate({
        where: {
          status: 'PAGO',
          dataPagamento: {
            gte: inicio,
            lte: fim
          }
        },
        _sum: { valorPago: true },
        _count: { id: true }
      });

      // 3. CONTAS PENDENTES
      const contasPendentes = await prisma.contaReceber.aggregate({
        where: { status: 'PENDENTE' },
        _sum: { valorRestante: true },
        _count: { id: true }
      });

      const despesasPendentes = await prisma.contaPagar.aggregate({
        where: { status: 'PENDENTE' },
        _sum: { valorRestante: true },
        _count: { id: true }
      });

      const totalReceitas = receitas._sum.valorPago || 0;
      const totalDespesas = despesas._sum.valorPago || 0;
      const saldoLiquido = totalReceitas - totalDespesas;

      return {
        periodo: { inicio: dataInicio, fim: dataFim },
        receitas: {
          total: totalReceitas,
          quantidade: receitas._count.id,
          pendente: contasPendentes._sum.valorRestante || 0
        },
        despesas: {
          total: totalDespesas,
          quantidade: despesas._count.id,
          pendente: despesasPendentes._sum.valorRestante || 0
        },
        saldoLiquido,
        margem: totalReceitas > 0 ? ((saldoLiquido / totalReceitas) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new ApiError(500, 'Erro ao gerar resumo financeiro: ' + error.message);
    }
  }

  /**
   * Receitas por forma de pagamento
   */
  async receitasPorFormaPagamento(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const dados = await prisma.contaReceber.groupBy({
      by: ['formaPagamento'],
      where: {
        status: 'PAGO',
        dataPagamento: { gte: inicio, lte: fim }
      },
      _sum: { valorPago: true },
      _count: { id: true }
    });

    return dados.map(item => ({
      formaPagamento: item.formaPagamento || 'Não informado',
      total: item._sum.valorPago || 0,
      quantidade: item._count.id
    }));
  }

  /**
   * Despesas por categoria
   */
  async despesasPorCategoria(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const dados = await prisma.contaPagar.groupBy({
      by: ['categoria'],
      where: {
        status: 'PAGO',
        dataPagamento: { gte: inicio, lte: fim }
      },
      _sum: { valorPago: true },
      _count: { id: true }
    });

    return dados.map(item => ({
      categoria: item.categoria,
      total: item._sum.valorPago || 0,
      quantidade: item._count.id
    }));
  }

  /**
   * Evolução diária de receitas vs despesas
   */
  async evolucaoDiaria(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);

    const receitas = await prisma.contaReceber.findMany({
      where: {
        status: 'PAGO',
        dataPagamento: { gte: inicio, lte: fim }
      },
      select: { dataPagamento: true, valorPago: true }
    });

    const despesas = await prisma.contaPagar.findMany({
      where: {
        status: 'PAGO',
        dataPagamento: { gte: inicio, lte: fim }
      },
      select: { dataPagamento: true, valorPago: true }
    });

    // Agrupar por data
    const mapa = new Map();

    receitas.forEach(r => {
      const data = new Date(r.dataPagamento).toISOString().split('T')[0];
      if (!mapa.has(data)) mapa.set(data, { receita: 0, despesa: 0 });
      const item = mapa.get(data);
      item.receita += r.valorPago;
    });

    despesas.forEach(d => {
      const data = new Date(d.dataPagamento).toISOString().split('T')[0];
      if (!mapa.has(data)) mapa.set(data, { receita: 0, despesa: 0 });
      const item = mapa.get(data);
      item.despesa += d.valorPago;
    });

    // Converter para array ordenado
    return Array.from(mapa.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([data, valores]) => ({
        data,
        receita: valores.receita,
        despesa: valores.despesa,
        saldo: valores.receita - valores.despesa
      }));
  }

  /**
   * Contas vencidas
   */
  async contasVencidas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const receitasVencidas = await prisma.contaReceber.findMany({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: hoje }
      },
      select: {
        numero: true,
        dataVencimento: true,
        valorRestante: true,
        aluno: { select: { pessoa: { select: { nome1: true } } } }
      },
      take: 10
    });

    const despesasVencidas = await prisma.contaPagar.findMany({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: hoje }
      },
      select: {
        numero: true,
        dataVencimento: true,
        valorRestante: true,
        categoria: true
      },
      take: 10
    });

    return { receitasVencidas, despesasVencidas };
  }
}

module.exports = new RelatorioFinanceiroService();