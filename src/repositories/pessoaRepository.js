const prisma = require('../config/database');

class PessoaRepository {

  async criar(data) {
    return await prisma.pessoa.upsert({
      where: {
        empresaId_doc1: {
          empresaId: data.empresaId,
          doc1: data.doc1,
        },
      },
      update: data,
      create: data,
    });
  }

  async buscarTodos(filtros = {}) {
    const { situacao, tipo, skip = 0, take = 10 } = filtros;

    const where = {};
    if (situacao) where.situacao = situacao;
    if (tipo) where.tipo = tipo;

    const [total, pessoas] = await Promise.all([
      prisma.pessoa.count({ where }),
      prisma.pessoa.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, pessoas };
  }

  async buscarPorId(id) {
    return await prisma.pessoa.findUnique({
      where: { id },
      include: {
        alunos: true,
      },
    });
  }


  async buscarPordoc1(doc1) {
    return await prisma.pessoa.findUnique({
      where: { doc1 },
    });
  }


  async atualizar(id, data) {
    return await prisma.pessoa.update({
      where: { id },
      data,
    });
  }

  async deletar(id) {
    return await prisma.pessoa.delete({
      where: { id },
    });
  }

  async buscarComFiltros(filtros) {
    const { nome1, doc1, situacao } = filtros;

    const where = {};

    if (nome1) {
      where.nome1 = { contains: nome1, mode: 'insensitive' };
    }
    if (doc1) where.doc1 = doc1;
    if (situacao) where.situacao = situacao;

    return await prisma.pessoa.findMany({
      where,
      orderBy: { nome1: 'asc' },
    });
  }
}

module.exports = new PessoaRepository();