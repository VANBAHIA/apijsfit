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

  /**
   * Cria um novo funcionário COM sua pessoa em transação atômica
   */
  async criarComPessoa(dadosCompletos) {
    const { pessoa, funcionario } = dadosCompletos;

    // Validações básicas
    if (!pessoa || !pessoa.nome1 || !pessoa.doc1) {
      throw new ApiError(400, 'Dados da pessoa são obrigatórios (nome1 e doc1)');
    }

    if (!funcionario || !funcionario.funcao) {
      throw new ApiError(400, 'Função do funcionário é obrigatória');
    }

    if (!funcionario.dataAdmissao) {
      throw new ApiError(400, 'Data de admissão é obrigatória');
    }

    try {
      // ✅ PASSO 1: Verificar se pessoa com esse CPF já existe
      let pessoaExistente = await prisma.pessoa.findFirst({
        where: { doc1: pessoa.doc1 }
      });

      let pessoaId;

      // ✅ PASSO 2: Se pessoa existe, verificar se já é funcionário
      if (pessoaExistente) {
        const funcionarioExistente = await prisma.funcionario.findFirst({
          where: { pessoaId: pessoaExistente.id }
        });

        if (funcionarioExistente) {
          throw new ApiError(400, 'Já existe um funcionário cadastrado com este CPF');
        }

        // ✅ Pessoa existe mas não é funcionário → Atualizar dados da pessoa
        const dadosPessoaAtualizados = {
          nome1: pessoa.nome1,
          nome2: pessoa.nome2 || null,
          doc2: pessoa.doc2 || null,
          situacao: pessoa.situacao || pessoaExistente.situacao
        };

        if (pessoa.dtNsc) {
          dadosPessoaAtualizados.dtNsc = new Date(pessoa.dtNsc);
        }

        // ✅ IMPORTANTE: enderecos e contatos devem ser arrays JSON
        if (pessoa.enderecos && Array.isArray(pessoa.enderecos)) {
          dadosPessoaAtualizados.enderecos = pessoa.enderecos;
        }

        if (pessoa.contatos && Array.isArray(pessoa.contatos)) {
          dadosPessoaAtualizados.contatos = pessoa.contatos;
        }

        pessoaExistente = await prisma.pessoa.update({
          where: { id: pessoaExistente.id },
          data: dadosPessoaAtualizados
        });

        pessoaId = pessoaExistente.id;
      } else {
        // ✅ PASSO 3: Pessoa não existe → Criar nova pessoa
        const codigo = await pessoaService.gerarProximoCodigo();

        const dadosPessoa = {
          codigo,
          tipo: pessoa.tipo || 'FISICA',
          nome1: pessoa.nome1,
          nome2: pessoa.nome2 || null,
          doc1: pessoa.doc1,
          doc2: pessoa.doc2 || null,
          dtNsc: pessoa.dtNsc ? new Date(pessoa.dtNsc) : null,
          situacao: pessoa.situacao || 'ATIVO',
          // ✅ CORREÇÃO: enderecos e contatos como arrays JSON diretos
          enderecos: pessoa.enderecos || [],
          contatos: pessoa.contatos || []
        };

        const pessoaCriada = await prisma.pessoa.create({
          data: dadosPessoa
        });

        pessoaId = pessoaCriada.id;
      }

      // ✅ PASSO 4: Criar o funcionário
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
              codigo: true,
              nome1: true,
              nome2: true,
              doc1: true,
              doc2: true,
              dtNsc: true,
              situacao: true,
              enderecos: true,
              contatos: true
            }
          }
        }
      });

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

    const skip = (Number(page) - 1) * Number(limit);
    const where = {};

    // Filtro por situação
    if (situacao) {
      where.situacao = situacao;
    }

    // Filtro por função
    if (funcao) {
      where.funcao = {
        funcao: { contains: funcao, mode: 'insensitive' }
      };
    }

    // Busca por nome ou CPF
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
          }
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

  /**
   * Busca um funcionário por ID
   */
  async buscarPorId(id) {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id },
      include: {
        pessoa: true
      }
    });

    if (!funcionario) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    return funcionario;
  }

  /**
   * Atualiza funcionário E pessoa em transação atômica
   */
  async atualizarComPessoa(id, dadosCompletos) {
    const { pessoa, funcionario } = dadosCompletos;

    // Verificar se funcionário existe
    const funcionarioExistente = await prisma.funcionario.findUnique({
      where: { id },
      select: { pessoaId: true }
    });

    if (!funcionarioExistente) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    try {
      const resultado = await prisma.$transaction(async (tx) => {
        // 1️⃣ Atualizar Pessoa (se dados foram enviados)
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

          // ✅ Arrays JSON diretos
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

        // 2️⃣ Atualizar Funcionário
        if (funcionario) {
          const dadosFuncionario = {
            funcaoId: funcionario.funcaoId,  // ✅ TROCAR de funcao para funcaoId
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

        // 3️⃣ Buscar funcionário atualizado
        return await tx.funcionario.findUnique({
          where: { id },
          include: {
            pessoa: true
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

  /**
   * Deleta funcionário (a pessoa permanece no banco)
   */
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

  /**
   * Lista apenas instrutores ativos
   */
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
        }
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

  /**
   * Demitir funcionário (soft delete)
   */
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
        pessoa: true
      }
    });

    return funcionarioAtualizado;
  }

  /**
   * Reativar funcionário
   */
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
        pessoa: true
      }
    });

    return funcionarioAtualizado;
  }
}

module.exports = new FuncionarioService();