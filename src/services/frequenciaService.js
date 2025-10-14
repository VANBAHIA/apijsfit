const frequenciaRepository = require('../repositories/frequenciaRepository');
const alunoRepository = require('../repositories/alunoRepository');
const ApiError = require('../utils/apiError');

class FrequenciaService {
  /**
   * Registra uma nova frequência
   */
  async registrar(dados) {
    const { alunoId, data, horarioInicio, presente, observacao, tipo, validadaPor } = dados;

    // Validar se aluno existe
    const aluno = await alunoRepository.buscarPorId(alunoId);
    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    // Verificar se já existe frequência para esta data
    const frequenciaExistente = await frequenciaRepository.buscarPorAlunoEData(
      alunoId,
      data
    );

    if (frequenciaExistente) {
      throw new ApiError(400, 'Já existe frequência registrada para este aluno nesta data');
    }

    const dadosFrequencia = {
      alunoId,
      data: new Date(data),
      horarioInicio: new Date(horarioInicio),
      presente: presente ?? false,
      observacao,
      tipo: tipo || 'MANUAL',
      validadaPor,
    };

    return await frequenciaRepository.criar(dadosFrequencia);
  }

  /**
   * Registra presença via senha de acesso
   */
  async registrarPresencaPorSenha(alunoId, senha) {
    const aluno = await alunoRepository.buscarPorId(alunoId);
    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    // Validar senha (assumindo que há um campo senhaAcesso no modelo Aluno)
    if (aluno.senhaAcesso !== senha) {
      throw new ApiError(401, 'Senha inválida');
    }

    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    // Verificar se já registrou presença hoje
    const frequenciaHoje = await frequenciaRepository.buscarPorAlunoEData(
      alunoId,
      hoje
    );

    if (frequenciaHoje) {
      throw new ApiError(400, 'Presença já registrada hoje');
    }

    return await frequenciaRepository.criar({
      alunoId,
      data: hoje,
      horarioInicio: agora,
      presente: true,
      tipo: 'AUTOMATICA',
      observacao: 'Presença registrada via senha de acesso',
    });
  }

  /**
   * Lista frequências com filtros
   */
  async listarTodos(filtros) {
    const { page = 1, limit = 10, ...outrosFiltros } = filtros;

    const skip = (Number(page) - 1) * Number(limit);

    const resultado = await frequenciaRepository.buscarTodos({
      skip,
      take: Number(limit),
      ...outrosFiltros,
    });

    return {
      frequencias: resultado.frequencias,
      paginacao: {
        total: resultado.total,
        pagina: Number(page),
        limite: Number(limit),
        totalPaginas: Math.ceil(resultado.total / Number(limit)),
      },
    };
  }

  /**
   * Busca frequência por ID
   */
  async buscarPorId(id) {
    const frequencia = await frequenciaRepository.buscarPorId(id);

    if (!frequencia) {
      throw new ApiError(404, 'Frequência não encontrada');
    }

    return frequencia;
  }

  /**
   * Atualiza uma frequência
   */
  async atualizar(id, dados) {
    const frequencia = await frequenciaRepository.buscarPorId(id);

    if (!frequencia) {
      throw new ApiError(404, 'Frequência não encontrada');
    }

    const dadosAtualizacao = {};

    if (dados.presente !== undefined) {
      dadosAtualizacao.presente = dados.presente;
    }

    if (dados.horarioFim) {
      dadosAtualizacao.horarioFim = new Date(dados.horarioFim);
    }

    if (dados.observacao !== undefined) {
      dadosAtualizacao.observacao = dados.observacao;
    }

    if (dados.validadaPor) {
      dadosAtualizacao.validadaPor = dados.validadaPor;
    }

    return await frequenciaRepository.atualizar(id, dadosAtualizacao);
  }

  /**
   * Deleta uma frequência
   */
  async deletar(id) {
    const frequencia = await frequenciaRepository.buscarPorId(id);

    if (!frequencia) {
      throw new ApiError(404, 'Frequência não encontrada');
    }

    await frequenciaRepository.deletar(id);
  }

  /**
   * Busca estatísticas de frequência de um aluno
   */
  async buscarEstatisticas(alunoId, dataInicio, dataFim) {
    const aluno = await alunoRepository.buscarPorId(alunoId);

    if (!aluno) {
      throw new ApiError(404, 'Aluno não encontrado');
    }

    return await frequenciaRepository.buscarEstatisticas(alunoId, dataInicio, dataFim);
  }

  /**
   * Gera relatório de frequência
   */
  async gerarRelatorio(filtros) {
    const { dataInicio, dataFim, alunoIds } = filtros;

    if (!dataInicio || !dataFim) {
      throw new ApiError(400, 'Data de início e fim são obrigatórias para relatórios');
    }

    const frequencias = await frequenciaRepository.buscarRelatorio({
      dataInicio,
      dataFim,
      alunoIds,
    });

    // Agrupa por aluno
    const relatorio = {};

    frequencias.forEach((freq) => {
      const alunoId = freq.alunoId;
      const nomeAluno = freq.aluno.pessoa.nome;

      if (!relatorio[alunoId]) {
        relatorio[alunoId] = {
          alunoId,
          nome: nomeAluno,
          cpf: freq.aluno.pessoa.cpf,
          totalAulas: 0,
          presencas: 0,
          faltas: 0,
          frequencias: [],
        };
      }

      relatorio[alunoId].totalAulas++;
      if (freq.presente) {
        relatorio[alunoId].presencas++;
      } else {
        relatorio[alunoId].faltas++;
      }

      relatorio[alunoId].frequencias.push({
        data: freq.data,
        presente: freq.presente,
        horario: freq.horarioInicio,
        observacao: freq.observacao,
      });
    });

    // Calcula percentuais
    Object.values(relatorio).forEach((aluno) => {
      aluno.percentualPresenca = aluno.totalAulas > 0
        ? ((aluno.presencas / aluno.totalAulas) * 100).toFixed(2)
        : 0;
    });

    return Object.values(relatorio);
  }
}

module.exports = new FrequenciaService();