const prisma = require('../config/database');

class PlanoRepository {
  async criar(data) {
    return await prisma.plano.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { status, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (status) where.status = status;

    const [total, planos] = await Promise.all([
      prisma.plano.count({ where }),
      prisma.plano.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { codigo: 'asc' },
      }),
    ]);

    return { total, planos };
  }

  async buscarPorId(id) {
    return await prisma.plano.findUnique({ where: { id } });
  }

  async buscarPorCodigo(codigo) {
    return await prisma.plano.findUnique({ where: { codigo } });
  }

  async atualizar(id, data) {
    return await prisma.plano.update({ where: { id }, data });
  }

  async deletar(id) {
    return await prisma.plano.delete({ where: { id } });
  }
}

module.exports = new PlanoRepository();