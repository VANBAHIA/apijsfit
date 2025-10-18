const equipamentoRepository = require('../repositories/equipamentoRepository');
const ApiError = require('../utils/apiError');

class EquipamentoService {
  /**
   * Gera o próximo código sequencial para equipamento (dentro da empresa)
   */
  async _gerarProximoCodigo(empresaId) {
    const ultimoEquipamento = await equipamentoRepository.buscarUltimoCodigo(empresaId);

    if (!ultimoEquipamento || !ultimoEquipamento.codigo) {
      return 'EQ00001';
    }

    // Extrair número do código (ex: EQ00001 -> 1)
    const ultimoNumero = parseInt(ultimoEquipamento.codigo.replace('EQ', ''));
    const proximoNumero = ultimoNumero + 1;

    return `EQ${proximoNumero.toString().padStart(5, '0')}`;
  }

  /**
   * Cria um novo equipamento
   */
  async criar(dados, empresaId) {
    const { nome } = dados;

    console.log('🔧 Service criando equipamento:', { nome, empresaId });

    // Validações
    if (!nome || nome.trim() === '') {
      throw new ApiError(400, 'Nome do equipamento é obrigatório');
    }

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // Verificar se já existe equipamento com esse nome na empresa
      const equipamentoExistente = await equipamentoRepository.buscarPorNome(nome, empresaId);

      if (equipamentoExistente) {
        throw new ApiError(400, 'Já existe um equipamento com este nome nesta empresa');
      }

      // Gerar próximo código
      const codigo = await this._gerarProximoCodigo(empresaId);

      // Criar equipamento
      const equipamento = await equipamentoRepository.criar({
        codigo,
        nome: nome.trim(),
        empresaId
      });

      console.log('✅ Equipamento criado com sucesso:', { id: equipamento.id, codigo });
      return equipamento;

    } catch (error) {
      console.error('❌ Erro ao criar equipamento:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao criar equipamento: ${error.message}`);
    }
  }

  /**
   * Lista todos os equipamentos com paginação e filtros
   */
  async listarTodos(filtros = {}) {
    const { page = 1, limit = 10, busca, empresaId } = filtros;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    const skip = (Number(page) - 1) * Number(limit);

    try {
      let resultado;

      // Se houver busca, filtrar por nome ou código
      if (busca) {
        const equipamentos = await equipamentoRepository.buscarTodos({
          skip,
          take: Number(limit),
          empresaId
        });

        // Filtrar manualmente por busca (case insensitive)
        const equipamentosFiltrados = equipamentos.equipamentos.filter(eq =>
          eq.nome.toLowerCase().includes(busca.toLowerCase()) ||
          eq.codigo.toLowerCase().includes(busca.toLowerCase())
        );

        resultado = {
          equipamentos: equipamentosFiltrados,
          total: equipamentosFiltrados.length
        };
      } else {
        resultado = await equipamentoRepository.buscarTodos({
          skip,
          take: Number(limit),
          empresaId
        });
      }

      return {
        data: resultado.equipamentos,
        pagination: {
          total: resultado.total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(resultado.total / Number(limit))
        }
      };
    } catch (error) {
      console.error('❌ Erro ao listar equipamentos:', error);
      throw new ApiError(500, `Erro ao listar equipamentos: ${error.message}`);
    }
  }

  /**
   * Busca um equipamento por ID
   */
  async buscarPorId(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const equipamento = await equipamentoRepository.buscarPorId(id, empresaId);

      if (!equipamento) {
        throw new ApiError(404, 'Equipamento não encontrado');
      }

      return equipamento;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar equipamento: ${error.message}`);
    }
  }

  /**
   * Busca um equipamento por código
   */
  async buscarPorCodigo(codigo, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const equipamento = await equipamentoRepository.buscarPorCodigo(codigo, empresaId);

      if (!equipamento) {
        throw new ApiError(404, 'Equipamento não encontrado');
      }

      return equipamento;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar equipamento: ${error.message}`);
    }
  }

  /**
   * Atualiza um equipamento
   */
  async atualizar(id, dados, empresaId) {
    const { nome } = dados;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    if (!nome || nome.trim() === '') {
      throw new ApiError(400, 'Nome do equipamento é obrigatório');
    }

    try {
      // Verificar se equipamento existe e pertence à empresa
      const equipamentoExistente = await equipamentoRepository.buscarPorId(id, empresaId);

      if (!equipamentoExistente) {
        throw new ApiError(404, 'Equipamento não encontrado');
      }

      // Verificar se já existe outro equipamento com esse nome
      const equipamentoMesmoNome = await equipamentoRepository.buscarPorNome(nome, empresaId);

      if (equipamentoMesmoNome && equipamentoMesmoNome.id !== id) {
        throw new ApiError(400, 'Já existe outro equipamento com este nome nesta empresa');
      }

      // Atualizar equipamento (código NÃO pode ser alterado)
      const equipamentoAtualizado = await equipamentoRepository.atualizar(
        id,
        { nome: nome.trim() },
        empresaId
      );

      console.log('✅ Equipamento atualizado com sucesso:', id);
      return equipamentoAtualizado;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao atualizar equipamento: ${error.message}`);
    }
  }

  /**
   * Deleta um equipamento
   */
  async deletar(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      // Verificar se equipamento existe e pertence à empresa
      const equipamento = await equipamentoRepository.buscarPorId(id, empresaId);

      if (!equipamento) {
        throw new ApiError(404, 'Equipamento não encontrado');
      }

      // Deletar equipamento
      await equipamentoRepository.deletar(id, empresaId);

      console.log('✅ Equipamento deletado com sucesso:', id);
      return { message: 'Equipamento deletado com sucesso' };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao deletar equipamento: ${error.message}`);
    }
  }
}

module.exports = new EquipamentoService();