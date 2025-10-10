const express = require('express');
const router = express.Router();
const funcaoController = require('../controllers/funcaoController');

/**
 * @route   POST /api/funcoes
 * @desc    Criar nova função
 */
router.post('/', funcaoController.criar);

/**
 * @route   GET /api/funcoes
 * @desc    Listar todas as funções
 */
router.get('/', funcaoController.listarTodos);

/**
 * @route   GET /api/funcoes/:id
 * @desc    Buscar função por ID
 */
router.get('/:id', funcaoController.buscarPorId);

/**
 * @route   PUT /api/funcoes/:id
 * @desc    Atualizar função
 */
router.put('/:id', funcaoController.atualizar);

/**
 * @route   DELETE /api/funcoes/:id
 * @desc    Deletar função
 */
router.delete('/:id', funcaoController.deletar);

module.exports = router;