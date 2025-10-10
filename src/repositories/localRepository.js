const prisma = require('../config/database');

class LocalRepository {
  async criar(data) {
    return await prisma.local.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { status, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (status) where.status = status;

    const [total, locais] = await Promise.all([
      prisma.local.count({ where }),
      prisma.local.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { nome: 'asc' },
      }),
    ]);

    return { total, locais };
  }

  async buscarPorId(id) {
    return await prisma.local.findUnique({ where: { id } });
  }

  async atualizar(id, data) {
    return await prisma.local.update({ where: { id }, data });
  }

  async deletar(id) {
    return await prisma.local.delete({ where: { id } });
  }
}

module.exports = new LocalRepository();