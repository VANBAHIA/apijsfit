const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

/**
 * @route   POST /api/locais
 * @desc    Criar novo local
 * @access  Public
 */
router.post('/', localController.criar);

/**
 * @route   GET /api/locais
 * @desc    Listar todos os locais
 * @access  Public
 */
router.get('/', localController.listarTodos);

/**
 * @route   GET /api/locais/:id
 * @desc    Buscar local por ID
 * @access  Public
 */
router.get('/:id', localController.buscarPorId);

/**
 * @route   PUT /api/locais/:id
 * @desc    Atualizar local
 * @access  Public
 */
router.put('/:id', localController.atualizar);

/**
 * @route   DELETE /api/locais/:id
 * @desc    Deletar local
 * @access  Public
 */
router.delete('/:id', localController.deletar);

module.exports = router;