const grupoExercicioRepository = require('../repositories/grupoExercicioRepository');
const ApiError = require('../utils/apiError');

class GrupoExercicioService {
  /**
   * Cria um novo grupo de exercício
   */
  async criar(dados, empresaId) {
    const { nome } = dados;

    console.log('💪 Service criando grupo de exercício:', { nome, empresaId });

    // Validações
    if (!nome || nome.trim() === '') {
      throw new ApiError(400, 'Nome do grupo de exercício é obrigatório');
    }

    if (nome.trim().length < 3) {
      throw new ApiError(400, 'Nome deve ter pelo menos 3 caracteres');
    }

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // Verificar se já existe grupo com esse nome na empresa
      const grupoExistente = await grupoExercicioRepository.buscarPorNome(nome, empresaId);

      if (grupoExistente) {
        throw new ApiError(400, 'Já existe um grupo de exercício com este nome nesta empresa');
      }

      const ultimoCodigo = await grupoExercicioRepository.buscarUltimoCodigo(empresaId);
      const proximoCodigo = ultimoCodigo + 1;

      // Criar grupo de exercício
      const grupo = await grupoExercicioRepository.criar({
        nome: nome.trim().toUpperCase(), // Salvar em maiúsculas
        empresaId,
        codigo: proximoCodigo.toString(),
      });

      console.log('✅ Grupo de exercício criado com sucesso:', grupo.id);
      return grupo;

    } catch (error) {
      console.error('❌ Erro ao criar grupo de exercício:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao criar grupo de exercício: ${error.message}`);
    }
  }

  /**
   * Lista todos os grupos de exercício com paginação e filtros
   */
  async listarTodos(filtros = {}) {
    const { page = 1, limit = 50, busca, empresaId } = filtros;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    const skip = (Number(page) - 1) * Number(limit);

    try {
      let resultado;

      // Se houver busca, filtrar por nome
      if (busca) {
        const grupos = await grupoExercicioRepository.buscarTodos({
          skip: 0,
          take: 1000, // Buscar todos para filtrar
          empresaId
        });

        // Filtrar manualmente por busca (case insensitive)
        const gruposFiltrados = grupos.grupos.filter(grupo =>
          grupo.nome.toLowerCase().includes(busca.toLowerCase())
        );

        // Paginar após filtrar
        const gruposPaginados = gruposFiltrados.slice(skip, skip + Number(limit));

        resultado = {
          grupos: gruposPaginados,
          total: gruposFiltrados.length
        };
      } else {
        resultado = await grupoExercicioRepository.buscarTodos({
          skip,
          take: Number(limit),
          empresaId
        });
      }

      return {
        data: resultado.grupos,
        pagination: {
          total: resultado.total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(resultado.total / Number(limit))
        }
      };
    } catch (error) {
      console.error('❌ Erro ao listar grupos de exercício:', error);
      throw new ApiError(500, `Erro ao listar grupos de exercício: ${error.message}`);
    }
  }

  /**
   * Busca um grupo de exercício por ID
   */
  async buscarPorId(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const grupo = await grupoExercicioRepository.buscarPorId(id, empresaId);

      if (!grupo) {
        throw new ApiError(404, 'Grupo de exercício não encontrado');
      }

      return grupo;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar grupo de exercício: ${error.message}`);
    }
  }

  /**
   * Atualiza um grupo de exercício
   */
  async atualizar(id, dados, empresaId) {
    const { nome } = dados;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    if (!nome || nome.trim() === '') {
      throw new ApiError(400, 'Nome do grupo de exercício é obrigatório');
    }

    if (nome.trim().length < 3) {
      throw new ApiError(400, 'Nome deve ter pelo menos 3 caracteres');
    }

    try {
      // Verificar se grupo existe e pertence à empresa
      const grupoExistente = await grupoExercicioRepository.buscarPorId(id, empresaId);

      if (!grupoExistente) {
        throw new ApiError(404, 'Grupo de exercício não encontrado');
      }

      // Verificar se já existe outro grupo com esse nome
      const grupoMesmoNome = await grupoExercicioRepository.buscarPorNome(nome, empresaId);

      if (grupoMesmoNome && grupoMesmoNome.id !== id) {
        throw new ApiError(400, 'Já existe outro grupo de exercício com este nome nesta empresa');
      }

      // Atualizar grupo
      const grupoAtualizado = await grupoExercicioRepository.atualizar(
        id,
        { nome: nome.trim().toUpperCase() },
        empresaId
      );

      console.log('✅ Grupo de exercício atualizado com sucesso:', id);
      return grupoAtualizado;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao atualizar grupo de exercício: ${error.message}`);
    }
  }

  /**
   * Deleta um grupo de exercício
   */
  async deletar(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // Verificar se grupo existe e pertence à empresa
      const grupo = await grupoExercicioRepository.buscarPorId(id, empresaId);

      if (!grupo) {
        throw new ApiError(404, 'Grupo de exercício não encontrado');
      }

      // TODO: Verificar se existem exercícios vinculados a este grupo
      // Caso existam, você pode:
      // 1. Impedir a exclusão
      // 2. Desvincular os exercícios
      // 3. Excluir em cascata (se configurado no Prisma)

      // Deletar grupo
      await grupoExercicioRepository.deletar(id, empresaId);

      console.log('✅ Grupo de exercício deletado com sucesso:', id);
      return { message: 'Grupo de exercício deletado com sucesso' };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao deletar grupo de exercício: ${error.message}`);
    }
  }
}

module.exports = new GrupoExercicioService();