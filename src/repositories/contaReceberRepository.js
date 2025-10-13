const prisma = require('../config/database');

class ContaReceberRepository {
  async criar(data) {
    return await prisma.contaReceber.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { status, alunoId, dataInicio, dataFim, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (status) where.status = status;
    if (alunoId) where.alunoId = alunoId;
    
    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) where.dataVencimento.gte = new Date(dataInicio);
      if (dataFim) where.dataVencimento.lte = new Date(dataFim);
    }

    const [total, contas] = await Promise.all([
      prisma.contaReceber.count({ where }),
      prisma.contaReceber.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { dataVencimento: 'desc' }
      })
    ]);

    return { total, contas };
  }

  async buscarPorId(id) {
    return await prisma.contaReceber.findUnique({ where: { id } });
  }

  async buscarPorNumero(numero) {
    return await prisma.contaReceber.findUnique({ where: { numero } });
  }

  async atualizar(id, data) {
  // Converter dataVencimento para Date se existir
  if (data.dataVencimento && typeof data.dataVencimento === 'string') {
    data.dataVencimento = new Date(data.dataVencimento);
  }
  
  return await prisma.contaReceber.update({
    where: { id },
    data
  });
}

  async deletar(id) {
    return await prisma.contaReceber.delete({ where: { id } });
  }

  async buscarVencidas() {
    return await prisma.contaReceber.findMany({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() }
      }
    });
  }
}

module.exports = new ContaReceberRepository();