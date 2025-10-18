// src/routes/planoRoutes.js
const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/planos
 * @desc    Criar novo plano
 */
router.post('/', verificarAutenticacao, setEmpresaContext, planoController.criar);

/**
 * @route   GET /api/planos
 * @desc    Listar todos os planos
 */
router.get('/', verificarAutenticacao, setEmpresaContext, planoController.listarTodos);

/**
 * @route   GET /api/planos/:id
 * @desc    Buscar plano por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, planoController.buscarPorId);

/**
 * @route   PUT /api/planos/:id
 * @desc    Atualizar plano
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, planoController.atualizar);

/**
 * @route   DELETE /api/planos/:id
 * @desc    Deletar plano
 */
router.delete('/:id', verificarAutenticacao, setEmpresaContext, planoController.deletar);

module.exports = router;
