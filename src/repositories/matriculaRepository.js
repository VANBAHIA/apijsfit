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
    if (!empresaId) throw new Error('empresaId é obrigatório em deletar');

    return await prisma.matricula.deleteMany({
      where: { id, empresaId },
    });
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
