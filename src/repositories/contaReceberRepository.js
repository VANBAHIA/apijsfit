const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

class ContaReceberRepository {
  async criar(data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaReceber.create({ data });
  }

  async buscarTodos(filtros = {}) {
    const { empresaId, status, alunoId, dataInicio, dataFim, skip = 0, take = 10 } = filtros;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const where = { empresaId };
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
                  doc1: true
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

  async buscarPorId(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaReceber.findFirst({
      where: { id, empresaId },
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                id: true,
                nome1: true,
                doc1: true
              }
            }
          }
        }
      }
    });
  }

  async buscarPorNumero(numero, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaReceber.findFirst({ where: { numero, empresaId } });
  }

  async buscarPorMatriculaId(alunoId, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaReceber.findMany({
      where: { alunoId, empresaId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async atualizar(id, data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    if (data.dataVencimento && typeof data.dataVencimento === 'string') {
      data.dataVencimento = new Date(data.dataVencimento);
    }

    return await prisma.contaReceber.update({
      where: { id },
      data
    });
  }


async deletar(id, empresaId) {
  // 1️⃣ Verifica se a matrícula existe
  const matricula = await matriculaRepository.buscarPorId(id, empresaId);
  if (!matricula) throw new ApiError(404, 'Matrícula não encontrada');

  // 2️⃣ Verifica vínculos com contas a receber
  const vinculadas = await contaReceberRepository.buscarPorMatricula(id, empresaId);
  if (vinculadas && vinculadas.some(c => ['PAGO', 'ABERTO'].includes(c.status))) {
    throw new ApiError(400, 'Não é possível excluir matrícula com contas vinculadas');
  }

  // 3️⃣ Exclui com segurança
  await matriculaRepository.deletar(id, empresaId);

  return { mensagem: 'Matrícula excluída com sucesso' };
}


  async buscarVencidas(empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await prisma.contaReceber.findMany({
      where: {
        empresaId,
        status: 'PENDENTE',
        dataVencimento: { lt: new Date() }
      }
    });
  }
}

module.exports = new ContaReceberRepository();
