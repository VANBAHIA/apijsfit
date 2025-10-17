const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

/**
 * @route   POST /api/empresas
 * @desc    Criar nova empresa
 * @access  Public
 */
router.post('/buscar-cnpj', empresaController.buscarPorCNPJ);

/**
 * @route   POST /api/empresas
 * @desc    Criar nova empresa
 * @access  Public
 */
router.post('/', empresaController.criar);

/**
 * @route   GET /api/empresas
 * @desc    Listar todas as empresas com paginaçãocls
 * @access  Public
 */
router.get('/', empresaController.buscarTodos);

/**
 * @route   GET /api/empresas/buscar
 * @desc    Buscar empresas com filtros
 * @access  Public
 */
router.get('/buscar', empresaController.buscarComFiltros);

/**
 * @route   GET /api/empresas/:id
 * @desc    Buscar empresa por ID
 * @access  Public
 */
router.get('/:id', empresaController.buscarPorId);

/**
 * @route   PUT /api/empresas/:id
 * @desc    Atualizar empresa
 * @access  Public
 */
router.put('/:id', empresaController.atualizar);

/**
 * @route   PATCH /api/empresas/:id/situacao
 * @desc    Alterar situação da empresa
 * @access  Public
 */
router.patch('/:id/situacao', empresaController.alterarSituacao);

/**
 * @route   DELETE /api/empresas/:id
 * @desc    Deletar empresa
 * @access  Public
 */
router.delete('/:id', empresaController.deletar);

module.exports = router;