const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');

const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/funcionarios
 * @desc    Criar novo funcionário com pessoa
 */
router.post('/', verificarAutenticacao,setEmpresaContext, funcionarioController.criarComPessoa);

/**
 * @route   GET /api/funcionarios
 * @desc    Listar todos os funcionários
 */
router.get('/', verificarAutenticacao,setEmpresaContext,funcionarioController.listarTodos);

/**
 * @route   GET /api/funcionarios/instrutores/lista
 * @desc    Listar apenas instrutores ativos
 */
router.get('/instrutores/lista', verificarAutenticacao,setEmpresaContext,funcionarioController.listarInstrutores);

/**
 * @route   GET /api/funcionarios/:id
 * @desc    Buscar funcionário por ID
 */
router.get('/:id', verificarAutenticacao,setEmpresaContext,funcionarioController.buscarPorId);

/**
 * @route   PUT /api/funcionarios/:id
 * @desc    Atualizar funcionário e pessoa
 */
router.put('/:id', verificarAutenticacao,setEmpresaContext,funcionarioController.atualizarComPessoa);

/**
 * @route   DELETE /api/funcionarios/:id
 * @desc    Deletar funcionário
 */
router.delete('/:id', verificarAutenticacao,setEmpresaContext,funcionarioController.deletar);

/**
 * @route   PATCH /api/funcionarios/:id/demitir
 * @desc    Demitir funcionário
 */
router.patch('/:id/demitir', verificarAutenticacao,setEmpresaContext,funcionarioController.demitir);

/**
 * @route   PATCH /api/funcionarios/:id/reativar
 * @desc    Reativar funcionário
 */
router.patch('/:id/reativar', verificarAutenticacao,setEmpresaContext,funcionarioController.reativar);

module.exports = router;