const licencaRepository = require('../repositories/licencaRepository');
const empresaRepository = require('../repositories/empresaRepository');
const ApiError = require('../utils/apiError');
const { v4: uuidv4 } = require('uuid');

class LicencaService {
  gerarChave() {
    // Gera chave UUID única
    return uuidv4().toUpperCase();
  }

  calcularDataExpiracao(tipo, dataInicio = new Date()) {
    const data = new Date(dataInicio);

    switch (tipo) {
      case 'TRIAL':
        data.setDate(data.getDate() + 30); // 30 dias
        break;
      case 'MENSAL':
        data.setMonth(data.getMonth() + 1);
        break;
      case 'TRIMESTRAL':
        data.setMonth(data.getMonth() + 3);
        break;
      case 'SEMESTRAL':
        data.setMonth(data.getMonth() + 6);
        break;
      case 'ANUAL':
        data.setFullYear(data.getFullYear() + 1);
        break;
      case 'VITALICIA':
        data.setFullYear(data.getFullYear() + 100); // 100 anos
        break;
      default:
        throw new ApiError(400, 'Tipo de licença inválido');
    }

    return data;
  }

  async criar(data) {
    // Validar empresa
    const empresa = await empresaRepository.buscarPorId(data.empresaId);
    if (!empresa) {
      throw new ApiError(404, 'Empresa não encontrada');
    }

    // Gerar chave se não fornecida
    if (!data.chave) {
      data.chave = this.gerarChave();
    }

    // Validar duplicidade de chave
    const chaveExistente = await licencaRepository.buscarPorChave(data.chave);
    if (chaveExistente) {
      throw new ApiError(400, 'Chave de licença já cadastrada');
    }

    // Definir data de início
    if (!data.dataInicio) {
      data.dataInicio = new Date();
    }

    // Calcular data de expiração se não fornecida
    if (!data.dataExpiracao && data.tipo) {
      data.dataExpiracao = this.calcularDataExpiracao(data.tipo, data.dataInicio);
    }

    // Valores padrão
    data.maxUsuarios = data.maxUsuarios || 5;
    data.maxAlunos = data.maxAlunos || 100;
    data.funcionalidades = data.funcionalidades || ['ALUNOS', 'BASICO'];

    return await licencaRepository.criar(data);
  }

  async buscarTodos(filtros) {
    return await licencaRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const licenca = await licencaRepository.buscarPorId(id);

    if (!licenca) {
      throw new ApiError(404, 'Licença não encontrada');
    }

    return licenca;
  }

  async buscarPorChave(chave) {
    const licenca = await licencaRepository.buscarPorChave(chave);

    if (!licenca) {
      throw new ApiError(404, 'Licença não encontrada');
    }

    return licenca;
  }

  async validarLicenca(chave) {
    const licenca = await licencaRepository.buscarPorChave(chave);

    if (!licenca) {
      return {
        valida: false,
        motivo: 'Licença não encontrada'
      };
    }

    if (licenca.situacao !== 'ATIVA') {
      return {
        valida: false,
        motivo: `Licença ${licenca.situacao.toLowerCase()}`
      };
    }

    const agora = new Date();
    if (agora > licenca.dataExpiracao) {
      // Atualizar situação para EXPIRADA
      await licencaRepository.atualizar(licenca.id, { situacao: 'EXPIRADA' });
      
      return {
        valida: false,
        motivo: 'Licença expirada'
      };
    }

    return {
      valida: true,
      licenca,
      diasRestantes: Math.ceil((licenca.dataExpiracao - agora) / (1000 * 60 * 60 * 24))
    };
  }

  async atualizar(id, data) {
    const licenca = await licencaRepository.buscarPorId(id);

    if (!licenca) {
      throw new ApiError(404, 'Licença não encontrada');
    }

    // Validar chave se estiver sendo alterada
    if (data.chave && data.chave !== licenca.chave) {
      const chaveExistente = await licencaRepository.buscarPorChave(data.chave);
      if (chaveExistente) {
        throw new ApiError(400, 'Chave de licença já cadastrada');
      }
    }

    return await licencaRepository.atualizar(id, data);
  }

  async renovar(id, tipo) {
    const licenca = await licencaRepository.buscarPorId(id);

    if (!licenca) {
      throw new ApiError(404, 'Licença não encontrada');
    }

    const novaDataInicio = new Date();
    const novaDataExpiracao = this.calcularDataExpiracao(tipo, novaDataInicio);

    return await licencaRepository.atualizar(id, {
      tipo,
      dataInicio: novaDataInicio,
      dataExpiracao: novaDataExpiracao,
      situacao: 'ATIVA'
    });
  }

  async cancelar(id, motivo) {
    const licenca = await licencaRepository.buscarPorId(id);

    if (!licenca) {
      throw new ApiError(404, 'Licença não encontrada');
    }

    return await licencaRepository.atualizar(id, {
      situacao: 'CANCELADA',
      observacoes: motivo
    });
  }

  async suspender(id, motivo) {
    const licenca = await licencaRepository.buscarPorId(id);

    if (!licenca) {
      throw new ApiError(404, 'Licença não encontrada');
    }

    return await licencaRepository.atualizar(id, {
      situacao: 'SUSPENSA',
      observacoes: motivo
    });
  }

  async reativar(id) {
    const licenca = await licencaRepository.buscarPorId(id);

    if (!licenca) {
      throw new ApiError(404, 'Licença não encontrada');
    }

    // Verificar se ainda não expirou
    const agora = new Date();
    if (agora > licenca.dataExpiracao) {
      throw new ApiError(400, 'Não é possível reativar uma licença expirada. Renove a licença.');
    }

    return await licencaRepository.atualizar(id, {
      situacao: 'ATIVA'
    });
  }

  async expirarLicencasVencidas() {
    return await licencaRepository.expirarLicencasVencidas();
  }
}

module.exports = new LicencaService();