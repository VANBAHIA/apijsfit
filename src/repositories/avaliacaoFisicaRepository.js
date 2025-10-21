// src/repositories/avaliacaoFisicaRepository.js
const prisma = require('../config/database');

class AvaliacaoFisicaRepository {
  
  async criar(data) {
    return await prisma.avaliacaoFisica.create({
      data,
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                id: true,
                nome1: true,
                nome2: true,
                doc1: true,
                dtNsc: true
              }
            }
          }
        }
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { 
      empresaId,
      alunoId, 
      dataInicio, 
      dataFim, 
      status,
      skip = 0, 
      take = 10 
    } = filtros;

    const where = { empresaId };

    if (alunoId) {
      where.alunoId = alunoId;
    }

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.dataAvaliacao = {};
      if (dataInicio) where.dataAvaliacao.gte = new Date(dataInicio);
      if (dataFim) where.dataAvaliacao.lte = new Date(dataFim);
    }

    const [total, avaliacoes] = await Promise.all([
      prisma.avaliacaoFisica.count({ where }),
      prisma.avaliacaoFisica.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          aluno: {
            include: {
              pessoa: {
                select: {
                  id: true,
                  nome1: true,
                  nome2: true,
                  doc1: true
                }
              }
            }
          }
        },
        orderBy: { dataAvaliacao: 'desc' }
      })
    ]);

    return { total, avaliacoes };
  }

  async buscarPorId(id, empresaId) {
    return await prisma.avaliacaoFisica.findFirst({
      where: { 
        id,
        empresaId 
      },
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                id: true,
                nome1: true,
                nome2: true,
                doc1: true,
                dtNsc: true,
                contatos: true
              }
            }
          }
        }
      }
    });
  }

  async buscarPorAluno(alunoId, empresaId) {
    return await prisma.avaliacaoFisica.findMany({
      where: {
        alunoId,
        empresaId
      },
      orderBy: { dataAvaliacao: 'desc' }
    });
  }

  async buscarUltimaCodigo(empresaId) {
    return await prisma.avaliacaoFisica.findFirst({
      where: { empresaId },
      orderBy: { codigo: 'desc' },
      select: { codigo: true }
    });
  }

  async atualizar(id, data, empresaId) {
    return await prisma.avaliacaoFisica.updateMany({
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
    return await prisma.avaliacaoFisica.deleteMany({
      where: { 
        id,
        empresaId 
      }
    }).then(res => res.count);
  }

  async buscarEvolucao(alunoId, empresaId, parametros = []) {
    const avaliacoes = await prisma.avaliacaoFisica.findMany({
      where: {
        alunoId,
        empresaId,
        status: 'ATIVA'
      },
      orderBy: { dataAvaliacao: 'asc' }
    });

    return avaliacoes.map(av => {
      const dados = {
        id: av.id,
        codigo: av.codigo,
        dataAvaliacao: av.dataAvaliacao
      };

      parametros.forEach(param => {
        dados[param] = av[param];
      });

      return dados;
    });
  }

  async contarPorAluno(alunoId, empresaId) {
    return await prisma.avaliacaoFisica.count({
      where: {
        alunoId,
        empresaId
      }
    });
  }
}

module.exports = new AvaliacaoFisicaRepository();