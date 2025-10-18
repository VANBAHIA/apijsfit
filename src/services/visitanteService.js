// src/services/visitanteService.js

const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

class VisitanteService {

    // src/services/visitanteService.js
async criar(dados) {
  // Validação obrigatória
  if (!dados.nome || dados.nome.trim() === '') {
    throw new ApiError(400, 'Nome é obrigatório');
  }

  if (!dados.dataVisita) {
    throw new ApiError(400, 'Data da visita é obrigatória');
  }

  if (!dados.empresaId) {
    throw new ApiError(400, 'empresaId é obrigatório');
  }

  // ✅ Validar se funcionário existe (se informado)
  if (dados.funcionarioId) {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: dados.funcionarioId },
      select: { id: true, situacao: true }
    });

    if (!funcionario) {
      throw new ApiError(404, 'Funcionário não encontrado');
    }

    if (funcionario.situacao !== 'ATIVO') {
      throw new ApiError(400, 'Funcionário não está ativo');
    }
  }

  try {
    // ✅ Aqui declaramos a variável corretamente
    const dadosVisitante = {
      nome: dados.nome.trim().toUpperCase(),
      endereco: dados.endereco?.trim() || null,
      bairro: dados.bairro?.trim() || null,
      cidade: dados.cidade?.trim() || null,
      uf: dados.uf || null,
      cep: dados.cep?.replace(/\D/g, '') || null,
      telefone: dados.telefone?.replace(/\D/g, '') || null,
      celular: dados.celular?.replace(/\D/g, '') || null,
      email: dados.email?.toLowerCase().trim() || null,
      sexo: dados.sexo || null,
      dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
      observacoes: dados.observacoes?.trim() || null,
      dataVisita: new Date(dados.dataVisita),
      funcionarioId: dados.funcionarioId || null,
      empresaId: dados.empresaId // ✅ incluído corretamente
    };

    // ✅ Agora sim, usamos a variável que existe
    const visitante = await prisma.visitante.create({
      data: dadosVisitante,
      include: {
        funcionario: {
          include: {
            pessoa: {
              select: {
                nome1: true,
                nome2: true
              }
            },
            funcao: {
              select: {
                funcao: true
              }
            }
          }
        }
      }
    });

    return visitante;
  } catch (error) {
    console.error('Erro ao criar visitante:', error);
    throw new ApiError(500, `Erro ao criar visitante: ${error.message}`);
  }
}


    /**
     * Listar todos os visitantes com paginação e filtros
     */
    async listarTodos(filtros = {}) {
        const {
            page = 1,
            limit = 10,
            busca,
            dataInicio,
            dataFim,
            funcionarioId,
            sexo
        } = filtros;

        const skip = (Number(page) - 1) * Number(limit);
        const where = { empresaId: filtros.empresaId };


        // Filtro de busca por nome, telefone ou celular
        if (busca) {
            where.OR = [
                { nome: { contains: busca, mode: 'insensitive' } },
                { telefone: { contains: busca.replace(/\D/g, '') } },
                { celular: { contains: busca.replace(/\D/g, '') } },
                { email: { contains: busca, mode: 'insensitive' } }
            ];
        }

        // Filtro por período de visita
        if (dataInicio || dataFim) {
            where.dataVisita = {};
            if (dataInicio) {
                where.dataVisita.gte = new Date(dataInicio);
            }
            if (dataFim) {
                where.dataVisita.lte = new Date(dataFim);
            }
        }

        // ✅ Filtro por funcionário responsável
        if (funcionarioId) {
            where.funcionarioId = funcionarioId;
        }

        // Filtro por sexo
        if (sexo) {
            where.sexo = sexo;
        }

        try {
            const [visitantes, total] = await Promise.all([
                prisma.visitante.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    include: {
                        funcionario: {
                            include: {
                                pessoa: {
                                    select: {
                                        nome1: true,
                                        nome2: true
                                    }
                                },
                                funcao: {
                                    select: {
                                        funcao: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { dataVisita: 'desc' }
                }),
                prisma.visitante.count({ where })
            ]);

            return {
                data: visitantes,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            };
        } catch (error) {
            console.error('Erro ao listar visitantes:', error);
            throw new ApiError(500, `Erro ao listar visitantes: ${error.message}`);
        }
    }

    /**
     * Buscar visitante por ID
     */
    async buscarPorId(id) {
        try {
            const visitante = await prisma.visitante.findUnique({
                where: { id  },
                include: {
                    funcionario: {
                        include: {
                            pessoa: {
                                select: {
                                    nome1: true,
                                    nome2: true,
                                    contatos: true
                                }
                            },
                            funcao: {
                                select: {
                                    funcao: true
                                }
                            }
                        }
                    }
                }
            });

            if (!visitante) {
                throw new ApiError(404, 'Visitante não encontrado');
            }

            return visitante;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Erro ao buscar visitante:', error);
            throw new ApiError(500, `Erro ao buscar visitante: ${error.message}`);
        }
    }

    /**
     * Atualizar visitante
     */
    async atualizar(id, dados) {
        // Verificar se visitante existe
        const visitanteExistente = await this.buscarPorId(id);

        // Validação obrigatória apenas do nome
        if (dados.nome && dados.nome.trim() === '') {
            throw new ApiError(400, 'Nome não pode ser vazio');
        }

        // ✅ Validar se funcionário existe (se informado)
        if (dados.funcionarioId) {
            const funcionario = await prisma.funcionario.findUnique({
                where: { id: dados.funcionarioId },
                select: { id: true, situacao: true }
            });

            if (!funcionario) {
                throw new ApiError(404, 'Funcionário não encontrado');
            }

            if (funcionario.situacao !== 'ATIVO') {
                throw new ApiError(400, 'Funcionário não está ativo');
            }
        }

        try {
            const dadosAtualizados = {};

            if (dados.nome) dadosAtualizados.nome = dados.nome.trim().toUpperCase();
            if (dados.endereco !== undefined) dadosAtualizados.endereco = dados.endereco?.trim() || null;
            if (dados.bairro !== undefined) dadosAtualizados.bairro = dados.bairro?.trim() || null;
            if (dados.cidade !== undefined) dadosAtualizados.cidade = dados.cidade?.trim() || null;
            if (dados.uf !== undefined) dadosAtualizados.uf = dados.uf || null;
            if (dados.cep !== undefined) dadosAtualizados.cep = dados.cep?.replace(/\D/g, '') || null;
            if (dados.telefone !== undefined) dadosAtualizados.telefone = dados.telefone?.replace(/\D/g, '') || null;
            if (dados.celular !== undefined) dadosAtualizados.celular = dados.celular?.replace(/\D/g, '') || null;
            if (dados.email !== undefined) dadosAtualizados.email = dados.email?.toLowerCase().trim() || null;
            if (dados.sexo !== undefined) dadosAtualizados.sexo = dados.sexo || null;
            if (dados.dataNascimento !== undefined) {
                dadosAtualizados.dataNascimento = dados.dataNascimento ? new Date(dados.dataNascimento) : null;
            }
            if (dados.observacoes !== undefined) dadosAtualizados.observacoes = dados.observacoes?.trim() || null;
            if (dados.dataVisita) dadosAtualizados.dataVisita = new Date(dados.dataVisita);
            if (dados.funcionarioId !== undefined) {
                dadosAtualizados.funcionarioId = dados.funcionarioId || null;
            }

            const visitanteAtualizado = await prisma.visitante.update({
                where: { id },
                data: dadosAtualizados,
                include: {
                    funcionario: {
                        include: {
                            pessoa: {
                                select: {
                                    nome1: true,
                                    nome2: true
                                }
                            },
                            funcao: {
                                select: {
                                    funcao: true
                                }
                            }
                        }
                    }
                }
            });

            return visitanteAtualizado;
        } catch (error) {
            console.error('Erro ao atualizar visitante:', error);
            throw new ApiError(500, `Erro ao atualizar visitante: ${error.message}`);
        }
    }

    /**
     * Deletar visitante
     */
    async deletar(id) {
        // Verificar se visitante existe
        await this.buscarPorId(id);

        try {
            await prisma.visitante.delete({
                where: { id }
            });

            return { message: 'Visitante deletado com sucesso' };
        } catch (error) {
            console.error('Erro ao deletar visitante:', error);
            throw new ApiError(500, `Erro ao deletar visitante: ${error.message}`);
        }
    }

    /**
     * Relatório de visitantes por período
     */
    async relatorioPorPeriodo(dataInicio, dataFim) {
        try {
            const where = {};

            if (dataInicio || dataFim) {
                where.dataVisita = {};
                if (dataInicio) {
                    where.dataVisita.gte = new Date(dataInicio);
                }
                if (dataFim) {
                    where.dataVisita.lte = new Date(dataFim);
                }
            }

            const [visitantes, total, porSexo, porFuncionario] = await Promise.all([
                prisma.visitante.findMany({
                    where,
                    include: {
                        funcionario: {
                            include: {
                                pessoa: {
                                    select: {
                                        nome1: true,
                                        nome2: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { dataVisita: 'desc' }
                }),
                prisma.visitante.count({ where }),
                prisma.visitante.groupBy({
                    by: ['sexo'],
                    where,
                    _count: true
                }),
                prisma.visitante.groupBy({
                    by: ['funcionarioId'],
                    where,
                    _count: true,
                    orderBy: {
                        _count: {
                            funcionarioId: 'desc'
                        }
                    }
                })
            ]);

            // ✅ Buscar nomes dos funcionários para o relatório
            const funcionariosIds = porFuncionario
                .map(item => item.funcionarioId)
                .filter(id => id !== null);

            const funcionarios = await prisma.funcionario.findMany({
                where: {
                    id: { in: funcionariosIds }
                },
                include: {
                    pessoa: {
                        select: {
                            nome1: true,
                            nome2: true
                        }
                    }
                }
            });

            const funcionariosMap = new Map(
                funcionarios.map(f => [
                    f.id,
                    `${f.pessoa.nome1}${f.pessoa.nome2 ? ' ' + f.pessoa.nome2 : ''}`
                ])
            );

            return {
                periodo: {
                    dataInicio: dataInicio || 'Início',
                    dataFim: dataFim || 'Hoje'
                },
                total,
                porSexo: porSexo.map(item => ({
                    sexo: item.sexo || 'Não informado',
                    quantidade: item._count
                })),
                porFuncionario: porFuncionario.map(item => ({
                    funcionarioId: item.funcionarioId,
                    funcionario: item.funcionarioId
                        ? funcionariosMap.get(item.funcionarioId) || 'Não encontrado'
                        : 'Não informado',
                    quantidade: item._count
                })),
                visitantes
            };
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw new ApiError(500, `Erro ao gerar relatório: ${error.message}`);
        }
    }
}

module.exports = new VisitanteService();