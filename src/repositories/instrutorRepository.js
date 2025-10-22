// src/repositories/instrutorRepository.js
const prisma = require('../config/database');

class InstrutorRepository {
  async criar(data) {
    return await prisma.instrutor.create({
      data,
      include: {
        funcionario: {
          include: {
            pessoa: {
              select: {
                id: true,
                nome1: true,
                nome2: true,
                doc1: true,
                doc2: true,
                dtNsc: true,
                situacao: true,
                contatos: true,
                enderecos: true
              }
            },
            funcao: true
          }
        }
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { empresaId, situacao, skip = 0, take = 10 } = filtros;

    const where = { empresaId };
    
    if (situacao) {
      where.funcionario = {
        situacao
      };
    }

    const [total, instrutores] = await Promise.all([
      prisma.instrutor.count({ where }),
      prisma.instrutor.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          funcionario: {
            include: {
              pessoa: {
                select: {
                  id: true,
                  nome1: true,
                  nome2: true,
                  doc1: true,
                  dtNsc: true,
                  situacao: true,
                  contatos: true
                }
              },
              funcao: {
                select: {
                  id: true,
                  funcao: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { total, instrutores };
  }

  async buscarPorId(id, empresaId) {
    return await prisma.instrutor.findFirst({
      where: { 
        id,
        empresaId 
      },
      include: {
        funcionario: {
          include: {
            pessoa: true,
            funcao: true
          }
        }
      }
    });
  }

  async buscarPorFuncionarioId(funcionarioId, empresaId) {
    return await prisma.instrutor.findFirst({
      where: { 
        funcionarioId,
        empresaId 
      },
      include: {
        funcionario: {
          include: {
            pessoa: true,
            funcao: true
          }
        }
      }
    });
  }

  async atualizar(id, data, empresaId) {
    return await prisma.instrutor.updateMany({
      where: { 
        id,
        empresaId 
      },
      data
    }).then(async (res) => {
      if (res.count === 0) return null;
      return await this.buscarPorId(id, empresaId);
    });
  }

  async deletar(id, empresaId) {
    return await prisma.instrutor.deleteMany({
      where: { 
        id,
        empresaId 
      }
    }).then(res => res.count);
  }

  async contarPorEmpresa(empresaId) {
    return await prisma.instrutor.count({
      where: { empresaId }
    });
  }

  async buscarInstrutoresAtivos(empresaId) {
    return await prisma.instrutor.findMany({
      where: {
        empresaId,
        funcionario: {
          situacao: 'ATIVO'
        }
      },
      include: {
        funcionario: {
          include: {
            pessoa: {
              select: {
                nome1: true,
                nome2: true,
                doc1: true
              }
            },
            funcao: true
          }
        }
      },
      orderBy: {
        funcionario: {
          pessoa: {
            nome1: 'asc'
          }
        }
      }
    });
  }
}

module.exports = new InstrutorRepository();