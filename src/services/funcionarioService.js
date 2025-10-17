const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/apiError');
const pessoaService = require('./pessoaService');

const prisma = new PrismaClient();

class FuncionarioService {
  /**
   * Gera a próxima matrícula sequencial
   */
  async _gerarProximaMatricula(prismaClient) {
    const ultimoFuncionario = await prismaClient.funcionario.findFirst({
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


  async _buscarOuCriarPessoa(dadosPessoa, prismaClient) {
    // PASSO 1: Validar dados mínimos obrigatórios
    if (!dadosPessoa.doc1) {
      throw new ApiError(400, 'CPF/CNPJ (doc1) é obrigatório');
    }

    if (!dadosPessoa.nome1) {
      throw new ApiError(400, 'Nome (nome1) é obrigatório');
    }

    // PASSO 2: Verificar se pessoa já existe pelo CPF/CNPJ
    let pessoaExistente = await prismaClient.pessoa.findFirst({
      where: { doc1: dadosPessoa.doc1 }
    });

    // PASSO 3: Se pessoa existe, retornar o ID dela
    if (pessoaExistente) {
      console.log(`✅ Pessoa encontrada: ${pessoaExistente.nome1} (ID: ${pessoaExistente.id})`);

      // OPCIONAL: Atualizar dados da pessoa existente se necessário
      const dadosAtualizacao = {
        nome1: dadosPessoa.nome1,
        nome2: dadosPessoa.nome2 || null,
        doc2: dadosPessoa.doc2 || null,
        situacao: dadosPessoa.situacao || pessoaExistente.situacao
      };

      if (dadosPessoa.dtNsc) {
        dadosAtualizacao.dtNsc = new Date(dadosPessoa.dtNsc);
      }

      if (dadosPessoa.enderecos && Array.isArray(dadosPessoa.enderecos)) {
        dadosAtualizacao.enderecos = dadosPessoa.enderecos;
      }

      if (dadosPessoa.contatos && Array.isArray(dadosPessoa.contatos)) {
        dadosAtualizacao.contatos = dadosPessoa.contatos;
      }

      pessoaExistente = await prismaClient.pessoa.update({
        where: { id: pessoaExistente.id },
        data: dadosAtualizacao
      });

      return pessoaExistente.id;
    }

    // PASSO 4: Se pessoa NÃO existe, criar uma nova
    console.log(`📝 Criando nova pessoa: ${dadosPessoa.nome1}`);



    const novaPessoa = await prismaClient.pessoa.create({
      data: {

        tipo: dadosPessoa.tipo || 'FISICA',
        nome1: dadosPessoa.nome1,
        nome2: dadosPessoa.nome2 || null,
        doc1: dadosPessoa.doc1,
        doc2: dadosPessoa.doc2 || null,
        dtNsc: dadosPessoa.dtNsc ? new Date(dadosPessoa.dtNsc) : null,
        situacao: dadosPessoa.situacao || 'ATIVO',
        enderecos: dadosPessoa.enderecos || [],
        contatos: dadosPessoa.contatos || []
      }
    });

    console.log(`✅ Pessoa criada com sucesso (ID: ${novaPessoa.id})`);
    return novaPessoa.id;
  }

  /**
   * Cria um novo funcionário COM sua pessoa em transação atômica
   * 🆕 AGORA SUPORTA pessoaId OU dados completos da pessoa
   */
  async criarComPessoa(dadosCompletos) {
    const { pessoa, funcionario } = dadosCompletos;

    // 🆕 PASSO 1: Verificar se pessoaId foi fornecido
    let pessoaId = funcionario?.pessoaId;

    // 🆕 PASSO 2: Se pessoaId está vazio/nulo, verificar se há dados da pessoa
    if (!pessoaId || pessoaId === '') {
      console.log('⚠️ pessoaId não fornecido, verificando dados de pessoa...');

      if (!pessoa || !pessoa.doc1) {
        throw new ApiError(
          400,
          'É necessário fornecer pessoaId OU os dados completos da pessoa com CPF/CNPJ'
        );
      }

      // 🆕 PASSO 3: Buscar pessoa por CPF/CNPJ ou criar se não existir
      pessoaId = await this._buscarOuCriarPessoa(pessoa, prisma);
    }

    // PASSO 4: Validar se a pessoa existe (caso tenha vindo pessoaId)
    const pessoaValidada = await prisma.pessoa.findUnique({
      where: { id: pessoaId }
    });

    if (!pessoaValidada) {
      throw new ApiError(404, `Pessoa com ID ${pessoaId} não encontrada`);
    }

    // PASSO 5: Verificar se já existe funcionário para essa pessoa
    const funcionarioExistente = await prisma.funcionario.findFirst({
      where: { pessoaId }
    });

    if (funcionarioExistente) {
      throw new ApiError(
        400,
        `Já existe um funcionário cadastrado para ${pessoaValidada.nome1} (CPF: ${pessoaValidada.doc1})`
      );
    }

    // PASSO 6: Validar dados do funcionário
    if (!funcionario || !funcionario.funcaoId) {
      throw new ApiError(400, 'Função do funcionário é obrigatória');
    }

    if (!funcionario.dataAdmissao) {
      throw new ApiError(400, 'Data de admissão é obrigatória');
    }

    // PASSO 7: Criar o funcionário
    try {
      const matricula = await this._gerarProximaMatricula(prisma);

      const dadosFuncionario = {
        matricula,
        pessoaId,
        funcaoId: funcionario.funcaoId,
        dataAdmissao: new Date(funcionario.dataAdmissao),
        dataDemissao: funcionario.dataDemissao ? new Date(funcionario.dataDemissao) : null,
        salario: funcionario.salario ? Number(funcionario.salario) : null,
        situacao: funcionario.situacao || 'ATIVO'
      };

      const funcionarioCriado = await prisma.funcionario.create({
        data: dadosFuncionario,
        include: {
          pessoa: {
            select: {
              id: true,
              nome1: true,
              nome2: true,
              doc1: true,
              doc2: true,
              dtNsc: true,
              situacao: true,
              enderecos: true,
              contatos: true
            }
          },
          funcao: true
        }
      });

      console.log(`✅ Funcionário criado: ${funcionarioCriado.matricula}`);
      return funcionarioCriado;

    } catch (error) {
      console.error('❌ Erro ao criar funcionário:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao criar funcionário: ${error.message}`);
    }
  }

  /**
   * Lista todos os funcionários com paginação
   */
  async listarTodos(filtros = {}) {


    const { situacao, funcao, page = 1, limit = 10, busca } = filtros;

    const { empresaId } = filtros;
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    const skip = (Number(page) - 1) * Number(limit);
    const where = { empresaId };

    if (situacao) {
      where.situacao = situacao;
    }

    if (funcao) {
      where.funcao = {
        funcao: { contains: funcao, mode: 'insensitive' }
      };
    }

    if (busca) {
      where.pessoa = {
        OR: [
          { nome1: { contains: busca, mode: 'insensitive' } },
          { nome2: { contains: busca, mode: 'insensitive' } },
          { doc1: { contains: busca } }
        ]
      };
    }

    const [funcionarios, total] = await Promise.all([
      prisma.funcionario.findMany({
        where,
        include: {
          pessoa: {
            select: {
              id: true,

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
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.funcionario.count({ where })
    ]);

    return {
      data: funcionarios,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async buscarPorId(id) {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id },
      include: {
        pessoa: true,
        funcao: true
      }
    });

    if (!funcionario) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    return funcionario;
  }

  async atualizarComPessoa(id, dadosCompletos) {
    const { pessoa, funcionario } = dadosCompletos;

    const funcionarioExistente = await prisma.funcionario.findUnique({
      where: { id },
      select: { pessoaId: true }
    });

    if (!funcionarioExistente) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    try {
      const resultado = await prisma.$transaction(async (tx) => {
        if (pessoa) {
          const dadosPessoa = {
            nome1: pessoa.nome1,
            nome2: pessoa.nome2 || null,
            doc1: pessoa.doc1,
            doc2: pessoa.doc2 || null,
            situacao: pessoa.situacao || 'ATIVO'
          };

          if (pessoa.dtNsc) {
            dadosPessoa.dtNsc = new Date(pessoa.dtNsc);
          }

          if (pessoa.enderecos && Array.isArray(pessoa.enderecos)) {
            dadosPessoa.enderecos = pessoa.enderecos;
          }

          if (pessoa.contatos && Array.isArray(pessoa.contatos)) {
            dadosPessoa.contatos = pessoa.contatos;
          }

          await tx.pessoa.update({
            where: { id: funcionarioExistente.pessoaId },
            data: dadosPessoa
          });
        }

        if (funcionario) {
          const dadosFuncionario = {
            funcaoId: funcionario.funcaoId,
            situacao: funcionario.situacao,
            salario: funcionario.salario ? Number(funcionario.salario) : undefined
          };

          if (funcionario.dataAdmissao) {
            dadosFuncionario.dataAdmissao = new Date(funcionario.dataAdmissao);
          }

          if (funcionario.dataDemissao) {
            dadosFuncionario.dataDemissao = new Date(funcionario.dataDemissao);
          }

          await tx.funcionario.update({
            where: { id },
            data: dadosFuncionario
          });
        }

        return await tx.funcionario.findUnique({
          where: { id },
          include: {
            pessoa: true,
            funcao: true
          }
        });
      });

      return resultado;
    } catch (error) {
      console.error('❌ Erro na transação de atualização:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao atualizar funcionário: ${error.message}`);
    }
  }

  async deletar(id) {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id }
    });

    if (!funcionario) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    await prisma.funcionario.delete({
      where: { id }
    });

    return { message: 'Funcionário deletado com sucesso' };
  }

  async listarInstrutores(filtros = {}) {
    const { skip = 0, take = 100 } = filtros;

    const instrutores = await prisma.funcionario.findMany({
      where: {
        situacao: 'ATIVO',
        funcao: {
          funcao: { contains: 'instrutor', mode: 'insensitive' }
        }
      },
      include: {
        pessoa: {
          select: {
            nome1: true,
            nome2: true,
            doc1: true,
            contatos: true
          }
        },
        funcao: true
      },
      skip: Number(skip),
      take: Number(take),
      orderBy: { pessoa: { nome1: 'asc' } }
    });

    return {
      data: instrutores,
      total: instrutores.length
    };
  }

  async demitir(id, dataDemissao) {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id }
    });

    if (!funcionario) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    if (funcionario.situacao === 'DEMITIDO') {
      throw new ApiError(400, 'Funcionário já está demitido');
    }

    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id },
      data: {
        situacao: 'DEMITIDO',
        dataDemissao: dataDemissao ? new Date(dataDemissao) : new Date()
      },
      include: {
        pessoa: true,
        funcao: true
      }
    });

    return funcionarioAtualizado;
  }

  async reativar(id) {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id }
    });

    if (!funcionario) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    if (funcionario.situacao === 'ATIVO') {
      throw new ApiError(400, 'Funcionário já está ativo');
    }

    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id },
      data: {
        situacao: 'ATIVO',
        dataDemissao: null
      },
      include: {
        pessoa: true,
        funcao: true
      }
    });

    return funcionarioAtualizado;
  }
}

module.exports = new FuncionarioService();