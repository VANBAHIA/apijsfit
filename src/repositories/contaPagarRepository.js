const prisma = require('../config/database');

class ContaPagarRepository {
  async criar(data) {
    return await prisma.contaPagar.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { 
      status, 
      categoria, 
      fornecedorId, 
      funcionarioId,
      dataInicio, 
      dataFim, 
      skip = 0, 
      take = 10 
    } = filtros;
    
    const where = {};
    
    if (status) where.status = status;
    if (categoria) where.categoria = categoria;
    if (fornecedorId) where.fornecedorId = fornecedorId;
    if (funcionarioId) where.funcionarioId = funcionarioId;
    
    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) where.dataVencimento.gte = new Date(dataInicio);
      if (dataFim) where.dataVencimento.lte = new Date(dataFim);
    }

    const [total, contas] = await Promise.all([
      prisma.contaPagar.count({ where }),
      prisma.contaPagar.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { dataVencimento: 'desc' }
      })
    ]);

    return { total, contas };
  }

  async buscarPorId(id) {
    return await prisma.contaPagar.findUnique({ where: { id } });
  }

  async buscarPorNumero(numero) {
    return await prisma.contaPagar.findUnique({ where: { numero } });
  }

  async atualizar(id, data) {
    return await prisma.contaPagar.update({ where: { id }, data });
  }

  async deletar(id) {
    return await prisma.contaPagar.delete({ where: { id } });
  }

  async buscarVencidas() {
    return await prisma.contaPagar.findMany({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() }
      }
    });
  }

  async buscarPorCategoria(categoria, status = null) {
    const where = { categoria };
    if (status) where.status = status;
    
    return await prisma.contaPagar.findMany({
      where,
      orderBy: { dataVencimento: 'asc' }
    });
  }

  async totaisPorCategoria(dataInicio, dataFim) {
    const where = {
      status: 'PAGO'
    };

    if (dataInicio || dataFim) {
      where.dataPagamento = {};
      if (dataInicio) where.dataPagamento.gte = new Date(dataInicio);
      if (dataFim) where.dataPagamento.lte = new Date(dataFim);
    }

    return await prisma.contaPagar.groupBy({
      by: ['categoria'],
      where,
      _sum: {
        valorFinal: true
      },
      _count: {
        id: true
      }
    });
  }
}

module.exports = new ContaPagarRepository();