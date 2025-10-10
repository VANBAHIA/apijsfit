const prisma = require('../config/database');

class FuncionarioRepository {
  async criar(data) {
    return await prisma.funcionario.create({
      data,
      include: {
        pessoa: true
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { situacao, funcao, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (situacao) where.situacao = situacao;
    if (funcao) where.funcao = { contains: funcao, mode: 'insensitive' };

    const [total, funcionarios] = await Promise.all([
      prisma.funcionario.count({ where }),
      prisma.funcionario.findMany({
        where,
        include: {
          pessoa: {
            select: {
              id: true,
              codigo: true,
              nome1: true,
              nome2: true,
              doc1: true,
              doc2: true,
              dtNsc: true,
              situacao: true,
              contatos: true,
              enderecos: true
            }
          }
        },
        skip: Number(skip),
        take: Number(take),
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { total, funcionarios };
  }

  async buscarPorId(id) {
    return await prisma.funcionario.findUnique({
      where: { id },
      include: {
        pessoa: true
      }
    });
  }

  async buscarPorMatricula(matricula) {
    return await prisma.funcionario.findUnique({
      where: { matricula },
      include: {
        pessoa: true
      }
    });
  }

  async buscarPorPessoaId(pessoaId) {
    return await prisma.funcionario.findFirst({
      where: { pessoaId },
      include: {
        pessoa: true
      }
    });
  }

  async atualizar(id, data) {
    return await prisma.funcionario.update({
      where: { id },
      data,
      include: {
        pessoa: true
      }
    });
  }

  async deletar(id) {
    return await prisma.funcionario.delete({
      where: { id }
    });
  }

  async buscarInstrutores(filtros = {}) {
    const { skip = 0, take = 100 } = filtros;

    return await prisma.funcionario.findMany({
      where: {
        situacao: 'ATIVO',
        funcao: { contains: 'instrutor', mode: 'insensitive' }
      },
      include: {
        pessoa: {
          select: {
            nome1: true,
            nome2: true,
            doc1: true
          }
        }
      },
      skip: Number(skip),
      take: Number(take),
      orderBy: { pessoa: { nome1: 'asc' } }
    });
  }
}

module.exports = new FuncionarioRepository();