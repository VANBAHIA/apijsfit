const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

class ContaPagarRepository {
  async criar(data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaPagar.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { 
      empresaId,
      status, 
      categoria, 
      fornecedorId, 
      funcionarioId,
      dataInicio, 
      dataFim, 
      skip = 0, 
      take = 10 
    } = filtros;

    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const where = { empresaId };
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

  async buscarPorId(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaPagar.findFirst({ where: { id, empresaId } });
  }

  async buscarPorNumero(numero, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaPagar.findFirst({ where: { numero, empresaId } });
  }

  async atualizar(id, data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaPagar.update({ where: { id }, data });
  }

  async deletar(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaPagar.delete({ where: { id, empresaId } });
  }

  async buscarVencidas(empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaPagar.findMany({
      where: {
        empresaId,
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() }
      }
    });
  }

  async buscarPorCategoria(categoria, empresaId, status = null) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    const where = { empresaId, categoria };
    if (status) where.status = status;

    return await prisma.contaPagar.findMany({
      where,
      orderBy: { dataVencimento: 'asc' }
    });
  }

  async totaisPorCategoria(empresaId, dataInicio, dataFim) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    const where = { empresaId, status: 'PAGO' };

    if (dataInicio || dataFim) {
      where.dataPagamento = {};
      if (dataInicio) where.dataPagamento.gte = new Date(dataInicio);
      if (dataFim) where.dataPagamento.lte = new Date(dataFim);
    }

    return await prisma.contaPagar.groupBy({
      by: ['categoria'],
      where,
      _sum: { valorFinal: true },
      _count: { id: true }
    });
  }
}

module.exports = new ContaPagarRepository();
