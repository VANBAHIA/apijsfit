const express = require('express');
const router = express.Router();
const exercicioEquipamentoController = require('../controllers/exercicioEquipamentoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/exercicios/:exercicioId/equipamentos/:equipamentoId
 * @desc    Vincular exercício a equipamento
 */
router.post(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.vincular
);

/**
 * @route   GET /api/exercicios/:exercicioId/equipamentos
 * @desc    Listar equipamentos de um exercício
 */
router.get(
  '/:exercicioId/equipamentos',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.listarEquipamentosDoExercicio
);

/**
 * @route   GET /api/exercicios/:exercicioId/completo
 * @desc    Obter exercício com todos seus equipamentos
 */
router.get(
  '/:exercicioId/completo',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.obterExercicioCompleto
);

/**
 * @route   DELETE /api/exercicios/:exercicioId/equipamentos/:equipamentoId
 * @desc    Desvincular exercício de equipamento
 */
router.delete(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.desvincular
);

/**
 * @route   PATCH /api/exercicios/:exercicioId/equipamentos/:equipamentoId
 * @desc    Atualizar vínculo (descrição, disponibilidade)
 */
router.patch(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.atualizarVinculo
);

/**
 * ROTAS INVERSAS - Por Equipamento
 */

/**
 * @route   GET /api/equipamentos/:equipamentoId/exercicios
 * @desc    Listar exercícios de um equipamento
 */
router.get(
  '/equipamentos/:equipamentoId/exercicios',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.listarExerciciosDoEquipamento
);

module.exports = router;