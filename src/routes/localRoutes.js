// src/routes/localRoutes.js
const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/locais
 * @desc    Criar novo local
 */
router.post('/', verificarAutenticacao, setEmpresaContext, localController.criar);

/**
 * @route   GET /api/locais
 * @desc    Listar todos os locais
 */
router.get('/', verificarAutenticacao, setEmpresaContext, localController.listarTodos);

/**
 * @route   GET /api/locais/:id
 * @desc    Buscar local por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, localController.buscarPorId);

/**
 * @route   PUT /api/locais/:id
 * @desc    Atualizar local
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, localController.atualizar);

/**
 * @route   DELETE /api/locais/:id
 * @desc    Deletar local
 */
router.delete('/:id', verificarAutenticacao, setEmpresaContext, localController.deletar);

module.exports = router;
