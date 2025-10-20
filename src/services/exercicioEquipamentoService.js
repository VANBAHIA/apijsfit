const exercicioEquipamentoRepository = require('../repositories/exercicioEquipamentoRepository');
const exercicioRepository = require('../repositories/exercicioRepository');
const equipamentoRepository = require('../repositories/equipamentoRepository');
const ApiError = require('../utils/apiError');

class ExercicioEquipamentoService {
  /**
   * Vincular um exercício a um equipamento
   */
  async vincularExercicioEquipamento(exercicioId, equipamentoId, empresaId, descricaoUso = null) {
    // 1. Validar se exercício existe e pertence à empresa
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) {
      throw new ApiError(404, 'Exercício não encontrado nesta empresa');
    }

    // 2. Validar se equipamento existe e pertence à empresa
    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) {
      throw new ApiError(404, 'Equipamento não encontrado nesta empresa');
    }

    // 3. Verificar se já existe vínculo
    const vinculoExistente = await exercicioEquipamentoRepository.buscarVinculo(
      exercicioId,
      equipamentoId
    );
    if (vinculoExistente) {
      throw new ApiError(400, 'Este exercício já está vinculado a este equipamento');
    }

    // 4. Criar vínculo
    return await exercicioEquipamentoRepository.vincular(
      exercicioId,
      equipamentoId,
      descricaoUso
    );
  }

  /**
   * Listar equipamentos de um exercício com suas informações completas
   */
  async obterEquipamentosDoExercicio(exercicioId, empresaId) {
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) {
      throw new ApiError(404, 'Exercício não encontrado');
    }

    return await exercicioEquipamentoRepository.buscarEquipamentosPorExercicio(
      exercicioId,
      empresaId
    );
  }

  /**
   * Listar exercícios de um equipamento
   */
  async obterExerciciosDoEquipamento(equipamentoId, empresaId) {
    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) {
      throw new ApiError(404, 'Equipamento não encontrado');
    }

    return await exercicioEquipamentoRepository.buscarExerciciosPorEquipamento(
      equipamentoId,
      empresaId
    );
  }

  /**
   * Desvincular exercício de equipamento
   */
  async desvincularExercicioEquipamento(exercicioId, equipamentoId, empresaId) {
    // Validar que ambos existem
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) throw new ApiError(404, 'Exercício não encontrado');

    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) throw new ApiError(404, 'Equipamento não encontrado');

    // Verificar se vínculo existe
    const vinculo = await exercicioEquipamentoRepository.buscarVinculo(
      exercicioId,
      equipamentoId
    );
    if (!vinculo) {
      throw new ApiError(404, 'Vínculo não encontrado');
    }

    return await exercicioEquipamentoRepository.desvincular(exercicioId, equipamentoId);
  }

  /**
   * Atualizar metadados do vínculo (ex: descrição de uso, disponibilidade)
   */
  async atualizarVinculo(exercicioId, equipamentoId, empresaId, dados) {
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) throw new ApiError(404, 'Exercício não encontrado');

    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) throw new ApiError(404, 'Equipamento não encontrado');

    const vinculo = await exercicioEquipamentoRepository.buscarVinculo(
      exercicioId,
      equipamentoId
    );
    if (!vinculo) {
      throw new ApiError(404, 'Vínculo não encontrado');
    }

    return await exercicioEquipamentoRepository.atualizar(exercicioId, equipamentoId, dados);
  }

  /**
   * Buscar informações completas do exercício com seus equipamentos
   */
  async obterExercicioComEquipamentos(exercicioId, empresaId) {
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) {
      throw new ApiError(404, 'Exercício não encontrado');
    }

    const equipamentos = await exercicioEquipamentoRepository.buscarEquipamentosPorExercicio(
      exercicioId,
      empresaId
    );

    return {
      exercicio,
      equipamentos: equipamentos.map(e => ({
        id: e.equipamento.id,
        codigo: e.equipamento.codigo,
        nome: e.equipamento.nome,
        descricaoUso: e.descricaoUso,
        disponivel: e.disponivel,
        vinculoId: e.id
      }))
    };
  }
}

module.exports = new ExercicioEquipamentoService();