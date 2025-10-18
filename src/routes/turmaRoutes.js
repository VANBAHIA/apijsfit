// src/routes/turmaRoutes.js
const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/turmas
 * @desc    Criar nova turma
 */
router.post('/', verificarAutenticacao, setEmpresaContext, turmaController.criar);

/**
 * @route   GET /api/turmas
 * @desc    Listar todas as turmas
 */
router.get('/', verificarAutenticacao, setEmpresaContext, turmaController.listarTodos);

/**
 * @route   GET /api/turmas/:id
 * @desc    Buscar turma por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, turmaController.buscarPorId);

/**
 * @route   PUT /api/turmas/:id
 * @desc    Atualizar turma
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, turmaController.atualizar);

/**
 * @route   DELETE /api/turmas/:id
 * @desc    Deletar turma
 */
router.delete('/:id', verificarAutenticacao, setEmpresaContext, turmaController.deletar);

/**
 * @route   POST /api/turmas/:id/horarios
 * @desc    Adicionar horário à turma
 */
router.post('/:id/horarios', verificarAutenticacao, setEmpresaContext, turmaController.adicionarHorario);

/**
 * @route   POST /api/turmas/:id/instrutores
 * @desc    Adicionar instrutor à turma
 */
router.post('/:id/instrutores', verificarAutenticacao, setEmpresaContext, turmaController.adicionarInstrutor);

/**
 * @route   DELETE /api/turmas/:id/instrutores
 * @desc    Remover instrutor da turma
 */
router.delete('/:id/instrutores', verificarAutenticacao, setEmpresaContext, turmaController.removerInstrutor);

module.exports = router;
