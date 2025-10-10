const prisma = require('../config/database');

class FuncaoRepository {
  async criar(data) {
    return await prisma.funcao.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { status, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (status) where.status = status;

    const [total, funcoes] = await Promise.all([
      prisma.funcao.count({ where }),
      prisma.funcao.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { funcao: 'asc' },
      }),
    ]);

    return { total, funcoes };
  }

  async buscarPorId(id) {
    return await prisma.funcao.findUnique({ where: { id } });
  }

  async buscarPorNome(funcao) {
    return await prisma.funcao.findUnique({ where: { funcao } });
  }

  async atualizar(id, data) {
    return await prisma.funcao.update({ where: { id }, data });
  }

  async deletar(id) {
    return await prisma.funcao.delete({ where: { id } });
  }
}

module.exports = new FuncaoRepository();