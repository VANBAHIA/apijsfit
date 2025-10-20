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
              id: true,
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

  /**
   * Buscar usuário por ID sem restrição de empresa
   * (usado por SUPER_ADMIN ou validações globais)
   */
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
            // codigo: true,  ← REMOVER
            razaoSocial: true,
            nomeFantasia: true,
            situacao: true
          }
        }
      }
    });
  }
  async buscarPorIdEmpresa(id, empresaId) {
    return await prisma.usuario.findFirst({
      where: { id, empresaId },
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
            // codigo: true,  ← REMOVER
            razaoSocial: true,
            nomeFantasia: true,
            situacao: true
          }
        }
      }
    });
  }

  async buscarPorNomeUsuario(nomeUsuario, empresaId) {
    if (!empresaId) {
      throw new Error('empresaId é obrigatório para buscar por nome de usuário');
    }

    return await prisma.usuario.findUnique({
      where: {
        empresaId_nomeUsuario: {
          empresaId: empresaId,
          nomeUsuario: nomeUsuario
        }
      },
      select: {
        id: true,
        empresaId: true,
        nomeUsuario: true,
        nome: true,
        email: true,
        senha: true,
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
            // codigo: true,  ← REMOVER
            razaoSocial: true,
            nomeFantasia: true,
            situacao: true,
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

  /**
   * Buscar usuário por email
   * Usa findFirst pois email pode não ser globalmente único
   */
  async buscarPorEmail(email, empresaId = null) {
    // Se empresaId foi fornecido, usa o índice composto
    if (empresaId) {
      return await prisma.usuario.findUnique({
        where: {
          empresaId_email: {
            empresaId: empresaId,
            email: email
          }
        }
      });
    }

    // Caso contrário, busca o primeiro registro com esse email
    return await prisma.usuario.findFirst({
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