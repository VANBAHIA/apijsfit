const localRepository = require('../repositories/localRepository');
const ApiError = require('../utils/apiError');

class LocalService {
  async criar(data) {
    // Validação básica
    if (!data.nome) {
      throw new ApiError(400, 'Nome do local é obrigatório');
    }

    return await localRepository.criar({
      nome: data.nome,
      status: data.status || 'ATIVO'
    });
  }

  async buscarTodos(filtros) {
    return await localRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const local = await localRepository.buscarPorId(id);

    if (!local) {
      throw new ApiError(404, 'Local não encontrado');
    }

    return local;
  }

  async atualizar(id, data) {
    const local = await localRepository.buscarPorId(id);

    if (!local) {
      throw new ApiError(404, 'Local não encontrado');
    }

    return await localRepository.atualizar(id, data);
  }

  async deletar(id) {
    const local = await localRepository.buscarPorId(id);

    if (!local) {
      throw new ApiError(404, 'Local não encontrado');
    }

    return await localRepository.deletar(id);
  }
}

module.exports = new LocalService();