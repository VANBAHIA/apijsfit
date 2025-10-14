// src/routes/visitanteRoutes.js

const express = require('express');
const router = express.Router();
const visitanteController = require('../controllers/visitanteController');

/**
 * @route   POST /api/visitantes
 * @desc    Criar novo visitante
 */
router.post('/', visitanteController.criar);

/**
 * @route   GET /api/visitantes
 * @desc    Listar todos os visitantes com paginação e filtros
 */
router.get('/', visitanteController.listarTodos);

/**
 * @route   GET /api/visitantes/:id
 * @desc    Buscar visitante por ID
 */
router.get('/:id', visitanteController.buscarPorId);

/**
 * @route   PUT /api/visitantes/:id
 * @desc    Atualizar visitante
 */
router.put('/:id', visitanteController.atualizar);

/**
 * @route   DELETE /api/visitantes/:id
 * @desc    Deletar visitante
 */
router.delete('/:id', visitanteController.deletar);

/**
 * @route   GET /api/visitantes/relatorio/por-periodo
 * @desc    Relatório de visitantes por período
 */
router.get('/relatorio/por-periodo', visitanteController.relatorioPorPeriodo);

module.exports = router;