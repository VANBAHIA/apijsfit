const prisma = require('../config/database');

class FuncionarioRepository {
  async criar(data) {
    return await prisma.funcionario.create({
      data,
      include: {
        pessoa: true,
        funcao: true
      }
    });
  }

  async buscarTodos(filtros = {}) {
    const { situacao, funcao, skip = 0, take = 10 } = filtros;

    const where = {};
    
    // Filtro por situação
    if (situacao) {
      where.situacao = situacao;
    }
    
    // ✅ SOLUÇÃO: Remover filtro de função temporariamente para diagnosticar
    // Se funcao for necessário, aplicar filtro após buscar os dados
    
    try {
      const [total, funcionarios] = await Promise.all([
        prisma.funcionario.count({ where }),
        prisma.funcionario.findMany({
          where,
          include: {
            pessoa: {
              select: {
                id: true,
                codigo: true,
                nome1: true,
                nome2: true,
                doc1: true,
                doc2: true,
                dtNsc: true,
                situacao: true,
                contatos: true,
                enderecos: true
              }
            },
            funcao: true
          },
          skip: Number(skip),
          take: Number(take),
          orderBy: { createdAt: 'desc' }
        })
      ]);

      // Filtrar por função após buscar (se necessário)
      let funcionariosFiltrados = funcionarios;
      if (funcao) {
        funcionariosFiltrados = funcionarios.filter(f => 
          f.funcao?.funcao?.toLowerCase().includes(funcao.toLowerCase())
        );
      }

      return { 
        total: funcao ? funcionariosFiltrados.length : total, 
        funcionarios: funcionariosFiltrados 
      };
    } catch (error) {
      console.error('❌ Erro ao buscar funcionários:', error);
      throw error;
    }
  }

  async buscarPorId(id) {
    return await prisma.funcionario.findUnique({
      where: { id },
      include: {
        pessoa: true,
        funcao: true
      }
    });
  }

  async buscarPorMatricula(matricula) {
    return await prisma.funcionario.findUnique({
      where: { matricula },
      include: {
        pessoa: true,
        funcao: true
      }
    });
  }

  async buscarPorPessoaId(pessoaId) {
    return await prisma.funcionario.findFirst({
      where: { pessoaId },
      include: {
        pessoa: true,
        funcao: true
      }
    });
  }

  async atualizar(id, data) {
    return await prisma.funcionario.update({
      where: { id },
      data,
      include: {
        pessoa: true,
        funcao: true
      }
    });
  }

  async deletar(id) {
    return await prisma.funcionario.delete({
      where: { id }
    });
  }

  async buscarInstrutores(filtros = {}) {
    const { skip = 0, take = 100 } = filtros;

    return await prisma.funcionario.findMany({
      where: {
        situacao: 'ATIVO',
        funcao: { 
          funcao: { 
            contains: 'instrutor', 
            mode: 'insensitive' 
          }
        }
      },
      include: {
        pessoa: {
          select: {
            nome1: true,
            nome2: true,
            doc1: true
          }
        },
        funcao: true
      },
      skip: Number(skip),
      take: Number(take),
      orderBy: { pessoa: { nome1: 'asc' } }
    });
  }
}

module.exports = new FuncionarioRepository();