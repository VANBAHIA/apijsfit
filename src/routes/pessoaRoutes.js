const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');
const pessoaValidator = require('../validators/pessoaValidator');
const validateRequest = require('../middlewares/validateRequest');

/**
 * @route   POST /api/pessoas
 * @desc    Criar nova pessoa
 * @access  Public
 */
router.post(
  '/',
  pessoaValidator.criar,
  validateRequest,
  pessoaController.criar
);

/**
 * @route   GET /api/pessoas
 * @desc    Listar todas as pessoas com paginação
 * @access  Public
 */
router.get('/', pessoaController.buscarTodos);

/**
 * @route   GET /api/pessoas/buscar
 * @desc    Buscar pessoas com filtros
 * @access  Public
 */
router.get('/buscar', pessoaController.buscarComFiltros);

/**
 * @route   GET /api/pessoas/:id
 * @desc    Buscar pessoa por ID
 * @access  Public
 */
router.get(
  '/:id',
  pessoaValidator.buscarPorId,
  validateRequest,
  pessoaController.buscarPorId
);

/**
 * @route   PUT /api/pessoas/:id
 * @desc    Atualizar pessoa
 * @access  Public
 */
router.put(
  '/:id',
  pessoaValidator.atualizar,
  validateRequest,
  pessoaController.atualizar
);

/**
 * @route   DELETE /api/pessoas/:id
 * @desc    Deletar pessoa
 * @access  Public
 */
router.delete(
  '/:id',
  pessoaValidator.deletar,
  validateRequest,
  pessoaController.deletar
);

module.exports = router;