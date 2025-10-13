const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

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
 * @access  Public
 */
router.post('/', usuarioController.criar);

/**
 * @route   GET /api/usuarios
 * @desc    Listar todos os usuários com paginação
 * @access  Public
 */
router.get('/', usuarioController.buscarTodos);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Buscar usuário por ID
 * @access  Public
 */
router.get('/:id', usuarioController.buscarPorId);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Atualizar usuário
 * @access  Public
 */
router.put('/:id', usuarioController.atualizar);

/**
 * @route   PATCH /api/usuarios/:id/senha
 * @desc    Alterar senha do usuário
 * @access  Public
 */
router.patch('/:id/senha', usuarioController.alterarSenha);

/**
 * @route   PATCH /api/usuarios/:id/situacao
 * @desc    Alterar situação do usuário
 * @access  Public
 */
router.patch('/:id/situacao', usuarioController.alterarSituacao);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Deletar usuário
 * @access  Public
 */
router.delete('/:id', usuarioController.deletar);

module.exports = router;