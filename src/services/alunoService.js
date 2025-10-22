const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError');
const prisma = require('../config/database');

class AlunoService {
  /**
   * Cria um novo aluno COM sua pessoa em uma transação atômica
   * Garante que ou ambos são criados, ou nenhum é criado
   */
  async criarComPessoa(dadosCompletos, empresaId) {
    const { pessoa, aluno } = dadosCompletos;

    console.log('🔧 Service recebeu:', {
      empresaId,
      pessoaDoc: pessoa?.doc1,
      pessoaNome: pessoa?.nome1
    });

    // Validações básicas
    if (!pessoa || !pessoa.nome1 || !pessoa.doc1) {
      throw new ApiError(400, 'Dados da pessoa são obrigatórios (nome1 e doc1)');
    }

    if (!aluno || !aluno.controleAcesso || !aluno.controleAcesso.senha) {
      throw new ApiError(400, 'Senha de controle de acesso é obrigatória');
    }

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // ✅ PASSO 1: Verificar se pessoa com esse CPF já existe NA MESMA EMPRESA
      let pessoaExistente = await prisma.pessoa.findFirst({
        where: {
          doc1: pessoa.doc1,
          empresaId
        }
      });

      let pessoaId;

      // ✅ PASSO 2: Se pessoa existe, verificar se já é aluno
      if (pessoaExistente) {
        // Verificar se já existe aluno para essa pessoa
        const alunoExistente = await prisma.aluno.findFirst({
          where: {
            pessoaId: pessoaExistente.id,
            empresaId
          }
        });

        if (alunoExistente) {
          throw new ApiError(400, 'Já existe um aluno cadastrado com este CPF nesta empresa');
        }

        // ✅ Pessoa existe mas não é aluno → Atualizar dados da pessoa
        const dadosPessoaAtualizados = {
          nome1: pessoa.nome1,
          nome2: pessoa.nome2 || null,
          doc2: pessoa.doc2 || null,
          situacao: pessoa.situacao || pessoaExistente.situacao
        };

        if (pessoa.dtNsc) {
          dadosPessoaAtualizados.dtNsc = new Date(pessoa.dtNsc);
        }

        if (pessoa.enderecos) {
          dadosPessoaAtualizados.enderecos = pessoa.enderecos;
        }

        if (pessoa.contatos) {
          dadosPessoaAtualizados.contatos = pessoa.contatos;
        }

        pessoaExistente = await prisma.pessoa.update({
          where: { id: pessoaExistente.id },
          data: dadosPessoaAtualizados
        });

        pessoaId = pessoaExistente.id;
        console.log('✅ Pessoa existente atualizada:', pessoaId);
      } else {
        // ✅ PASSO 3: Pessoa não existe → Criar nova pessoa

        const dadosPessoa = {
          empresaId,
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

        const pessoaCriada = await prisma.pessoa.create({
          data: dadosPessoa
        });

        pessoaId = pessoaCriada.id;
        console.log('✅ Pessoa criada:', pessoaId);
      }

      // ✅ PASSO 4: Criar o aluno (sempre)
      const senhaHash = await bcrypt.hash(aluno.controleAcesso.senha, 10);
      const matricula = await this._gerarProximaMatricula(prisma, empresaId);

      const dadosAluno = {
        empresaId,
        matricula,
        pessoaId,
        vldExameMedico: aluno.vldExameMedico ? new Date(aluno.vldExameMedico) : null,
        vldAvaliacao: aluno.vldAvaliacao ? new Date(aluno.vldAvaliacao) : null,
        objetivo: aluno.objetivo || null,
        profissao: aluno.profissao || null,
        empresa_nome: aluno.empresa_nome || null,
        responsavel: aluno.responsavel || null,
        horarios: aluno.horarios || [],
        controleAcesso: {
          senha: senhaHash,
          impressaoDigital1: aluno.controleAcesso.impressaoDigital1 || null,
          impressaoDigital2: aluno.controleAcesso.impressaoDigital2 || null
        }
      };

      const alunoCriado = await prisma.aluno.create({
        data: dadosAluno,
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
          }
        }
      });

      console.log('✅ Aluno criado com sucesso:', {
        alunoId: alunoCriado.id,
        matricula: alunoCriado.matricula,
        empresaId
      });

      return alunoCriado;

    } catch (error) {
      console.error('❌ Erro ao criar aluno:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao criar aluno: ${error.message}`);
    }
  }


  async _gerarProximaMatricula(prismaClient, empresaId) {
    const ultimoAluno = await prismaClient.aluno.findFirst({
      where: { empresaId },
      orderBy: { matricula: 'desc' },
      select: { matricula: true }
    });

    if (!ultimoAluno || !ultimoAluno.matricula) {
      return '00001';
    }

    const ultimoNumero = parseInt(ultimoAluno.matricula);
    const proximoNumero = ultimoNumero + 1;

    return proximoNumero.toString().padStart(5, '0');
  }


  async listarTodos(filtros = {}) {
    const { situacao, page = 1, limit = 10, busca, empresaId } = filtros;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    const skip = (Number(page) - 1) * Number(limit);
    const where = { empresaId };

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

    try {
      const [alunos, total] = await Promise.all([
        prisma.aluno.findMany({
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
    } catch (error) {
      console.error('❌ Erro ao listar alunos:', error);
      throw new ApiError(500, `Erro ao listar alunos: ${error.message}`);
    }
  }


  async buscarPorId(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const aluno = await prisma.aluno.findUnique({
        where: { id },
        include: {
          pessoa: true,
          // ✅ ADICIONAR: Buscar a última avaliação física do aluno
          avaliacoesFisicas: {
            orderBy: { dataAvaliacao: 'desc' },
            take: 1, // Pega apenas a mais recente
            select: {
              id: true,
              peso: true,
              altura: true,
              imc: true,
              percentualGordura: true,
              massaMagra: true,
              massaGorda: true,
              // Circunferências - Tronco
              torax: true,
              cintura: true,
              abdomen: true,
              quadril: true,
              // Circunferências - Membros Superiores
              bracoDireito: true,
              bracoEsquerdo: true,
              antebracoDireito: true,
              antebracoEsquerdo: true,
              // Circunferências - Membros Inferiores
              coxaDireita: true,
              coxaEsquerda: true,
              panturrilhaDireita: true,
              panturrilhaEsquerda: true,
              observacoes: true,
              dataAvaliacao: true,
            }
          }
        }
      });

      if (!aluno) {
        throw new ApiError(404, 'Aluno não encontrado');
      }

      // ✅ Validar que o aluno pertence à empresa
      if (aluno.empresaId !== empresaId) {
        throw new ApiError(403, 'Acesso negado. Aluno não pertence a sua empresa');
      }

      // ✅ Transformar array em objeto único (pega a primeira avaliação)
      if (aluno.avaliacoesFisicas && aluno.avaliacoesFisicas.length > 0) {
        aluno.avaliacaoFisica = aluno.avaliacoesFisicas[0];
        delete aluno.avaliacoesFisicas; // Remove o array
      }

      return aluno;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar aluno: ${error.message}`);
    }
  }



  /**
   * Atualiza aluno E pessoa em transação atômica
   */
  async atualizarComPessoa(id, dadosCompletos, empresaId) {
  const { pessoa, aluno } = dadosCompletos;

  if (!empresaId) {
    throw new ApiError(400, 'empresaId é obrigatório');
  }

  // Verificar se aluno existe e pertence à empresa
  const alunoExistente = await prisma.aluno.findUnique({
    where: { id },
    select: { pessoaId: true, empresaId: true }
  });

  if (!alunoExistente) {
    throw new ApiError(404, 'Aluno não encontrado');
  }

  if (alunoExistente.empresaId !== empresaId) {
    throw new ApiError(403, 'Acesso negado. Aluno não pertence a sua empresa');
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
          empresa_nome: aluno.empresa_nome,
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
          pessoa: true
        }
      });
    });

    console.log('✅ Aluno atualizado com sucesso:', id);
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
  async deletar(id, empresaId) {
  if (!empresaId) {
    throw new ApiError(400, 'empresaId é obrigatório');
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: { empresaId: true }
    });

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    if (aluno.empresaId !== empresaId) {
      throw new ApiError(403, 'Acesso negado. Aluno não pertence a sua empresa');
    }

    await prisma.aluno.delete({
      where: { id }
    });

    console.log('✅ Aluno deletado com sucesso:', id);
    return { message: 'Aluno deletado com sucesso' };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Erro ao deletar aluno: ${error.message}`);
  }
}

  /**
   * Adiciona um horário ao aluno
   */
  async adicionarHorario(id, horario, empresaId) {
  const { local, diasSemana, horarioEntrada, horarioSaida } = horario;

  if (!empresaId) {
    throw new ApiError(400, 'empresaId é obrigatório');
  }

  if (!local || !diasSemana || !horarioEntrada || !horarioSaida) {
    throw new ApiError(400, 'Todos os campos do horário são obrigatórios');
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: { empresaId: true }
    });

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    if (aluno.empresaId !== empresaId) {
      throw new ApiError(403, 'Acesso negado. Aluno não pertence a sua empresa');
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

    console.log('✅ Horário adicionado ao aluno:', id);
    return alunoAtualizado;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Erro ao adicionar horário: ${error.message}`);
  }
}

  /**
   * Valida senha de acesso
   */
  async validarSenha(id, senha, empresaId) {
  if (!empresaId) {
    throw new ApiError(400, 'empresaId é obrigatório');
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: {
        empresaId: true,
        controleAcesso: true
      }
    });

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    if (aluno.empresaId !== empresaId) {
      throw new ApiError(403, 'Acesso negado. Aluno não pertence a sua empresa');
    }

    const senhaValida = await bcrypt.compare(senha, aluno.controleAcesso.senha);

    if (!senhaValida) {
      throw new ApiError(401, 'Senha inválida');
    }

    console.log('✅ Senha validada com sucesso para aluno:', id);
    return { valido: true };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Erro ao validar senha: ${error.message}`);
  }
}
}

module.exports = new AlunoService();