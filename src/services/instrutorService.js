// src/services/instrutorService.js
const instrutorRepository = require('../repositories/instrutorRepository');
const funcionarioRepository = require('../repositories/funcionarioRepository');
const ApiError = require('../utils/apiError');

class InstrutorService {
  /**
   * Criar novo instrutor
   */
  async criar(data) {
    const { funcionarioId, empresaId } = data;

    console.log('📋 Service criando instrutor:', { funcionarioId, empresaId });

    // Validações
    if (!funcionarioId) {
      throw new ApiError(400, 'funcionarioId é obrigatório');
    }

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // Verificar se funcionário existe e pertence à empresa
      const funcionario = await funcionarioRepository.buscarPorId(funcionarioId);

      if (!funcionario) {
        throw new ApiError(404, 'Funcionário não encontrado');
      }

      if (funcionario.empresaId !== empresaId) {
        throw new ApiError(403, 'Funcionário não pertence a esta empresa');
      }

      if (funcionario.situacao !== 'ATIVO') {
        throw new ApiError(400, 'Funcionário não está ativo');
      }

      // Verificar se funcionário já é instrutor
      const instrutorExistente = await instrutorRepository.buscarPorFuncionarioId(
        funcionarioId,
        empresaId
      );

      if (instrutorExistente) {
        throw new ApiError(400, 'Este funcionário já está cadastrado como instrutor');
      }

      // Criar instrutor
      const instrutor = await instrutorRepository.criar({
        funcionarioId,
        empresaId
      });

      console.log('✅ Instrutor criado com sucesso:', instrutor.id);
      return instrutor;

    } catch (error) {
      console.error('❌ Erro ao criar instrutor:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao criar instrutor: ${error.message}`);
    }
  }

  /**
   * Listar todos os instrutores
   */
  async listarTodos(filtros = {}) {
    const { empresaId, page = 1, limit = 10, situacao, busca } = filtros;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    const skip = (Number(page) - 1) * Number(limit);

    try {
      const resultado = await instrutorRepository.buscarTodos({
        empresaId,
        situacao,
        skip,
        take: Number(limit)
      });

      // Se houver busca, filtrar por nome
      let instrutoresFiltrados = resultado.instrutores;
      let totalFiltrado = resultado.total;

      if (busca) {
        instrutoresFiltrados = resultado.instrutores.filter(instrutor => {
          const nomeCompleto = `${instrutor.funcionario.pessoa.nome1} ${instrutor.funcionario.pessoa.nome2 || ''}`.toLowerCase();
          return nomeCompleto.includes(busca.toLowerCase()) ||
                 instrutor.funcionario.pessoa.doc1?.includes(busca);
        });
        totalFiltrado = instrutoresFiltrados.length;
      }

      return {
        data: instrutoresFiltrados,
        pagination: {
          total: totalFiltrado,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalFiltrado / Number(limit))
        }
      };
    } catch (error) {
      console.error('❌ Erro ao listar instrutores:', error);
      throw new ApiError(500, `Erro ao listar instrutores: ${error.message}`);
    }
  }

  /**
   * Buscar instrutor por ID
   */
  async buscarPorId(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const instrutor = await instrutorRepository.buscarPorId(id, empresaId);

      if (!instrutor) {
        throw new ApiError(404, 'Instrutor não encontrado');
      }

      return instrutor;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar instrutor: ${error.message}`);
    }
  }

  /**
   * Buscar instrutor por funcionarioId
   */
  async buscarPorFuncionarioId(funcionarioId, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const instrutor = await instrutorRepository.buscarPorFuncionarioId(
        funcionarioId,
        empresaId
      );

      if (!instrutor) {
        throw new ApiError(404, 'Instrutor não encontrado');
      }

      return instrutor;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar instrutor: ${error.message}`);
    }
  }

  /**
   * Atualizar instrutor
   */
  async atualizar(id, data, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // Verificar se instrutor existe
      const instrutorExistente = await instrutorRepository.buscarPorId(id, empresaId);

      if (!instrutorExistente) {
        throw new ApiError(404, 'Instrutor não encontrado');
      }

      // Se estiver alterando o funcionário
      if (data.funcionarioId && data.funcionarioId !== instrutorExistente.funcionarioId) {
        // Verificar se novo funcionário existe
        const funcionario = await funcionarioRepository.buscarPorId(data.funcionarioId);

        if (!funcionario) {
          throw new ApiError(404, 'Funcionário não encontrado');
        }

        if (funcionario.empresaId !== empresaId) {
          throw new ApiError(403, 'Funcionário não pertence a esta empresa');
        }

        if (funcionario.situacao !== 'ATIVO') {
          throw new ApiError(400, 'Funcionário não está ativo');
        }

        // Verificar se novo funcionário já é instrutor
        const novoInstrutorExistente = await instrutorRepository.buscarPorFuncionarioId(
          data.funcionarioId,
          empresaId
        );

        if (novoInstrutorExistente) {
          throw new ApiError(400, 'Este funcionário já está cadastrado como instrutor');
        }
      }

      // Atualizar instrutor
      const instrutorAtualizado = await instrutorRepository.atualizar(
        id,
        { funcionarioId: data.funcionarioId },
        empresaId
      );

      console.log('✅ Instrutor atualizado com sucesso:', id);
      return instrutorAtualizado;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao atualizar instrutor: ${error.message}`);
    }
  }

  /**
   * Deletar instrutor
   */
  async deletar(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // Verificar se instrutor existe
      const instrutor = await instrutorRepository.buscarPorId(id, empresaId);

      if (!instrutor) {
        throw new ApiError(404, 'Instrutor não encontrado');
      }

      // TODO: Verificar se instrutor está vinculado a turmas
      // Se estiver, você pode:
      // 1. Impedir a exclusão
      // 2. Desvincular das turmas
      // 3. Permitir exclusão mesmo assim

      // Deletar instrutor
      const deletedCount = await instrutorRepository.deletar(id, empresaId);

      if (deletedCount === 0) {
        throw new ApiError(500, 'Falha ao deletar instrutor');
      }

      console.log('✅ Instrutor deletado com sucesso:', id);
      return { message: 'Instrutor deletado com sucesso' };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao deletar instrutor: ${error.message}`);
    }
  }

  /**
   * Listar instrutores ativos
   */
  async listarAtivos(empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const instrutores = await instrutorRepository.buscarInstrutoresAtivos(empresaId);

      return {
        data: instrutores,
        total: instrutores.length
      };
    } catch (error) {
      console.error('❌ Erro ao listar instrutores ativos:', error);
      throw new ApiError(500, `Erro ao listar instrutores ativos: ${error.message}`);
    }
  }
}

module.exports = new InstrutorService();