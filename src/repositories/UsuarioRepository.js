const prisma = require('../config/database');

class UsuarioRepository {
  async criar(data) {
    return await prisma.usuario.create({
      data,
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true
          }
        }
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { empresaId, perfil, situacao, skip = 0, take = 10 } = filtros;
    
    const where = {};
    if (empresaId) where.empresaId = empresaId;
    if (perfil) where.perfil = perfil;
    if (situacao) where.situacao = situacao;

    const [total, usuarios] = await Promise.all([
      prisma.usuario.count({ where }),
      prisma.usuario.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        select: {
          id: true,
          empresaId: true,
          nomeUsuario: true,
          nome: true,
          email: true,
          perfil: true,
          situacao: true,
          foto: true,
          telefone: true,
          ultimoAcesso: true,
          createdAt: true,
          updatedAt: true,
          empresa: {
            select: {
              razaoSocial: true,
              nomeFantasia: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { total, usuarios };
  }

  async buscarPorId(id) {
    return await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        empresaId: true,
        nomeUsuario: true,
        nome: true,
        email: true,
        perfil: true,
        permissoes: true,
        situacao: true,
        foto: true,
        telefone: true,
        ultimoAcesso: true,
        createdAt: true,
        updatedAt: true,
        empresa: {
          select: {
            id: true,
            codigo: true,
            razaoSocial: true,
            nomeFantasia: true,
            situacao: true
          }
        }
      }
    });
  }

  async buscarPorNomeUsuario(nomeUsuario) {
    return await prisma.usuario.findUnique({
      where: { nomeUsuario },
      include: {
        empresa: {
          include: {
            licencas: {
              where: { situacao: 'ATIVA' },
              orderBy: { dataExpiracao: 'desc' },
              take: 1
            }
          }
        }
      }
    });
  }

  async buscarPorEmail(email) {
    return await prisma.usuario.findUnique({
      where: { email }
    });
  }

  async atualizar(id, data) {
    return await prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        empresaId: true,
        nomeUsuario: true,
        nome: true,
        email: true,
        perfil: true,
        situacao: true,
        foto: true,
        telefone: true,
        updatedAt: true
      }
    });
  }

  async atualizarUltimoAcesso(id) {
    return await prisma.usuario.update({
      where: { id },
      data: { ultimoAcesso: new Date() }
    });
  }

  async deletar(id) {
    return await prisma.usuario.delete({
      where: { id }
    });
  }

  async contarPorEmpresa(empresaId) {
    return await prisma.usuario.count({
      where: { 
        empresaId,
        situacao: 'ATIVO'
      }
    });
  }
}

module.exports = new UsuarioRepository();