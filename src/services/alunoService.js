const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError');
const pessoaService = require('./pessoaService');

const prisma = new PrismaClient();

class AlunoService {
  /**
   * Cria um novo aluno COM sua pessoa em uma transação atômica
   * Garante que ou ambos são criados, ou nenhum é criado
   */
  async criarComPessoa(dadosCompletos) {
    const { pessoa, aluno } = dadosCompletos;

    // Validações básicas
    if (!pessoa || !pessoa.nome1 || !pessoa.doc1) {
      throw new ApiError(400, 'Dados da pessoa são obrigatórios (nome1 e doc1)');
    }

    if (!aluno || !aluno.controleAcesso || !aluno.controleAcesso.senha) {
      throw new ApiError(400, 'Senha de controle de acesso é obrigatória');
    }

    // Validar se CPF/CNPJ já existe
    if (pessoa.doc1) {
      const pessoaExistente = await prisma.pessoa.findFirst({
        where: { doc1: pessoa.doc1 }
      });

      if (pessoaExistente) {
        const tipoDoc = pessoa.tipo === 'FISICA' ? 'CPF' : 'CNPJ';
        throw new ApiError(400, `${tipoDoc} ${pessoa.doc1} já está cadastrado`);
      }
    }

    try {
      // ✅ TRANSAÇÃO ATÔMICA - Tudo ou nada
      const resultado = await prisma.$transaction(async (tx) => {
        // 1️⃣ Gerar código da pessoa
        const codigo = await this._gerarProximoCodigoPessoa(tx);

        // 2️⃣ Preparar dados da pessoa
        const dadosPessoa = {
          codigo,
          tipo: pessoa.tipo || 'FISICA',
          nome1: pessoa.nome1,
          nome2: pessoa.nome2 || null,
          doc1: pessoa.doc1,
          doc2: pessoa.doc2 || null,
          dtNsc: pessoa.dtNsc ? new Date(pessoa.dtNsc) : null,
          situacao: pessoa.situacao || 'ATIVO',
          enderecos: pessoa.enderecos || [],
          contatos: pessoa.contatos || []
        };

        // 3️⃣ Criar Pessoa
        const pessoaCriada = await tx.pessoa.create({
          data: dadosPessoa
        });

        // 4️⃣ Hash da senha
        const senhaHash = await bcrypt.hash(aluno.controleAcesso.senha, 10);

        // 5️⃣ Preparar dados do aluno
        const dadosAluno = {
          pessoaId: pessoaCriada.id,
          vldExameMedico: aluno.vldExameMedico ? new Date(aluno.vldExameMedico) : null,
          vldAvaliacao: aluno.vldAvaliacao ? new Date(aluno.vldAvaliacao) : null,
          objetivo: aluno.objetivo || null,
          profissao: aluno.profissao || null,
          empresa: aluno.empresa || null,
          responsavel: aluno.responsavel || null,
          horarios: aluno.horarios || [],
          controleAcesso: {
            senha: senhaHash,
            impressaoDigital1: aluno.controleAcesso.impressaoDigital1 || null,
            impressaoDigital2: aluno.controleAcesso.impressaoDigital2 || null
          }
        };

        // 6️⃣ Criar Aluno
        const alunoCriado = await tx.aluno.create({
          data: dadosAluno,
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

        return alunoCriado;
      });

      return resultado;
    } catch (error) {
      console.error('❌ Erro na transação de criação:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(500, `Erro ao criar aluno: ${error.message}`);
    }
  }

  /**
   * Gera o próximo código sequencial para pessoa (dentro da transação)
   */
  async _gerarProximoCodigoPessoa(tx) {
    const ultimaPessoa = await tx.pessoa.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true }
    });

    if (!ultimaPessoa || !ultimaPessoa.codigo) {
      return '0001';
    }

    const ultimoNumero = parseInt(ultimaPessoa.codigo);
    const proximoNumero = ultimoNumero + 1;

    return proximoNumero.toString().padStart(4, '0');
  }

  /**
   * Lista todos os alunos com paginação
   */
  async listarTodos(filtros = {}) {
    const { situacao, page = 1, limit = 10, busca } = filtros;
    
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};

    // Filtro por situação
    if (situacao) {
      where.pessoa = { situacao };
    }

    // Busca por nome ou CPF
    if (busca) {
      where.pessoa = {
        ...where.pessoa,
        OR: [
          { nome1: { contains: busca, mode: 'insensitive' } },
          { nome2: { contains: busca, mode: 'insensitive' } },
          { doc1: { contains: busca } }
        ]
      };
    }

    const [alunos, total] = await Promise.all([
      prisma.aluno.findMany({
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
      prisma.aluno.count({ where })
    ]);

    return {
      data: alunos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  /**
   * Busca um aluno por ID com todos os dados
   */
  async buscarPorId(id) {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        pessoa: {
          include: {
            enderecos: true,
            contatos: true
          }
        }
      }
    });

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    return aluno;
  }

  /**
   * Atualiza aluno E pessoa em transação atômica
   */
  async atualizarComPessoa(id, dadosCompletos) {
    const { pessoa, aluno } = dadosCompletos;

    // Verificar se aluno existe
    const alunoExistente = await prisma.aluno.findUnique({
      where: { id },
      select: { pessoaId: true }
    });

    if (!alunoExistente) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    try {
      // ✅ TRANSAÇÃO ATÔMICA
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

          if (pessoa.enderecos) {
            dadosPessoa.enderecos = pessoa.enderecos;
          }

          if (pessoa.contatos) {
            dadosPessoa.contatos = pessoa.contatos;
          }

          await tx.pessoa.update({
            where: { id: alunoExistente.pessoaId },
            data: dadosPessoa
          });
        }

        // 2️⃣ Atualizar Aluno
        if (aluno) {
          const dadosAluno = {
            vldExameMedico: aluno.vldExameMedico ? new Date(aluno.vldExameMedico) : undefined,
            vldAvaliacao: aluno.vldAvaliacao ? new Date(aluno.vldAvaliacao) : undefined,
            objetivo: aluno.objetivo,
            profissao: aluno.profissao,
            empresa: aluno.empresa,
            responsavel: aluno.responsavel,
            horarios: aluno.horarios
          };

          // Hash da senha se foi enviada
          if (aluno.controleAcesso?.senha) {
            dadosAluno.controleAcesso = {
              senha: await bcrypt.hash(aluno.controleAcesso.senha, 10),
              impressaoDigital1: aluno.controleAcesso.impressaoDigital1 || null,
              impressaoDigital2: aluno.controleAcesso.impressaoDigital2 || null
            };
          }

          await tx.aluno.update({
            where: { id },
            data: dadosAluno
          });
        }

        // 3️⃣ Buscar aluno atualizado
        return await tx.aluno.findUnique({
          where: { id },
          include: {
            pessoa: {
              include: {
                enderecos: true,
                contatos: true
              }
            }
          }
        });
      });

      return resultado;
    } catch (error) {
      console.error('❌ Erro na transação de atualização:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(500, `Erro ao atualizar aluno: ${error.message}`);
    }
  }

  /**
   * Deleta aluno (a pessoa permanece no banco)
   */
  async deletar(id) {
    const aluno = await prisma.aluno.findUnique({
      where: { id }
    });

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    await prisma.aluno.delete({
      where: { id }
    });

    return { message: 'Aluno deletado com sucesso' };
  }

  /**
   * Adiciona um horário ao aluno
   */
  async adicionarHorario(id, horario) {
    const { local, diasSemana, horarioEntrada, horarioSaida } = horario;

    if (!local || !diasSemana || !horarioEntrada || !horarioSaida) {
      throw new ApiError(400, 'Todos os campos do horário são obrigatórios');
    }

    const aluno = await prisma.aluno.findUnique({
      where: { id }
    });

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    const novoHorario = { local, diasSemana, horarioEntrada, horarioSaida };
    
    const alunoAtualizado = await prisma.aluno.update({
      where: { id },
      data: {
        horarios: {
          push: novoHorario
        }
      },
      include: {
        pessoa: true
      }
    });

    return alunoAtualizado;
  }

  /**
   * Valida senha de acesso
   */
  async validarSenha(id, senha) {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: { controleAcesso: true }
    });

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    const senhaValida = await bcrypt.compare(senha, aluno.controleAcesso.senha);

    if (!senhaValida) {
      throw new ApiError(401, 'Senha inválida');
    }

    return { valido: true };
  }
}

module.exports = new AlunoService();