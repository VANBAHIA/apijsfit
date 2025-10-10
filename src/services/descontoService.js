const descontoRepository = require('../repositories/descontoRepository');
const ApiError = require('../utils/apiError');

class DescontoService {
  /**
   * Valida os dados do desconto
   */
  validarDesconto(data) {
    // Validar descrição
    if (!data.descricao || data.descricao.trim() === '') {
      throw new ApiError(400, 'Descrição é obrigatória');
    }

    // Validar tipo
    if (!data.tipo || !['PERCENTUAL', 'MONETARIO'].includes(data.tipo)) {
      throw new ApiError(400, 'Tipo deve ser PERCENTUAL ou MONETARIO');
    }

    // Validar valor
    if (data.valor === undefined || data.valor === null) {
      throw new ApiError(400, 'Valor é obrigatório');
    }

    const valor = Number(data.valor);

    if (isNaN(valor) || valor < 0) {
      throw new ApiError(400, 'Valor deve ser um número positivo');
    }

    // Validação específica para percentual
    if (data.tipo === 'PERCENTUAL' && valor > 100) {
      throw new ApiError(400, 'Desconto percentual não pode ser maior que 100%');
    }

    return true;
  }

  async criar(data) {
    // Validar dados
    this.validarDesconto(data);

    // Verificar duplicidade
    const descontoExistente = await descontoRepository.buscarPorDescricao(data.descricao);
    if (descontoExistente) {
      throw new ApiError(400, 'Já existe um desconto com esta descrição');
    }

    return await descontoRepository.criar({
      descricao: data.descricao.trim(),
      tipo: data.tipo,
      valor: Number(data.valor),
      status: data.status || 'ATIVO'
    });
  }

  async buscarTodos(filtros) {
    return await descontoRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const desconto = await descontoRepository.buscarPorId(id);

    if (!desconto) {
      throw new ApiError(404, 'Desconto não encontrado');
    }

    return desconto;
  }

  async atualizar(id, data) {
    const desconto = await descontoRepository.buscarPorId(id);

    if (!desconto) {
      throw new ApiError(404, 'Desconto não encontrado');
    }

    // Validar dados se foram enviados
    if (data.descricao || data.tipo || data.valor !== undefined) {
      this.validarDesconto({ 
        descricao: data.descricao || desconto.descricao,
        tipo: data.tipo || desconto.tipo,
        valor: data.valor !== undefined ? data.valor : desconto.valor
      });
    }

    // Verificar duplicidade de descrição se mudou
    if (data.descricao && data.descricao !== desconto.descricao) {
      const descontoExistente = await descontoRepository.buscarPorDescricao(data.descricao);
      if (descontoExistente) {
        throw new ApiError(400, 'Já existe um desconto com esta descrição');
      }
    }

    const dadosAtualizacao = {
      descricao: data.descricao ? data.descricao.trim() : undefined,
      tipo: data.tipo,
      valor: data.valor !== undefined ? Number(data.valor) : undefined,
      status: data.status
    };

    // Remove campos undefined
    Object.keys(dadosAtualizacao).forEach(key => 
      dadosAtualizacao[key] === undefined && delete dadosAtualizacao[key]
    );

    return await descontoRepository.atualizar(id, dadosAtualizacao);
  }

  async deletar(id) {
    const desconto = await descontoRepository.buscarPorId(id);

    if (!desconto) {
      throw new ApiError(404, 'Desconto não encontrado');
    }

    return await descontoRepository.deletar(id);
  }

  /**
   * Calcula o valor do desconto sobre um valor base
   */
  async calcularDesconto(id, valorBase) {
    const desconto = await this.buscarPorId(id);

    if (desconto.status !== 'ATIVO') {
      throw new ApiError(400, 'Desconto inativo');
    }

    let valorDesconto;

    if (desconto.tipo === 'PERCENTUAL') {
      valorDesconto = (valorBase * desconto.valor) / 100;
    } else {
      valorDesconto = desconto.valor;
    }

    return {
      desconto,
      valorBase,
      valorDesconto,
      valorFinal: valorBase - valorDesconto
    };
  }
}

module.exports = new DescontoService();