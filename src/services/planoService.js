const planoRepository = require('../repositories/planoRepository');
const ApiError = require('../utils/apiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PlanoService {
  /**
   * Gera o próximo código sequencial para plano
   */
  async gerarProximoCodigo() {
    const ultimoPlano = await prisma.plano.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true }
    });

    if (!ultimoPlano || !ultimoPlano.codigo) {
      return 'P0001';
    }

    const ultimoNumero = parseInt(ultimoPlano.codigo.replace('P', ''));
    const proximoNumero = ultimoNumero + 1;

    return `P${proximoNumero.toString().padStart(4, '0')}`;
  }

  /**
   * Valida os campos do plano
   */

  // src/services/planoService.js

  validarPlano(data) {
    if (!data.nome) {
      throw new ApiError(400, 'Nome do plano é obrigatório');
    }

    if (!data.periodicidade) {
      throw new ApiError(400, 'Periodicidade é obrigatória');
    }

    if (!data.valorMensalidade || data.valorMensalidade <= 0) {
      throw new ApiError(400, 'Valor da mensalidade deve ser maior que zero');
    }

    // ✅ NOVA VALIDAÇÃO
    if (!data.tipoCobranca) {
      throw new ApiError(400, 'Tipo de cobrança é obrigatório (RECORRENTE ou UNICA)');
    }

    // ✅ VALIDAR CONSISTÊNCIA
    if (data.tipoCobranca === 'UNICA' && data.periodicidade === 'MENSAL') {
      throw new ApiError(400, 'Plano com cobrança única não pode ter periodicidade MENSAL');
    }

    // Validações específicas por periodicidade
    if (data.periodicidade === 'MESES') {
      if (!data.numeroMeses || data.numeroMeses <= 0) {
        throw new ApiError(400, 'Número de meses é obrigatório para periodicidade MESES');
      }
    }

    if (data.periodicidade === 'DIAS') {
      if (!data.numeroDias || data.numeroDias <= 0) {
        throw new ApiError(400, 'Número de dias é obrigatório para periodicidade DIAS');
      }
    }
  }

  async criar(data) {
    // Validar dados
    this.validarPlano(data);

    // Gerar código automaticamente se não fornecido
    if (!data.codigo) {
      data.codigo = await this.gerarProximoCodigo();
    }

    // Validar duplicidade de código
    const planoExistente = await planoRepository.buscarPorCodigo(data.codigo);
    if (planoExistente) {
      throw new ApiError(400, 'Código já cadastrado');
    }

    // Limpar campos não utilizados
    if (data.periodicidade !== 'MESES') {
      data.numeroMeses = null;
    }
    if (data.periodicidade !== 'DIAS') {
      data.numeroDias = null;
    }

    return await planoRepository.criar({
      codigo: data.codigo,
      nome: data.nome,
      periodicidade: data.periodicidade,
      numeroMeses: data.numeroMeses || null,
      numeroDias: data.numeroDias || null,
      valorMensalidade: data.valorMensalidade,
      status: data.status || 'ATIVO',
      descricao: data.descricao || null
    });
  }

  async buscarTodos(filtros) {
    return await planoRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const plano = await planoRepository.buscarPorId(id);

    if (!plano) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    return plano;
  }

  async atualizar(id, data) {
    const plano = await planoRepository.buscarPorId(id);

    if (!plano) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    // Validar dados
    if (data.nome || data.periodicidade || data.valorMensalidade) {
      this.validarPlano({ ...plano, ...data });
    }

    // Validar se código já existe (caso esteja sendo alterado)
    if (data.codigo && data.codigo !== plano.codigo) {
      const codigoExistente = await planoRepository.buscarPorCodigo(data.codigo);
      if (codigoExistente) {
        throw new ApiError(400, 'Código já cadastrado');
      }
    }

    // Limpar campos não utilizados
    if (data.periodicidade) {
      if (data.periodicidade !== 'MESES') {
        data.numeroMeses = null;
      }
      if (data.periodicidade !== 'DIAS') {
        data.numeroDias = null;
      }
    }

    return await planoRepository.atualizar(id, data);
  }

  async deletar(id) {
    const plano = await planoRepository.buscarPorId(id);

    if (!plano) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    return await planoRepository.deletar(id);
  }
}

module.exports = new PlanoService();