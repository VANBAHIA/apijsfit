const prisma = require('../config/database');

class LicencaRepository {
  async criar(data) {
    return await prisma.licenca.create({
      data,
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true
          }
        }
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { empresaId, situacao, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (empresaId) where.empresaId = empresaId;
    if (situacao) where.situacao = situacao;

    const [total, licencas] = await Promise.all([
      prisma.licenca.count({ where }),
      prisma.licenca.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          empresa: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { total, licencas };
  }

  async buscarPorId(id) {
    return await prisma.licenca.findUnique({
      where: { id },
      include: {
        empresa: true
      }
    });
  }

  async buscarPorChave(chave) {
    return await prisma.licenca.findUnique({
      where: { chave },
      include: {
        empresa: true
      }
    });
  }

  async buscarPorEmpresa(empresaId) {
    return await prisma.licenca.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async buscarLicencaAtiva(empresaId) {
    return await prisma.licenca.findFirst({
      where: {
        empresaId,
        situacao: 'ATIVA',
        dataExpiracao: {
          gte: new Date()
        }
      },
      orderBy: { dataExpiracao: 'desc' }
    });
  }

  async atualizar(id, data) {
    return await prisma.licenca.update({
      where: { id },
      data,
      include: {
        empresa: true
      }
    });
  }

  async deletar(id) {
    return await prisma.licenca.delete({
      where: { id }
    });
  }

  async expirarLicencasVencidas() {
    return await prisma.licenca.updateMany({
      where: {
        situacao: 'ATIVA',
        dataExpiracao: {
          lt: new Date()
        }
      },
      data: {
        situacao: 'EXPIRADA'
      }
    });
  }
}

module.exports = new LicencaRepository();