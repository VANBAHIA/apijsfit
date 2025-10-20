const prisma = require('../config/database');

class FuncionarioRepository {

  async criar(data) {
  // 1️⃣ Verifica se já existe pessoa com doc1 e empresaId
  let pessoa = await prisma.pessoa.findUnique({
    where: {
      empresaId_doc1: {
        empresaId: data.empresaId,
        doc1: data.doc1,
      },
    },
  });

  // 2️⃣ Cria pessoa caso não exista
  if (!pessoa) {
    pessoa = await prisma.pessoa.create({
      data: {
        empresaId: data.empresaId,
        tipo: data.tipo,
        nome1: data.nome1,
        nome2: data.nome2,
        doc1: data.doc1,
        doc2: data.doc2,
        dtNsc: data.dtNsc,
        situacao: data.situacao || 'ATIVO',
        enderecos: data.enderecos || [],
        contatos: data.contatos || [],
      },
    });
  }

  // 3️⃣ Verifica se já existe funcionário com mesmo pessoaId e empresaId
  const funcionarioExistente = await prisma.funcionario.findFirst({
    where: {
      empresaId: data.empresaId,
      pessoaId: pessoa.id,
    },
  });

  if (funcionarioExistente) {
    throw new Error('Já existe um funcionário vinculado a esta pessoa nesta empresa.');
  }

  // 4️⃣ Gera matrícula se não informada
  const matricula =
    data.matricula || (await this._gerarProximaMatricula(data.empresaId));

  // 5️⃣ Cria o funcionário
  const funcionario = await prisma.funcionario.create({
    data: {
      empresaId: data.empresaId,
      pessoaId: pessoa.id,
      matricula,
      funcaoId: data.funcaoId,
      dataAdmissao: data.dataAdmissao,
      dataDemissao: data.dataDemissao,
      salario: data.salario,
      situacao: data.situacaoFuncionario || 'ATIVO',
    },
    include: {
      pessoa: true,
      funcao: true,
    },
  });
    return funcionario;
}


  async _gerarProximaMatricula(empresaId) {
    const ultimoFuncionario = await prisma.funcionario.findFirst({
      where: { empresaId },
      orderBy: { matricula: 'desc' },
      select: { matricula: true }
    });

    if (!ultimoFuncionario || !ultimoFuncionario.matricula) {
      return 'F00001';
    }

    const ultimoNumero = parseInt(ultimoFuncionario.matricula.replace('F', ''));
    const proximoNumero = ultimoNumero + 1;
    return `F${proximoNumero.toString().padStart(5, '0')}`;


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