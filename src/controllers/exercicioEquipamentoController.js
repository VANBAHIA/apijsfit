const exercicioEquipamentoService = require('../services/exercicioEquipamentoService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class ExercicioEquipamentoController {
  /**
   * Vincular exercício a equipamento
   */
  vincular = asyncHandler(async (req, res) => {
    const { exercicioId, equipamentoId } = req.params;
    const { descricaoUso } = req.body;
    const empresaId = req.empresaId;

    const resultado = await exercicioEquipamentoService.vincularExercicioEquipamento(
      exercicioId,
      equipamentoId,
      empresaId,
      descricaoUso
    );

    res.status(201).json(
      new ApiResponse(201, resultado, 'Exercício vinculado ao equipamento com sucesso')
    );
  });

  /**
   * Listar equipamentos de um exercício
   */
  listarEquipamentosDoExercicio = asyncHandler(async (req, res) => {
    const { exercicioId } = req.params;
    const empresaId = req.empresaId;

    const equipamentos = await exercicioEquipamentoService.obterEquipamentosDoExercicio(
      exercicioId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, equipamentos, 'Equipamentos do exercício listados com sucesso')
    );
  });

  /**
   * Obter exercício completo com equipamentos
   */
  obterExercicioCompleto = asyncHandler(async (req, res) => {
    const { exercicioId } = req.params;
    const empresaId = req.empresaId;

    const resultado = await exercicioEquipamentoService.obterExercicioComEquipamentos(
      exercicioId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, resultado, 'Exercício com equipamentos obtido com sucesso')
    );
  });

  /**
   * Listar exercícios de um equipamento
   */
  listarExerciciosDoEquipamento = asyncHandler(async (req, res) => {
    const { equipamentoId } = req.params;
    const empresaId = req.empresaId;

    const exercicios = await exercicioEquipamentoService.obterExerciciosDoEquipamento(
      equipamentoId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, exercicios, 'Exercícios do equipamento listados com sucesso')
    );
  });

  /**
   * Desvincular exercício de equipamento
   */
  desvincular = asyncHandler(async (req, res) => {
    const { exercicioId, equipamentoId } = req.params;
    const empresaId = req.empresaId;

    await exercicioEquipamentoService.desvincularExercicioEquipamento(
      exercicioId,
      equipamentoId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, null, 'Exercício desvinculado do equipamento com sucesso')
    );
  });

  /**
   * Atualizar vínculo
   */
  atualizarVinculo = asyncHandler(async (req, res) => {
    const { exercicioId, equipamentoId } = req.params;
    const { descricaoUso, disponivel } = req.body;
    const empresaId = req.empresaId;

    const dados = {};
    if (descricaoUso !== undefined) dados.descricaoUso = descricaoUso;
    if (disponivel !== undefined) dados.disponivel = disponivel;

    const resultado = await exercicioEquipamentoService.atualizarVinculo(
      exercicioId,
      equipamentoId,
      empresaId,
      dados
    );

    res.status(200).json(
      new ApiResponse(200, resultado, 'Vínculo atualizado com sucesso')
    );
  });
}

module.exports = new ExercicioEquipamentoController();