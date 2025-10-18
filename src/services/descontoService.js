const descontoRepository = require('../repositories/descontoRepository');
const ApiError = require('../utils/apiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DescontoService {
  validarDesconto(data) {
    if (!data.descricao || data.descricao.trim() === '') {
      throw new ApiError(400, 'Descrição é obrigatória');
    }
    if (!data.tipo || !['PERCENTUAL', 'MONETARIO'].includes(data.tipo)) {
      throw new ApiError(400, 'Tipo deve ser PERCENTUAL ou MONETARIO');
    }
    if (data.valor === undefined || data.valor === null) {
      throw new ApiError(400, 'Valor é obrigatório');
    }

    const valor = Number(data.valor);
    if (isNaN(valor) || valor < 0) throw new ApiError(400, 'Valor deve ser positivo');
    if (data.tipo === 'PERCENTUAL' && valor > 100) {
      throw new ApiError(400, 'Desconto percentual não pode ser maior que 100%');
    }
  }

  async criar(data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    this.validarDesconto(data);

    const existente = await prisma.desconto.findFirst({
      where: { descricao: data.descricao.trim(), empresaId: data.empresaId },
    });
    if (existente) throw new ApiError(400, 'Já existe um desconto com esta descrição nesta empresa');

    return await prisma.desconto.create({
      data: {
        descricao: data.descricao.trim(),
        tipo: data.tipo,
        valor: Number(data.valor),
        status: data.status || 'ATIVO',
        empresaId: data.empresaId, // ✅ importante
      },
    });
  }

  async buscarTodos(filtros = {}) {
    const { empresaId, status, tipo, skip = 0, take = 10 } = filtros;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const where = { empresaId };
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    const [total, descontos] = await Promise.all([
      prisma.desconto.count({ where }),
      prisma.desconto.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { descricao: 'asc' },
      }),
    ]);

    return { total, descontos };
  }

  async buscarPorId(id, empresaId) {
    const desconto = await prisma.desconto.findFirst({ where: { id, empresaId } });
    if (!desconto) throw new ApiError(404, 'Desconto não encontrado para esta empresa');
    return desconto;
  }

  async atualizar(id, data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const desconto = await prisma.desconto.findFirst({
      where: { id, empresaId: data.empresaId },
    });
    if (!desconto) throw new ApiError(404, 'Desconto não encontrado');

    this.validarDesconto({ ...desconto, ...data });

    if (data.descricao && data.descricao !== desconto.descricao) {
      const duplicado = await prisma.desconto.findFirst({
        where: { descricao: data.descricao.trim(), empresaId: data.empresaId },
      });
      if (duplicado) throw new ApiError(400, 'Já existe um desconto com esta descrição');
    }

    return await prisma.desconto.update({
      where: { id },
      data: {
        descricao: data.descricao?.trim() ?? desconto.descricao,
        tipo: data.tipo ?? desconto.tipo,
        valor: data.valor !== undefined ? Number(data.valor) : desconto.valor,
        status: data.status ?? desconto.status,
      },
    });
  }

  async deletar(id, empresaId) {
    const desconto = await prisma.desconto.findFirst({ where: { id, empresaId } });
    if (!desconto) throw new ApiError(404, 'Desconto não encontrado');
    return await prisma.desconto.delete({ where: { id } });
  }

  async calcularDesconto(id, valorBase, empresaId) {
    const desconto = await this.buscarPorId(id, empresaId);
    if (desconto.status !== 'ATIVO') throw new ApiError(400, 'Desconto inativo');

    const valorDesconto =
      desconto.tipo === 'PERCENTUAL'
        ? (valorBase * desconto.valor) / 100
        : desconto.valor;

    return {
      desconto,
      valorBase,
      valorDesconto,
      valorFinal: valorBase - valorDesconto,
    };
  }
}

module.exports = new DescontoService();
