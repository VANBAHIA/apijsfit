const prisma = require('../config/database');

class EmpresaRepository {



  async criar(data) {
    return await prisma.empresa.create({
      data,
      include: {
        licencas: true,
        usuarios: {
          select: {
            id: true,
            nomeUsuario: true,
            nome: true,
            email: true,
            perfil: true,
            situacao: true
          }
        }
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { situacao, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (situacao) where.situacao = situacao;

    const [total, empresas] = await Promise.all([
      prisma.empresa.count({ where }),
      prisma.empresa.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          licencas: {
            where: { situacao: 'ATIVA' },
            orderBy: { dataExpiracao: 'desc' },
            take: 1
          },
          usuarios: {
            select: {
              id: true,
              nome: true,
              perfil: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { total, empresas };
  }

  async buscarPorId(id) {
    return await prisma.empresa.findUnique({
      where: { id },
      include: {
        licencas: {
          orderBy: { createdAt: 'desc' }
        },
        usuarios: {
          select: {
            id: true,
           // cnpj: true,
            nomeUsuario: true,
            nome: true,
            email: true,
            perfil: true,
            situacao: true,
            ultimoAcesso: true,
            createdAt: true
          }
        }
      }
    });
  }

  async buscarPorCodigo(codigo) {
    return await prisma.empresa.findUnique({
      where: { codigo }
    });
  }

    async buscarPorCnpj(cnpj) {
    return await prisma.empresa.findUnique({
      where: { cnpj }
    });
  }

 

  async atualizar(id, data) {
    return await prisma.empresa.update({
      where: { id },
      data,
      include: {
        licencas: true,
        usuarios: {
          select: {
            id: true,
            nomeUsuario: true,
            nome: true,
            email: true,
            perfil: true
          }
        }
      }
    });
  }

  async deletar(id) {
    return await prisma.empresa.delete({
      where: { id }
    });
  }

  async buscarComFiltros(filtros) {
    const { razaoSocial, cnpj, situacao } = filtros;
    
    const where = {};
    
    if (razaoSocial) {
      where.razaoSocial = { contains: razaoSocial, mode: 'insensitive' };
    }
    if (cnpj) where.cnpj = cnpj;
    if (situacao) where.situacao = situacao;

    return await prisma.empresa.findMany({
      where,
      include: {
        licencas: {
          where: { situacao: 'ATIVA' }
        }
      },
      orderBy: { razaoSocial: 'asc' }
    });
  }
}

module.exports = new EmpresaRepository();