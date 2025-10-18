const prisma = require('../config/database');

class TurmaRepository {
  async criar(data) {
    return await prisma.turma.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { status, sexo, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (status) where.status = status;
    if (sexo) where.sexo = sexo;

    const [total, turmas] = await Promise.all([
      prisma.turma.count({ where }),
      prisma.turma.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { nome: 'asc' }
      })
    ]);

    return { total, turmas };
  }

  async buscarPorId(id) {
    return await prisma.turma.findUnique({ where: { id } });
  }

  async buscarPorNome(nome, empresaId) {
  return await prisma.turma.findUnique({
    where: {
      empresaId_nome: {
        empresaId,
        nome,
      },
    },
  });
}


  async atualizar(id, data) {
    return await prisma.turma.update({ where: { id }, data });
  }

  async deletar(id) {
    return await prisma.turma.delete({ where: { id } });
  }

  async buscarComDetalhes(id) {
    const turma = await prisma.turma.findUnique({ where: { id } });
    
    if (!turma) return null;

    // Buscar detalhes dos locais
    const horariosDetalhados = await Promise.all(
      turma.horarios.map(async (horario) => {
        const local = await prisma.local.findUnique({
          where: { id: horario.localId }
        });
        return { ...horario, localDetalhes: local };
      })
    );

    // Buscar detalhes dos instrutores
    const instrutoresDetalhados = await Promise.all(
      turma.instrutores.map(async (instrutor) => {
        const funcionario = await prisma.funcionario.findUnique({
          where: { id: instrutor.funcionarioId },
          include: { pessoa: true }
        });
        return { ...instrutor, funcionarioDetalhes: funcionario };
      })
    );

    return {
      ...turma,
      horarios: horariosDetalhados,
      instrutores: instrutoresDetalhados
    };
  }
}

module.exports = new TurmaRepository();