const localRepository = require('../repositories/localRepository');
const ApiError = require('../utils/apiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LocalService {
  async criar(data) {
    if (!data.nome) throw new ApiError(400, 'Nome do local é obrigatório');
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const existente = await prisma.local.findFirst({
      where: { nome: data.nome.trim(), empresaId: data.empresaId },
    });
    if (existente) throw new ApiError(400, 'Já existe um local com este nome nesta empresa');

    return await prisma.local.create({
      data: {
        nome: data.nome.trim(),
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

    const [total, locais] = await Promise.all([
      prisma.local.count({ where }),
      prisma.local.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { nome: 'asc' },
      }),
    ]);

    return { total, locais };
  }

  async buscarPorId(id, empresaId) {
    const local = await prisma.local.findFirst({ where: { id, empresaId } });
    if (!local) throw new ApiError(404, 'Local não encontrado para esta empresa');
    return local;
  }

  async atualizar(id, data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const local = await prisma.local.findFirst({
      where: { id, empresaId: data.empresaId },
    });
    if (!local) throw new ApiError(404, 'Local não encontrado');

    if (data.nome && data.nome !== local.nome) {
      const duplicado = await prisma.local.findFirst({
        where: { nome: data.nome.trim(), empresaId: data.empresaId },
      });
      if (duplicado) throw new ApiError(400, 'Já existe um local com este nome');
    }

    return await prisma.local.update({
      where: { id },
      data: {
        nome: data.nome?.trim() ?? local.nome,
        status: data.status ?? local.status,
      },
    });
  }

  async deletar(id, empresaId) {
    const local = await prisma.local.findFirst({ where: { id, empresaId } });
    if (!local) throw new ApiError(404, 'Local não encontrado');
    return await prisma.local.delete({ where: { id } });
  }
}

module.exports = new LocalService();
