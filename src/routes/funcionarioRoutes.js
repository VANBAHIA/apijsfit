const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');

/**
 * @route   POST /api/funcionarios
 * @desc    Criar novo funcionário com pessoa
 */
router.post('/', funcionarioController.criarComPessoa);

/**
 * @route   GET /api/funcionarios
 * @desc    Listar todos os funcionários
 */
router.get('/', funcionarioController.listarTodos);

/**
 * @route   GET /api/funcionarios/instrutores/lista
 * @desc    Listar apenas instrutores ativos
 */
router.get('/instrutores/lista', funcionarioController.listarInstrutores);

/**
 * @route   GET /api/funcionarios/:id
 * @desc    Buscar funcionário por ID
 */
router.get('/:id', funcionarioController.buscarPorId);

/**
 * @route   PUT /api/funcionarios/:id
 * @desc    Atualizar funcionário e pessoa
 */
router.put('/:id', funcionarioController.atualizarComPessoa);

/**
 * @route   DELETE /api/funcionarios/:id
 * @desc    Deletar funcionário
 */
router.delete('/:id', funcionarioController.deletar);

/**
 * @route   PATCH /api/funcionarios/:id/demitir
 * @desc    Demitir funcionário
 */
router.patch('/:id/demitir', funcionarioController.demitir);

/**
 * @route   PATCH /api/funcionarios/:id/reativar
 * @desc    Reativar funcionário
 */
router.patch('/:id/reativar', funcionarioController.reativar);

module.exports = router;