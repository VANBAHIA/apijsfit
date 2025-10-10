const prisma = require('../config/database');

class AlunoRepository {
  async criar(data) {
    return await prisma.aluno.create({
      data,
      include: {
        pessoa: true,
      },
    });
  }

  async buscarTodos(filtros = {}) {
    const { skip = 0, take = 10 } = filtros;

    const [total, alunos] = await Promise.all([
      prisma.aluno.count(),
      prisma.aluno.findMany({
        skip: Number(skip),
        take: Number(take),
        include: {
          pessoa: {
            select: {
              nome: true,
              cpf: true,
              contatos: true,
              situacao: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, alunos };
  }

  async buscarPorId(id) {
    return await prisma.aluno.findUnique({
      where: { id },
      include: {
        pessoa: true,
      },
    });
  }

  async buscarPorPessoaId(pessoaId) {
    return await prisma.aluno.findFirst({
      where: { pessoaId },
      include: {
        pessoa: true,
      },
    });
  }

  async atualizar(id, data) {
    return await prisma.aluno.update({
      where: { id },
      data,
      include: {
        pessoa: true,
      },
    });
  }

  async deletar(id) {
    return await prisma.aluno.delete({
      where: { id },
    });
  }
}

module.exports = new AlunoRepository();