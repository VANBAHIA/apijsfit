const pessoaRepository = require('../repositories/pessoaRepository');
const ApiError = require('../utils/apiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PessoaService {
  async gerarProximoCodigo() {
    // Busca a última pessoa ordenada por código (decrescente)
    const ultimaPessoa = await prisma.pessoa.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true }
    });

    if (!ultimaPessoa || !ultimaPessoa.codigo) {
      return '0001'; // Primeiro código
    }

    // Incrementa o código
    const ultimoNumero = parseInt(ultimaPessoa.codigo);
    const proximoNumero = ultimoNumero + 1;

    // Formata com zeros à esquerda (4 dígitos)
    return proximoNumero.toString().padStart(4, '0');
  }

  async criar(data) {
    // ✅ Gerar código automaticamente se não fornecido
    if (!data.codigo) {
      data.codigo = await this.gerarProximoCodigo();
    }

    // ✅ Validar duplicidade de código
    const pessoaExistente = await pessoaRepository.buscarPorCodigo(data.codigo);
    if (pessoaExistente) {
      throw new ApiError(400, 'Código já cadastrado');
    }

    // ✅ Validar doc1 (CPF/CNPJ) se fornecido
    if (data.doc1) {
      const doc1Existente = await pessoaRepository.buscarPordoc1(data.doc1);
      if (doc1Existente) {
        const tipoDoc = data.tipo === 'FISICA' ? 'CPF' : 'CNPJ';
 //       throw new ApiError(400, `${tipoDoc} já cadastrado`);
      }
    }

    return await pessoaRepository.criar(data);
  }

  async buscarTodos(filtros) {
    return await pessoaRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const pessoa = await pessoaRepository.buscarPorId(id);

    if (!pessoa) {
      throw new ApiError(404, 'Pessoa não encontrada');
    }

    return pessoa;
  }

  async atualizar(id, data) {
    const pessoa = await pessoaRepository.buscarPorId(id);

    if (!pessoa) {
      throw new ApiError(404, 'Pessoa não encontrada');
    }

    // Validar se código já existe (caso esteja sendo alterado)
    if (data.codigo && data.codigo !== pessoa.codigo) {
      const codigoExistente = await pessoaRepository.buscarPorCodigo(data.codigo);
      if (codigoExistente) {
        throw new ApiError(400, 'Código já cadastrado');
      }
    }

    return await pessoaRepository.atualizar(id, data);
  }

  async deletar(id) {
    const pessoa = await pessoaRepository.buscarPorId(id);

    if (!pessoa) {
      throw new ApiError(404, 'Pessoa não encontrada');
    }

    return await pessoaRepository.deletar(id);
  }

  async buscarComFiltros(filtros) {
    return await pessoaRepository.buscarComFiltros(filtros);
  }
}

module.exports = new PessoaService();