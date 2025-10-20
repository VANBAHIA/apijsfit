const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/usuarios/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', usuarioController.login);

/**
 * @route   POST /api/usuarios/validar-token
 * @desc    Validar token JWT
 * @access  Public
 */
router.post('/validar-token', usuarioController.validarToken);

/**
 * @route   POST /api/usuarios
 * @desc    Criar novo usuário
 * @access  Privado (empresa)
 */
router.post('/', verificarAutenticacao, setEmpresaContext, usuarioController.criar);

/**
 * @route   GET /api/usuarios
 * @desc    Listar todos os usuários
 * @access  Privado (empresa)
 */
router.get('/', verificarAutenticacao, setEmpresaContext, usuarioController.buscarTodos);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Buscar usuário por ID
 * @access  Privado (empresa)
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, usuarioController.buscarPorId);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Atualizar usuário
 * @access  Privado (empresa)
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, usuarioController.atualizar);

/**
 * @route   PATCH /api/usuarios/:id/senha
 * @desc    Alterar senha do usuário
 * @access  Privado (empresa)
 */
router.patch('/:id/senha', verificarAutenticacao, setEmpresaContext, usuarioController.alterarSenha);

/**
 * @route   PATCH /api/usuarios/:id/situacao
 * @desc    Alterar situação do usuário
 * @access  Privado (empresa)
 */
router.patch('/:id/situacao', verificarAutenticacao, setEmpresaContext, usuarioController.alterarSituacao);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Deletar usuário
 * @access  Privado (empresa)
 */
router.delete('/:id', verificarAutenticacao, setEmpresaContext, usuarioController.deletar);

module.exports = router;
