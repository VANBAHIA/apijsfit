const prisma = require('../config/database');

class DescontoRepository {
  async criar(data) {
    return await prisma.desconto.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { status, tipo, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    const [total, descontos] = await Promise.all([
      prisma.desconto.count({ where }),
      prisma.desconto.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { descricao: 'asc' },
      }),
    ]);

    return { total, descontos };
  }

  async buscarPorId(id) {
    return await prisma.desconto.findUnique({ where: { id } });
  }

  async buscarPorDescricao(descricao) {
    return await prisma.desconto.findFirst({ 
      where: { 
        descricao: { 
          equals: descricao, 
          mode: 'insensitive' 
        } 
      } 
    });
  }

  async atualizar(id, data) {
    return await prisma.desconto.update({ where: { id }, data });
  }

  async deletar(id) {
    return await prisma.desconto.delete({ where: { id } });
  }
}

module.exports = new DescontoRepository();