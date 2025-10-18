const prisma = require('../config/database');

class EquipamentoRepository {
  async criar(data) {
    return await prisma.equipamento.create({
      data,
    });
  }

  async buscarTodos(filtros = {}) {
    const { skip = 0, take = 10, empresaId } = filtros;

    const where = { empresaId };

    const [total, equipamentos] = await Promise.all([
      prisma.equipamento.count({ where }),
      prisma.equipamento.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { codigo: 'asc' },
      }),
    ]);

    return { total, equipamentos };
  }

  async buscarPorId(id, empresaId) {
    return await prisma.equipamento.findFirst({
      where: { 
        id,
        empresaId 
      },
    });
  }

  async buscarPorCodigo(codigo, empresaId) {
    return await prisma.equipamento.findFirst({
      where: {
        codigo,
        empresaId
      },
    });
  }

  async buscarPorNome(nome, empresaId) {
    return await prisma.equipamento.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive'
        },
        empresaId
      },
    });
  }

  async buscarUltimoCodigo(empresaId) {
    return await prisma.equipamento.findFirst({
      where: { empresaId },
      orderBy: { codigo: 'desc' },
      select: { codigo: true }
    });
  }

  async atualizar(id, data, empresaId) {
    return await prisma.equipamento.update({
      where: { 
        id,
        empresaId 
      },
      data,
    });
  }

  async deletar(id, empresaId) {
    return await prisma.equipamento.delete({
      where: { 
        id,
        empresaId 
      },
    });
  }

  async contarPorEmpresa(empresaId) {
    return await prisma.equipamento.count({
      where: { empresaId }
    });
  }
}

module.exports = new EquipamentoRepository();