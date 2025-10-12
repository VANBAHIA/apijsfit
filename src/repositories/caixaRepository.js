const prisma = require('../config/database');

class CaixaRepository {
  async criar(data) {
    return await prisma.caixa.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { status, dataInicio, dataFim, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (status) where.status = status;
    
    if (dataInicio || dataFim) {
      where.dataAbertura = {};
      if (dataInicio) where.dataAbertura.gte = new Date(dataInicio);
      if (dataFim) where.dataAbertura.lte = new Date(dataFim);
    }

    const [total, caixas] = await Promise.all([
      prisma.caixa.count({ where }),
      prisma.caixa.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { dataAbertura: 'desc' }
      })
    ]);

    return { total, caixas };
  }

  async buscarPorId(id) {
    return await prisma.caixa.findUnique({ where: { id } });
  }

  async buscarAberto() {
    return await prisma.caixa.findFirst({
      where: { status: 'ABERTO' },
      orderBy: { dataAbertura: 'desc' }
    });
  }

  async atualizar(id, data) {
    return await prisma.caixa.update({ where: { id }, data });
  }
}

module.exports = new CaixaRepository();