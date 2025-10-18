const prisma = require('../config/database');

class GrupoExercicioRepository {
  async criar(data) {
    return await prisma.grupoExercicio.create({
      data,
    });
  }

  async buscarUltimoCodigo(empresaId) {
  const ultimo = await prisma.grupoExercicio.findFirst({
    where: { empresaId },
    orderBy: { codigo: 'desc' },
    select: { codigo: true },
  });
  return ultimo ? Number(ultimo.codigo) : 0;
}


  async buscarTodos(filtros = {}) {
    const { skip = 0, take = 10, empresaId } = filtros;

    const where = { empresaId };

    const [total, grupos] = await Promise.all([
      prisma.grupoExercicio.count({ where }),
      prisma.grupoExercicio.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { nome: 'asc' },
      }),
    ]);

    return { total, grupos };
  }

  async buscarPorId(id, empresaId) {
    return await prisma.grupoExercicio.findFirst({
      where: { 
        id,
        empresaId 
      },
    });
  }

  async buscarPorNome(nome, empresaId) {
    return await prisma.grupoExercicio.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive'
        },
        empresaId
      },
    });
  }

  async atualizar(id, data, empresaId) {
    return await prisma.grupoExercicio.update({
      where: { 
        id,
        empresaId 
      },
      data,
    });
  }

  async deletar(id, empresaId) {
    return await prisma.grupoExercicio.delete({
      where: { 
        id,
        empresaId 
      },
    });
  }

  async contarPorEmpresa(empresaId) {
    return await prisma.grupoExercicio.count({
      where: { empresaId }
    });
  }
}

module.exports = new GrupoExercicioRepository();