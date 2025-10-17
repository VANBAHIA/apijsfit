const pessoaRepository = require('../repositories/pessoaRepository');
const ApiError = require('../utils/apiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PessoaService {


  async criar(data) {



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
    if (data.id && data.id !== pessoa.id) {
      const codigoExistente = await pessoaRepository.buscarPorId(data.id);
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