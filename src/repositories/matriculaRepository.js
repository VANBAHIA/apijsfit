// src/repositories/matriculaRepository.js
const prisma = require('../config/database');

class MatriculaRepository {
  async criar(data) {
    return await prisma.matricula.create({
      data,
      include: {
        aluno: { include: { pessoa: true } },
        plano: true,
        turma: true,
        desconto: true,
      },
    });
  }

  async buscarTodos(filtros = {}) {
    const { situacao, alunoId, empresaId, skip = 0, take = 10 } = filtros;

    if (!empresaId) throw new Error('empresaId é obrigatório em buscarTodos');

    const where = { empresaId };
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
          desconto: true,
        },
        skip: Number(skip),
        take: Number(take),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, matriculas };
  }

  async buscarPorId(id, empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório em buscarPorId');

    return await prisma.matricula.findFirst({
      where: { id, empresaId },
      include: {
        aluno: { include: { pessoa: true } },
        plano: true,
        turma: true,
        desconto: true,
      },
    });
  }

  async buscarPorCodigo(codigo, empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório em buscarPorCodigo');

    return await prisma.matricula.findFirst({
      where: { codigo, empresaId },
    });
  }

  async atualizar(id, data) {
    if (!data.empresaId) throw new Error('empresaId é obrigatório em atualizar');

    return await prisma.matricula.updateMany({
      where: { id, empresaId: data.empresaId },
      data,
    });
  }
  async deletar(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório em deletar');

    try {
      // tenta excluir
      const resultado = await prisma.matricula.deleteMany({
        where: { id, empresaId },
      });

      if (resultado.count === 0) {
        throw new ApiError(404, 'Matrícula não encontrada para exclusão');
      }

      return resultado;
    } catch (error) {
      // trata FK ou erro genérico
      if (error.code === 'P2003') {
        // erro de foreign key
        throw new ApiError(400, 'Não é possível excluir matrícula com vínculos ativos (ex: contas a receber)');
      }

      throw new ApiError(500, `Erro ao excluir matrícula: ${error.message}`);
    }
  }


  async buscarAtivasPorAluno(alunoId, empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório em buscarAtivasPorAluno');

    return await prisma.matricula.findMany({
      where: {
        alunoId,
        empresaId,
        situacao: 'ATIVA',
      },
      include: { plano: true, turma: true },
    });
  }
}

module.exports = new MatriculaRepository();
