const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

class CaixaRepository {
  async criar(data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.caixa.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { empresaId, status, dataInicio, dataFim, skip = 0, take = 10 } = filtros;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const where = { empresaId };
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

  async buscarPorId(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.caixa.findFirst({ where: { id, empresaId } });
  }

  async buscarAberto(empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.caixa.findFirst({
      where: { empresaId, status: 'ABERTO' },
      orderBy: { dataAbertura: 'desc' }
    });
  }

  async atualizar(id, data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.caixa.update({
      where: { id },
      data
    });
  }

  async deletar(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.caixa.delete({ where: { id, empresaId } });
  }
}

module.exports = new CaixaRepository();
