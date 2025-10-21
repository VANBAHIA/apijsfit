// src/routes/caixaRoutes.js
const express = require('express');
const router = express.Router();
const caixaController = require('../controllers/caixaController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/caixas/abrir
 * @desc    Abrir novo caixa
 */
router.post('/abrir', verificarAutenticacao, setEmpresaContext, caixaController.abrir);

/**
 * @route   POST /api/caixas/:id/fechar
 * @desc    Fechar caixa
 */
router.post('/:id/fechar', verificarAutenticacao, setEmpresaContext, caixaController.fechar);

/**
 * @route   POST /api/caixas/:id/movimento
 * @desc    Registrar movimento no caixa
 */
router.post('/:id/movimento', verificarAutenticacao, setEmpresaContext, caixaController.registrarMovimento);

/**
 * @route   DELETE /api/caixas/:id/movimento/:movimentoId
 * @desc    Remover movimento do caixa
 */
router.delete('/:id/movimento/:movimentoId', verificarAutenticacao, setEmpresaContext, caixaController.removerMovimento);

/**
 * @route   GET /api/caixas/aberto
 * @desc    Buscar caixa aberto
 */
router.get('/aberto', verificarAutenticacao, setEmpresaContext, caixaController.buscarAberto);

/**
 * @route   GET /api/caixas
 * @desc    Listar todos os caixas
 */
router.get('/', verificarAutenticacao, setEmpresaContext, caixaController.listarTodos);

/**
 * @route   GET /api/caixas/:id
 * @desc    Buscar caixa por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, caixaController.buscarPorId);

/**
 * @route   GET /api/caixas/:id/relatorio
 * @desc    Gerar relatório detalhado do caixa
 */
router.get('/:id/relatorio', verificarAutenticacao, setEmpresaContext, caixaController.relatorio);

/**
 * @route   POST /api/caixas/:id/sangria
 * @desc    Realizar sangria do caixa
 */
router.post('/:id/sangria', verificarAutenticacao, setEmpresaContext, caixaController.sangria);

/**
 * @route   POST /api/caixas/:id/suprimento
 * @desc    Realizar suprimento no caixa
 */
router.post('/:id/suprimento', verificarAutenticacao, setEmpresaContext, caixaController.suprimento);

module.exports = router;
