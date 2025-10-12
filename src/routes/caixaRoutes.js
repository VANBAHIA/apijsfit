// src/routes/caixaRoutes.js

const express = require('express');
const router = express.Router();
const caixaController = require('../controllers/caixaController');

/**
 * @route   POST /api/caixas/abrir
 * @desc    Abrir novo caixa
 */
router.post('/abrir', caixaController.abrir);

/**
 * @route   GET /api/caixas/aberto
 * @desc    Buscar caixa aberto
 */
router.get('/aberto', caixaController.buscarAberto);

/**
 * @route   GET /api/caixas
 * @desc    Listar todos os caixas
 */
router.get('/', caixaController.listarTodos);

/**
 * @route   GET /api/caixas/:id
 * @desc    Buscar caixa por ID
 */
router.get('/:id', caixaController.buscarPorId);

/**
 * @route   GET /api/caixas/:id/relatorio
 * @desc    Gerar relatório detalhado do caixa
 */
router.get('/:id/relatorio', caixaController.relatorio);

/**
 * @route   POST /api/caixas/:id/fechar
 * @desc    Fechar caixa
 */
router.post('/:id/fechar', caixaController.fechar);

/**
 * @route   POST /api/caixas/:id/movimento
 * @desc    Registrar movimento no caixa
 */
router.post('/:id/movimento', caixaController.registrarMovimento);

/**
 * @route   DELETE /api/caixas/:id/movimento/:movimentoId
 * @desc    Remover movimento do caixa
 */
router.delete('/:id/movimento/:movimentoId', caixaController.removerMovimento);

/**
 * @route   POST /api/caixas/:id/sangria
 * @desc    Realizar sangria do caixa
 */
router.post('/:id/sangria', caixaController.sangria);

/**
 * @route   POST /api/caixas/:id/suprimento
 * @desc    Realizar suprimento no caixa
 */
router.post('/:id/suprimento', caixaController.suprimento);

module.exports = router;