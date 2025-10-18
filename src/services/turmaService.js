const turmaRepository = require('../repositories/turmaRepository');
const localRepository = require('../repositories/localRepository');
const funcionarioRepository = require('../repositories/funcionarioRepository');
const ApiError = require('../utils/apiError');
const planoRepository = require('../repositories/planoRepository');
const { plano } = require('../config/database');

class TurmaService {
  async criar(data) {
    if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    await this.validarTurma(data);

    const turmaExistente = await turmaRepository.buscarPorNome(data.nome, data.empresaId);
    if (turmaExistente) {
      throw new ApiError(400, 'Já existe uma turma com este nome nesta empresa');
    }

    // ✅ Validar planos vindos do front-end
    if (!data.planos || !Array.isArray(data.planos) || data.planos.length === 0) {
      throw new ApiError(400, 'Pelo menos um plano deve ser informado');
    }

    // validar se todos pertencem à empresa e existem
    const planosValidados = await Promise.all(
      data.planos.map(async (p) => {
        if (!p.planoId) {
          throw new ApiError(400, 'Campo planoId é obrigatório em cada plano');
        }

        const plano = await planoRepository.buscarPorId(p.planoId, data.empresaId);
        if (!plano) {
          throw new ApiError(404, `Plano ${p.nome || p.planoId} não encontrado ou não pertence à empresa`);
        }

        return {
          planoId: plano.id,
          codigo: plano.codigo,
          nome: plano.nome,
          valorMensalidade: plano.valorMensalidade,
          periodicidade: plano.periodicidade,
        };
      })
    );

    // ✅ Preparar horários e instrutores
    const horarios = await this.prepararHorarios(data.horarios, data.empresaId);
    const instrutores = await this.prepararInstrutores(data.instrutores, data.empresaId);

    // ✅ Criar turma
    return await turmaRepository.criar({
      nome: data.nome.trim(),
      sexo: data.sexo,
      observacoes: data.observacoes || null,
      horarios,
      instrutores,
      planos: planosValidados, // 👈 armazenado como JSON (lista de planos)
      status: data.status || 'ATIVO',
      empresaId: data.empresaId,
    });
  }

  async prepararHorarios(horarios, empresaId) {
    return await Promise.all(
      horarios.map(async (horario) => {
        const local = await localRepository.buscarPorId(horario.localId, empresaId);
        if (!local) throw new ApiError(404, `Local não encontrado ou não pertence à empresa`);

        return {
          localId: horario.localId,
          local: local.nome,
          diasSemana: horario.diasSemana,
          horaEntrada: horario.horaEntrada,
          horaSaida: horario.horaSaida,
        };
      })
    );
  }

  async prepararInstrutores(instrutores, empresaId) {
    return await Promise.all(
      instrutores.map(async (instrutor) => {
        const funcionario = await funcionarioRepository.buscarPorId(instrutor.funcionarioId, empresaId);
        if (!funcionario) throw new ApiError(404, `Funcionário não encontrado ou não pertence à empresa`);

        return {
          funcionarioId: instrutor.funcionarioId,
          nome: `${funcionario.pessoa.nome1} ${funcionario.pessoa.nome2 || ''}`.trim(),
          matricula: funcionario.matricula,
        };
      })
    );
  }





  async validarTurma(data) {
    if (!data.nome || data.nome.trim() === '') {
      throw new ApiError(400, 'Nome da turma é obrigatório');
    }

    if (!data.sexo || !['MASCULINO', 'FEMININO', 'AMBOS'].includes(data.sexo)) {
      throw new ApiError(400, 'Sexo deve ser MASCULINO, FEMININO ou AMBOS');
    }

    if (!data.horarios || !Array.isArray(data.horarios) || data.horarios.length === 0) {
      throw new ApiError(400, 'Pelo menos um horário deve ser informado');
    }

    for (const horario of data.horarios) {
      if (!horario.localId) {
        throw new ApiError(400, 'Local é obrigatório para cada horário');
      }

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

      const regexHora = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!regexHora.test(horario.horaEntrada) || !regexHora.test(horario.horaSaida)) {
        throw new ApiError(400, 'Formato de hora inválido. Use HH:MM');
      }

      if (horario.horaEntrada >= horario.horaSaida) {
        throw new ApiError(400, 'Hora de saída deve ser maior que hora de entrada');
      }
    }

    if (!data.instrutores || !Array.isArray(data.instrutores) || data.instrutores.length === 0) {
      throw new ApiError(400, 'Pelo menos um instrutor deve ser informado');
    }

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


  async buscarTodos(filtros = {}) {
    const { empresaId, status, sexo, skip = 0, take = 10 } = filtros;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await turmaRepository.buscarTodos({ empresaId, status, sexo, skip, take });
  }

  async buscarPorId(id, empresaId) {
    const turma = await turmaRepository.buscarComDetalhes(id, empresaId);
    if (!turma) throw new ApiError(404, 'Turma não encontrada para esta empresa');
    return turma;
  }

  async atualizar(id, data) {
  if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');

  const turma = await turmaRepository.buscarPorId(id, data.empresaId);
  if (!turma) throw new ApiError(404, 'Turma não encontrada');

  // ✅ Validar planos (caso sejam enviados)
  let planosValidados;
  if (data.planos && Array.isArray(data.planos) && data.planos.length > 0) {
    planosValidados = await Promise.all(
      data.planos.map(async (p) => {
        if (!p.planoId) throw new ApiError(400, 'Campo planoId é obrigatório em cada plano');

        const plano = await planoRepository.buscarPorId(p.planoId, data.empresaId);
        if (!plano) {
          throw new ApiError(404, `Plano ${p.nome || p.planoId} não encontrado ou não pertence à empresa`);
        }

        return {
          planoId: plano.id,
          codigo: plano.codigo,
          nome: plano.nome,
          valorMensalidade: plano.valorMensalidade,
          periodicidade: plano.periodicidade,
        };
      })
    );
  }

  // ✅ Validar turma com base nos novos dados
  await this.validarTurma({
    nome: data.nome || turma.nome,
    sexo: data.sexo || turma.sexo,
    planos: planosValidados || turma.planos,
    horarios: data.horarios || turma.horarios,
    instrutores: data.instrutores || turma.instrutores,
  });

  // ✅ Garantir nome único por empresa
  if (data.nome && data.nome !== turma.nome) {
    const existente = await turmaRepository.buscarPorNome(data.nome, data.empresaId);
    if (existente) throw new ApiError(400, 'Já existe uma turma com este nome nesta empresa');
  }

  // ✅ Montar objeto de atualização
  const dadosAtualizados = {
    nome: data.nome ? data.nome.trim() : undefined,
    sexo: data.sexo,
    observacoes: data.observacoes,
    status: data.status,
    empresaId: data.empresaId,
  };

  if (data.horarios) {
    dadosAtualizados.horarios = await this.prepararHorarios(data.horarios, data.empresaId);
  }

  if (data.instrutores) {
    dadosAtualizados.instrutores = await this.prepararInstrutores(data.instrutores, data.empresaId);
  }

  if (planosValidados) {
    dadosAtualizados.planos = planosValidados; // ✅ adiciona planos atualizados
  }

  // ✅ Remover chaves undefined (evita sobrescrever com null)
  Object.keys(dadosAtualizados).forEach(
    (key) => dadosAtualizados[key] === undefined && delete dadosAtualizados[key]
  );

  return await turmaRepository.atualizar(id, dadosAtualizados);
}

  async deletar(id, empresaId) {
    const turma = await turmaRepository.buscarPorId(id, empresaId);
    if (!turma) throw new ApiError(404, 'Turma não encontrada');
    return await turmaRepository.deletar(id);
  }

  async adicionarHorario(id, horario, empresaId) {
    const turma = await turmaRepository.buscarPorId(id, empresaId);
    if (!turma) throw new ApiError(404, 'Turma não encontrada');

    await this.validarTurma({
      nome: turma.nome,
      sexo: turma.sexo,
      horarios: [horario],
      instrutores: turma.instrutores,
    });

    const novo = await this.prepararHorarios([horario]);
    return await turmaRepository.atualizar(id, { horarios: [...turma.horarios, ...novo] });
  }

  async adicionarInstrutor(id, instrutor, empresaId) {
    const turma = await turmaRepository.buscarPorId(id, empresaId);
    if (!turma) throw new ApiError(404, 'Turma não encontrada');

    const existe = turma.instrutores.some((i) => i.funcionarioId === instrutor.funcionarioId);
    if (existe) throw new ApiError(400, 'Instrutor já está nesta turma');

    const novo = await this.prepararInstrutores([instrutor]);
    return await turmaRepository.atualizar(id, { instrutores: [...turma.instrutores, ...novo] });
  }

  async removerInstrutor(id, funcionarioId, empresaId) {
    const turma = await turmaRepository.buscarPorId(id, empresaId);
    if (!turma) throw new ApiError(404, 'Turma não encontrada');

    const atualizados = turma.instrutores.filter((i) => i.funcionarioId !== funcionarioId);
    if (atualizados.length === turma.instrutores.length)
      throw new ApiError(404, 'Instrutor não encontrado nesta turma');
    if (atualizados.length === 0)
      throw new ApiError(400, 'Turma deve ter pelo menos um instrutor');

    return await turmaRepository.atualizar(id, { instrutores: atualizados });
  }
}

module.exports = new TurmaService();
