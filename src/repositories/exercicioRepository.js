const prisma = require('../config/database');

class ExercicioRepository {
  async criar(data) {
    return await prisma.exercicio.create({ data });
  }

  async buscarTodos({ skip = 0, take = 10, empresaId, busca, grupoId } = {}) {
    const where = { empresaId };

    if (busca) {
      // busca no nome (case-insensitive)
      where.nome = { contains: busca, mode: 'insensitive' };
    }

    if (grupoId) {
      where.grupoId = grupoId;
    }

    const [total, exercicios] = await Promise.all([
      prisma.exercicio.count({ where }),
      prisma.exercicio.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { nome: 'asc' },
      }),
    ]);

    return { total, exercicios };
  }

  async buscarPorId(id, empresaId) {
    return await prisma.exercicio.findFirst({
      where: { id, empresaId },
    });
  }

  async atualizar(id, data, empresaId) {
    return await prisma.exercicio.updateMany({
      where: { id, empresaId },
      data,
    }).then(async (res) => {
      // updateMany retorna { count: n } -> buscar o registro atualizado
      if (res.count === 0) return null;
      return await this.buscarPorId(id, empresaId);
    });
  }

  async deletar(id, empresaId) {
    // deleteMany para garantir empresaId
    return await prisma.exercicio.deleteMany({
      where: { id, empresaId },
    }).then(res => res.count);
  }

  async contarPorEmpresa(empresaId) {
    return await prisma.exercicio.count({ where: { empresaId } });
  }
}

module.exports = new ExercicioRepository();
