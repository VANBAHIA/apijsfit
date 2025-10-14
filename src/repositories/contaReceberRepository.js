const prisma = require('../config/database');

class ContaReceberRepository {
  async criar(data) {
    return await prisma.contaReceber.create({ data });
  }


  async buscarTodos(filtros = {}) {
    const { status, alunoId, dataInicio, dataFim, skip = 0, take = 10 } = filtros;

    const where = {};
    if (status) where.status = status;
    if (alunoId) where.alunoId = alunoId;

    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) where.dataVencimento.gte = new Date(dataInicio);
      if (dataFim) where.dataVencimento.lte = new Date(dataFim);
    }

    const [total, contas] = await Promise.all([
      prisma.contaReceber.count({ where }),
      prisma.contaReceber.findMany({
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
                  doc1: true,
                  codigo: true
                }
              }
            }
          }
        },
        orderBy: { dataVencimento: 'desc' }
      })
    ]);

    return { total, contas };
  }

  async buscarPorId(id) {
    return await prisma.contaReceber.findUnique({
      where: { id },
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                id: true,
                nome1: true,
                doc1: true,
                codigo: true
              }
            }
          }
        }
      }
    });
  }

  async buscarPorNumero(numero) {
    return await prisma.contaReceber.findUnique({ where: { numero } });
  }

  async buscarPorMatriculaId(alunoId) {
    const contasReceber = await prisma.contaReceber.findMany({
      where: {
        alunoId: alunoId
      },
      orderBy: { createdAt: 'desc' }
    });
    return contasReceber;
  }

  async atualizar(id, data) {
    // Converter dataVencimento para Date se existir
    if (data.dataVencimento && typeof data.dataVencimento === 'string') {
      data.dataVencimento = new Date(data.dataVencimento);
    }

    return await prisma.contaReceber.update({
      where: { id },
      data
    });
  }

  async deletar(id) {
    return await prisma.contaReceber.delete({ where: { id } });
  }

  async buscarVencidas() {
    return await prisma.contaReceber.findMany({
      where: {
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() }
      }
    });
  }
}

module.exports = new ContaReceberRepository();