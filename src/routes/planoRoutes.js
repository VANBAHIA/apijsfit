const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');

/**
 * @route   POST /api/planos
 * @desc    Criar novo plano
 */
router.post('/', planoController.criar);

/**
 * @route   GET /api/planos
 * @desc    Listar todos os planos
 */
router.get('/', planoController.listarTodos);

/**
 * @route   GET /api/planos/:id
 * @desc    Buscar plano por ID
 */
router.get('/:id', planoController.buscarPorId);

/**
 * @route   PUT /api/planos/:id
 * @desc    Atualizar plano
 */
router.put('/:id', planoController.atualizar);

/**
 * @route   DELETE /api/planos/:id
 * @desc    Deletar plano
 */
router.delete('/:id', planoController.deletar);

module.exports = router;