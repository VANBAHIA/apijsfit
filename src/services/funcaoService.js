const funcaoRepository = require('../repositories/funcaoRepository');
const ApiError = require('../utils/apiError');

class FuncaoService {
  async criar(data) {
    // Validação básica
    if (!data.funcao) {
      throw new ApiError(400, 'Nome da função é obrigatório');
    }

    // Verificar duplicidade
    const funcaoExistente = await funcaoRepository.buscarPorNome(data.funcao);
    if (funcaoExistente) {
      throw new ApiError(400, 'Função já cadastrada');
    }

    return await funcaoRepository.criar({
      funcao: data.funcao,
      status: data.status || 'ATIVO'
    });
  }

  async buscarTodos(filtros) {
    return await funcaoRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const funcao = await funcaoRepository.buscarPorId(id);

    if (!funcao) {
      throw new ApiError(404, 'Função não encontrada');
    }

    return funcao;
  }

  async atualizar(id, data) {
    const funcao = await funcaoRepository.buscarPorId(id);

    if (!funcao) {
      throw new ApiError(404, 'Função não encontrada');
    }

    // Verificar duplicidade se nome mudou
    if (data.funcao && data.funcao !== funcao.funcao) {
      const funcaoExistente = await funcaoRepository.buscarPorNome(data.funcao);
      if (funcaoExistente) {
        throw new ApiError(400, 'Função já cadastrada');
      }
    }

    return await funcaoRepository.atualizar(id, data);
  }

  async deletar(id) {
    const funcao = await funcaoRepository.buscarPorId(id);

    if (!funcao) {
      throw new ApiError(404, 'Função não encontrada');
    }

    return await funcaoRepository.deletar(id);
  }
}

module.exports = new FuncaoService();