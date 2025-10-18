const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiError = require('../utils/apiError');

class FuncaoService {
  async criar(data) {
    if (!data.funcao) throw new ApiError(400, 'Nome da função é obrigatório');
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const existente = await prisma.funcao.findFirst({
      where: { funcao: data.funcao.trim(), empresaId: data.empresaId },
    });

    if (existente) throw new ApiError(400, 'Função já cadastrada nesta empresa');

    return await prisma.funcao.create({
      data: {
        funcao: data.funcao.trim(),
        status: data.status || 'ATIVO',
        empresaId: data.empresaId,
      },
    });
  }

  async buscarTodos(filtros = {}) {
    const { empresaId, status, skip = 0, take = 10 } = filtros;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const where = { empresaId };
    if (status) where.status = status;

    const [total, funcoes] = await Promise.all([
      prisma.funcao.count({ where }),
      prisma.funcao.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { funcao: 'asc' },
      }),
    ]);

    return { total, funcoes };
  }

  async buscarPorId(id, empresaId) {
    const funcao = await prisma.funcao.findFirst({ where: { id, empresaId } });
    if (!funcao) throw new ApiError(404, 'Função não encontrada para esta empresa');
    return funcao;
  }

  async atualizar(id, data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const funcao = await prisma.funcao.findFirst({
      where: { id, empresaId: data.empresaId },
    });
    if (!funcao) throw new ApiError(404, 'Função não encontrada');

    if (data.funcao && data.funcao !== funcao.funcao) {
      const duplicada = await prisma.funcao.findFirst({
        where: { funcao: data.funcao.trim(), empresaId: data.empresaId },
      });
      if (duplicada) throw new ApiError(400, 'Já existe uma função com este nome nesta empresa');
    }

    return await prisma.funcao.update({
      where: { id },
      data: {
        funcao: data.funcao?.trim() ?? funcao.funcao,
        status: data.status ?? funcao.status,
      },
    });
  }

  async deletar(id, empresaId) {
    const funcao = await prisma.funcao.findFirst({ where: { id, empresaId } });
    if (!funcao) throw new ApiError(404, 'Função não encontrada');
    return await prisma.funcao.delete({ where: { id } });
  }
}

module.exports = new FuncaoService();
