const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/apiError');
const funcionarioRepository = require('../repositories/funcionarioRepository');


const prisma = new PrismaClient();

class FuncionarioService {


  async criar(dadosCompletos, empresaId) {
    const { pessoa, funcionario } = dadosCompletos;

    console.log('📋 Service recebeu:', {
      empresaId,
      pessoaNome: pessoa?.nome1,
      funcionarioMatricula: funcionario?.matricula,
      doc1: pessoa?.dataAdmissao
    });

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório (via middleware)');
    }

    if (!pessoa || !funcionario) {
      throw new ApiError(400, 'Dados da pessoa e do funcionário são obrigatórios');
    }

    const data = {
      empresaId,
      tipo: 'FUNCIONARIO',
      nome1: pessoa.nome1,
      nome2: pessoa.nome2 || null,
      doc1: pessoa.doc1,
      doc2: pessoa.doc2 || null,
      dtNsc: pessoa.dtNsc ? new Date(pessoa.dtNsc) : null,
      situacao: pessoa.situacao || 'ATIVO',
      enderecos: pessoa.enderecos || [],
      contatos: pessoa.contatos || [],
      matricula: funcionario.matricula || null,
      funcaoId: funcionario.funcaoId,
      dataAdmissao: funcionario.dataAdmissao
        ? new Date(funcionario.dataAdmissao)
        : new Date(),
      dataDemissao: funcionario.dataDemissao
        ? new Date(funcionario.dataDemissao)
        : null,
      salario: funcionario.salario ? Number(funcionario.salario) : null,
      situacaoFuncionario: funcionario.situacao || 'ATIVO'
    };

    return await funcionarioRepository.criar(data);
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
            matricula: funcionario.matricula,
            pessoaId: funcionario.pessoaId,
            funcaoId: funcionario.funcaoId,
            dataAdmissao: new Date(funcionario.dataAdmissao),
            dataDemissao: funcionario.dataDemissao ? new Date(funcionario.dataDemissao) : null,
            salario: funcionario.salario ? Number(funcionario.salario) : null,
            situacao: funcionario.situacao || 'ATIVO',
            empresaId: funcionario.empresaId
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