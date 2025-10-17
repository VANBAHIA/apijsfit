const empresaRepository = require('../repositories/empresaRepository');
const ApiError = require('../utils/apiError');
const prisma = require('../config/database');

class EmpresaService {

  async buscarPorCNPJ(cnpj) {
    // Limpar formatação do CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      throw new ApiError(400, 'CNPJ inválido');
    }

    // ✅ Formatar para o padrão do banco: XX.XXX.XXX/XXXX-XX
    const cnpjFormatado = cnpjLimpo.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );

    const empresa = await empresaRepository.buscarPorCnpj(cnpjFormatado);

    if (!empresa) {
      throw new ApiError(404, 'Empresa não encontrada');
    }

    if (empresa.situacao !== 'ATIVO') {
      throw new ApiError(400, 'Empresa não está ativa');
    }

    return {
      id: empresa.id,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      cnpj: empresa.cnpj
    };
  }

  async gerarProximoCodigo() {
    const ultimaEmpresa = await prisma.empresa.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true }
    });

    if (!ultimaEmpresa || !ultimaEmpresa.codigo) {
      return 'EMP0001';
    }

    const numeroAtual = parseInt(ultimaEmpresa.codigo.replace('EMP', ''));
    const proximoNumero = numeroAtual + 1;

    return `EMP${proximoNumero.toString().padStart(4, '0')}`;
  }

  async criar(data) {
    // Gerar código automaticamente
    if (!data.codigo) {
      data.codigo = await this.gerarProximoCodigo();
    }

    // Validar duplicidade de código
    const codigoExistente = await empresaRepository.buscarPorCodigo(data.codigo);
    if (codigoExistente) {
      throw new ApiError(400, 'Código de empresa já cadastrado');
    }

    // Validar CNPJ
    if (data.cnpj) {
      const cnpjExistente = await empresaRepository.buscarPorCnpj(data.cnpj);
      if (cnpjExistente) {
        throw new ApiError(400, 'CNPJ já cadastrado');
      }
    }

    // Validações básicas
    if (!data.razaoSocial) {
      throw new ApiError(400, 'Razão social é obrigatória');
    }

    if (!data.cnpj) {
      throw new ApiError(400, 'CNPJ é obrigatório');
    }

    return await empresaRepository.criar(data);
  }

  async buscarTodos(filtros) {
    return await empresaRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const empresa = await empresaRepository.buscarPorId(id);

    if (!empresa) {
      throw new ApiError(404, 'Empresa não encontrada');
    }

    return empresa;
  }

  async atualizar(id, data) {
    const empresa = await empresaRepository.buscarPorId(id);

    if (!empresa) {
      throw new ApiError(404, 'Empresa não encontrada');
    }

    // Validar código se estiver sendo alterado
    if (data.codigo && data.codigo !== empresa.codigo) {
      const codigoExistente = await empresaRepository.buscarPorCodigo(data.codigo);
      if (codigoExistente) {
        throw new ApiError(400, 'Código de empresa já cadastrado');
      }
    }

    // Validar CNPJ se estiver sendo alterado
    if (data.cnpj && data.cnpj !== empresa.cnpj) {
      const cnpjExistente = await empresaRepository.buscarPorCnpj(data.cnpj);
      if (cnpjExistente) {
        throw new ApiError(400, 'CNPJ já cadastrado');
      }
    }

    return await empresaRepository.atualizar(id, data);
  }

  async deletar(id) {
    const empresa = await empresaRepository.buscarPorId(id);

    if (!empresa) {
      throw new ApiError(404, 'Empresa não encontrada');
    }

    // Verificar se tem usuários ativos
    if (empresa.usuarios && empresa.usuarios.length > 0) {
      throw new ApiError(400, 'Não é possível deletar empresa com usuários cadastrados');
    }

    return await empresaRepository.deletar(id);
  }

  async buscarComFiltros(filtros) {
    return await empresaRepository.buscarComFiltros(filtros);
  }

  async alterarSituacao(id, situacao) {
    const situacoesValidas = ['ATIVO', 'INATIVO', 'BLOQUEADO'];

    if (!situacoesValidas.includes(situacao)) {
      throw new ApiError(400, 'Situação inválida');
    }

    return await empresaRepository.atualizar(id, { situacao });
  }


}

module.exports = new EmpresaService();