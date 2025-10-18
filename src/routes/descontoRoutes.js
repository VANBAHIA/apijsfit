// src/routes/descontoRoutes.js
const express = require('express');
const router = express.Router();
const descontoController = require('../controllers/descontoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/descontos
 * @desc    Criar novo desconto
 */
router.post('/', verificarAutenticacao, setEmpresaContext, descontoController.criar);

/**
 * @route   GET /api/descontos
 * @desc    Listar todos os descontos
 */
router.get('/', verificarAutenticacao, setEmpresaContext, descontoController.listarTodos);

/**
 * @route   GET /api/descontos/:id
 * @desc    Buscar desconto por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, descontoController.buscarPorId);

/**
 * @route   PUT /api/descontos/:id
 * @desc    Atualizar desconto
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, descontoController.atualizar);

/**
 * @route   DELETE /api/descontos/:id
 * @desc    Deletar desconto
 */
router.delete('/:id', verificarAutenticacao, setEmpresaContext, descontoController.deletar);

/**
 * @route   POST /api/descontos/:id/calcular
 * @desc    Calcular valor do desconto
 */
router.post('/:id/calcular', verificarAutenticacao, setEmpresaContext, descontoController.calcular);

module.exports = router;
