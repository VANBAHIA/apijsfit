const express = require('express');
const router = express.Router();
const descontoController = require('../controllers/descontoController');

/**
 * @route   POST /api/descontos
 * @desc    Criar novo desconto
 */
router.post('/', descontoController.criar);

/**
 * @route   GET /api/descontos
 * @desc    Listar todos os descontos
 */
router.get('/', descontoController.listarTodos);

/**
 * @route   GET /api/descontos/:id
 * @desc    Buscar desconto por ID
 */
router.get('/:id', descontoController.buscarPorId);

/**
 * @route   PUT /api/descontos/:id
 * @desc    Atualizar desconto
 */
router.put('/:id', descontoController.atualizar);

/**
 * @route   DELETE /api/descontos/:id
 * @desc    Deletar desconto
 */
router.delete('/:id', descontoController.deletar);

/**
 * @route   POST /api/descontos/:id/calcular
 * @desc    Calcular valor do desconto
 */
router.post('/:id/calcular', descontoController.calcular);

module.exports = router;