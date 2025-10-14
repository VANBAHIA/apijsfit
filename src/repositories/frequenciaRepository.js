const prisma = require('../config/database');

class FrequenciaRepository {
  async criar(data) {
    return await prisma.frequencia.create({
      data,
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                nome1: true,
                nome2: true,
                doc1: true,
              },
            },
          },
        },
      },
    });
  }

  async buscarTodos(filtros = {}) {
    const {
      skip = 0,
      take = 10,
      alunoId,
      dataInicio,
      dataFim,
      presente,
    } = filtros;

    const where = {};

    if (alunoId) {
      where.alunoId = alunoId;
    }

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    if (presente !== undefined) {
      where.presente = presente === 'true' || presente === true;
    }

    const [total, frequencias] = await Promise.all([
      prisma.frequencia.count({ where }),
      prisma.frequencia.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          aluno: {
            include: {
              pessoa: {
                select: {
                  nome1: true,
                  nome2: true,
                  doc1: true,
                },
              },
            },
          },
        },
        orderBy: { data: 'desc' },
      }),
    ]);

    return { total, frequencias };
  }

  async buscarPorId(id) {
    return await prisma.frequencia.findUnique({
      where: { id },
      include: {
        aluno: {
          include: {
            pessoa: true,
          },
        },
      },
    });
  }

  async buscarPorAlunoEData(alunoId, data) {
    const inicioDia = new Date(data);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(data);
    fimDia.setHours(23, 59, 59, 999);

    return await prisma.frequencia.findFirst({
      where: {
        alunoId,
        data: {
          gte: inicioDia,
          lte: fimDia,
        },
      },
    });
  }

  async atualizar(id, data) {
    return await prisma.frequencia.update({
      where: { id },
      data,
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                nome1: true,
                nome2: true,
                doc1: true,
              },
            },
          },
        },
      },
    });
  }

  async deletar(id) {
    return await prisma.frequencia.delete({
      where: { id },
    });
  }

  async buscarEstatisticas(alunoId, dataInicio, dataFim) {
    const where = { alunoId };

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    const [total, presencas, faltas] = await Promise.all([
      prisma.frequencia.count({ where }),
      prisma.frequencia.count({ where: { ...where, presente: true } }),
      prisma.frequencia.count({ where: { ...where, presente: false } }),
    ]);

    return {
      total,
      presencas,
      faltas,
      percentualPresenca: total > 0 ? ((presencas / total) * 100).toFixed(2) : 0,
    };
  }

  async buscarRelatorio(filtros = {}) {
    const { dataInicio, dataFim, alunoIds } = filtros;

    const where = {};

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    if (alunoIds && alunoIds.length > 0) {
      where.alunoId = { in: alunoIds };
    }

    return await prisma.frequencia.findMany({
      where,
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                nome1: true,
                nome2: true,
                doc1: true,
              },
            },
          },
        },
      },
      orderBy: [{ data: 'desc' }],
    });
  }
}

module.exports = new FrequenciaRepository();