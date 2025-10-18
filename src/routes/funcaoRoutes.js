// src/routes/funcaoRoutes.js
const express = require('express');
const router = express.Router();
const funcaoController = require('../controllers/funcaoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/funcoes
 * @desc    Criar nova função
 */
router.post('/', verificarAutenticacao, setEmpresaContext, funcaoController.criar);

/**
 * @route   GET /api/funcoes
 * @desc    Listar todas as funções
 */
router.get('/', verificarAutenticacao, setEmpresaContext, funcaoController.listarTodos);

/**
 * @route   GET /api/funcoes/:id
 * @desc    Buscar função por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, funcaoController.buscarPorId);

/**
 * @route   PUT /api/funcoes/:id
 * @desc    Atualizar função
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, funcaoController.atualizar);

/**
 * @route   DELETE /api/funcoes/:id
 * @desc    Deletar função
 */
router.delete('/:id', verificarAutenticacao, setEmpresaContext, funcaoController.deletar);

module.exports = router;
