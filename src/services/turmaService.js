const turmaRepository = require('../repositories/turmaRepository');
const localRepository = require('../repositories/localRepository');
const funcionarioRepository = require('../repositories/funcionarioRepository');
const ApiError = require('../utils/apiError');

class TurmaService {
  /**
   * Valida os dados da turma
   */
  async validarTurma(data) {
    // Validar nome
    if (!data.nome || data.nome.trim() === '') {
      throw new ApiError(400, 'Nome da turma é obrigatório');
    }

    // Validar sexo
    if (!data.sexo || !['MASCULINO', 'FEMININO', 'AMBOS'].includes(data.sexo)) {
      throw new ApiError(400, 'Sexo deve ser MASCULINO, FEMININO ou AMBOS');
    }

    // Validar horários
    if (!data.horarios || !Array.isArray(data.horarios) || data.horarios.length === 0) {
      throw new ApiError(400, 'Pelo menos um horário deve ser informado');
    }

    // Validar cada horário
    for (const horario of data.horarios) {
      if (!horario.localId) {
        throw new ApiError(400, 'Local é obrigatório para cada horário');
      }

      // Verificar se local existe
      const local = await localRepository.buscarPorId(horario.localId);
      if (!local) {
        throw new ApiError(404, `Local ${horario.localId} não encontrado`);
      }

      if (!horario.diasSemana || horario.diasSemana.length === 0) {
        throw new ApiError(400, 'Dias da semana são obrigatórios');
      }

      if (!horario.horaEntrada || !horario.horaSaida) {
        throw new ApiError(400, 'Hora de entrada e saída são obrigatórias');
      }

      // Validar formato de hora (HH:MM)
      const regexHora = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!regexHora.test(horario.horaEntrada) || !regexHora.test(horario.horaSaida)) {
        throw new ApiError(400, 'Formato de hora inválido. Use HH:MM');
      }

      // Validar se hora de saída é maior que entrada
      if (horario.horaEntrada >= horario.horaSaida) {
        throw new ApiError(400, 'Hora de saída deve ser maior que hora de entrada');
      }
    }

    // Validar instrutores
    if (!data.instrutores || !Array.isArray(data.instrutores) || data.instrutores.length === 0) {
      throw new ApiError(400, 'Pelo menos um instrutor deve ser informado');
    }

    // Validar cada instrutor
    for (const instrutor of data.instrutores) {
      if (!instrutor.funcionarioId) {
        throw new ApiError(400, 'ID do funcionário é obrigatório');
      }

      const funcionario = await funcionarioRepository.buscarPorId(instrutor.funcionarioId);
      if (!funcionario) {
        throw new ApiError(404, `Funcionário ${instrutor.funcionarioId} não encontrado`);
      }

      if (funcionario.situacao !== 'ATIVO') {
        throw new ApiError(400, `Funcionário ${funcionario.pessoa.nome1} não está ativo`);
      }
    }

    return true;
  }

  /**
   * Prepara os dados dos horários
   */
  async prepararHorarios(horarios) {
    return await Promise.all(
      horarios.map(async (horario) => {
        const local = await localRepository.buscarPorId(horario.localId);
        return {
          localId: horario.localId,
          local: local.nome,
          diasSemana: horario.diasSemana,
          horaEntrada: horario.horaEntrada,
          horaSaida: horario.horaSaida
        };
      })
    );
  }

  /**
   * Prepara os dados dos instrutores
   */
  async prepararInstrutores(instrutores) {
    return await Promise.all(
      instrutores.map(async (instrutor) => {
        const funcionario = await funcionarioRepository.buscarPorId(instrutor.funcionarioId);
        return {
          funcionarioId: instrutor.funcionarioId,
          nome: `${funcionario.pessoa.nome1} ${funcionario.pessoa.nome2 || ''}`.trim(),
          matricula: funcionario.matricula
        };
      })
    );
  }

  async criar(data) {
    // Validar dados
    await this.validarTurma(data);

    // Verificar duplicidade
    const turmaExistente = await turmaRepository.buscarPorNome(data.nome);
    if (turmaExistente) {
      throw new ApiError(400, 'Já existe uma turma com este nome');
    }

    // Preparar horários com dados do local
    const horarios = await this.prepararHorarios(data.horarios);

    // Preparar instrutores com dados do funcionário
    const instrutores = await this.prepararInstrutores(data.instrutores);

    return await turmaRepository.criar({
      nome: data.nome.trim(),
      sexo: data.sexo,
      observacoes: data.observacoes || null,
      horarios,
      instrutores,
      status: data.status || 'ATIVO'
    });
  }

  async buscarTodos(filtros) {
    return await turmaRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const turma = await turmaRepository.buscarComDetalhes(id);

    if (!turma) {
      throw new ApiError(404, 'Turma não encontrada');
    }

    return turma;
  }

  async atualizar(id, data) {
    const turma = await turmaRepository.buscarPorId(id);

    if (!turma) {
      throw new ApiError(404, 'Turma não encontrada');
    }

    // Validar dados se foram enviados
    if (data.nome || data.sexo || data.horarios || data.instrutores) {
      await this.validarTurma({
        nome: data.nome || turma.nome,
        sexo: data.sexo || turma.sexo,
        horarios: data.horarios || turma.horarios,
        instrutores: data.instrutores || turma.instrutores
      });
    }

    // Verificar duplicidade de nome se mudou
    if (data.nome && data.nome !== turma.nome) {
      const turmaExistente = await turmaRepository.buscarPorNome(data.nome);
      if (turmaExistente) {
        throw new ApiError(400, 'Já existe uma turma com este nome');
      }
    }

    const dadosAtualizacao = {
      nome: data.nome ? data.nome.trim() : undefined,
      sexo: data.sexo,
      observacoes: data.observacoes,
      status: data.status
    };

    // Atualizar horários se enviados
    if (data.horarios) {
      dadosAtualizacao.horarios = await this.prepararHorarios(data.horarios);
    }

    // Atualizar instrutores se enviados
    if (data.instrutores) {
      dadosAtualizacao.instrutores = await this.prepararInstrutores(data.instrutores);
    }

    // Remove campos undefined
    Object.keys(dadosAtualizacao).forEach(key =>
      dadosAtualizacao[key] === undefined && delete dadosAtualizacao[key]
    );

    return await turmaRepository.atualizar(id, dadosAtualizacao);
  }

  async deletar(id) {
    const turma = await turmaRepository.buscarPorId(id);

    if (!turma) {
      throw new ApiError(404, 'Turma não encontrada');
    }

    return await turmaRepository.deletar(id);
  }

  /**
   * Adiciona um horário à turma
   */
  async adicionarHorario(id, horario) {
    const turma = await turmaRepository.buscarPorId(id);

    if (!turma) {
      throw new ApiError(404, 'Turma não encontrada');
    }

    // Validar horário
    await this.validarTurma({
      nome: turma.nome,
      sexo: turma.sexo,
      horarios: [horario],
      instrutores: turma.instrutores
    });

    const horarioPreparado = await this.prepararHorarios([horario]);
    const novosHorarios = [...turma.horarios, ...horarioPreparado];

    return await turmaRepository.atualizar(id, { horarios: novosHorarios });
  }

  /**
   * Adiciona um instrutor à turma
   */
  async adicionarInstrutor(id, instrutor) {
    const turma = await turmaRepository.buscarPorId(id);

    if (!turma) {
      throw new ApiError(404, 'Turma não encontrada');
    }

    // Verificar se instrutor já está na turma
    const instrutorExiste = turma.instrutores.some(
      i => i.funcionarioId === instrutor.funcionarioId
    );

    if (instrutorExiste) {
      throw new ApiError(400, 'Instrutor já está nesta turma');
    }

    // Validar instrutor
    await this.validarTurma({
      nome: turma.nome,
      sexo: turma.sexo,
      horarios: turma.horarios,
      instrutores: [instrutor]
    });

    const instrutorPreparado = await this.prepararInstrutores([instrutor]);
    const novosInstrutores = [...turma.instrutores, ...instrutorPreparado];

    return await turmaRepository.atualizar(id, { instrutores: novosInstrutores });
  }

  /**
   * Remove um instrutor da turma
   */
  async removerInstrutor(id, funcionarioId) {
    const turma = await turmaRepository.buscarPorId(id);

    if (!turma) {
      throw new ApiError(404, 'Turma não encontrada');
    }

    const novosInstrutores = turma.instrutores.filter(
      i => i.funcionarioId !== funcionarioId
    );

    if (novosInstrutores.length === turma.instrutores.length) {
      throw new ApiError(404, 'Instrutor não encontrado na turma');
    }

    if (novosInstrutores.length === 0) {
      throw new ApiError(400, 'Turma deve ter pelo menos um instrutor');
    }

    return await turmaRepository.atualizar(id, { instrutores: novosInstrutores });
  }
}

module.exports = new TurmaService();