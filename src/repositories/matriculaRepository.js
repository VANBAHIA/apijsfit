const prisma = require('../config/database');

class MatriculaRepository {
  async criar(data) {
    return await prisma.matricula.create({
      data,
      include: {
        aluno: { include: { pessoa: true } },
        plano: true,
        turma: true,
        desconto: true
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { situacao, alunoId, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (situacao) where.situacao = situacao;
    if (alunoId) where.alunoId = alunoId;

    const [total, matriculas] = await Promise.all([
      prisma.matricula.count({ where }),
      prisma.matricula.findMany({
        where,
        include: {
          aluno: { include: { pessoa: true } },
          plano: true,
          turma: true,
          desconto: true
        },
        skip: Number(skip),
        take: Number(take),
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { total, matriculas };
  }

  async buscarPorId(id) {
    return await prisma.matricula.findUnique({
      where: { id },
      include: {
        aluno: { include: { pessoa: true } },
        plano: true,
        turma: true,
        desconto: true
      }
    });
  }

  async buscarPorCodigo(codigo) {
    return await prisma.matricula.findUnique({ where: { codigo } });
  }

  async atualizar(id, data) {
    return await prisma.matricula.update({
      where: { id },
      data,
      include: {
        aluno: { include: { pessoa: true } },
        plano: true,
        turma: true,
        desconto: true
      }
    });
  }

  async deletar(id) {
    return await prisma.matricula.delete({ where: { id } });
  }

  // Buscar matrículas ativas do aluno
  async buscarAtivasPorAluno(alunoId) {
    return await prisma.matricula.findMany({
      where: { 
        alunoId,
        situacao: 'ATIVA'
      },
      include: { plano: true, turma: true }
    });
  }
}

module.exports = new MatriculaRepository();