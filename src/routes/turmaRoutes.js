const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');

/**
 * @route   POST /api/turmas
 * @desc    Criar nova turma
 */
router.post('/', turmaController.criar);

/**
 * @route   GET /api/turmas
 * @desc    Listar todas as turmas
 */
router.get('/', turmaController.listarTodos);

/**
 * @route   GET /api/turmas/:id
 * @desc    Buscar turma por ID
 */
router.get('/:id', turmaController.buscarPorId);

/**
 * @route   PUT /api/turmas/:id
 * @desc    Atualizar turma
 */
router.put('/:id', turmaController.atualizar);

/**
 * @route   DELETE /api/turmas/:id
 * @desc    Deletar turma
 */
router.delete('/:id', turmaController.deletar);

/**
 * @route   POST /api/turmas/:id/horarios
 * @desc    Adicionar horário à turma
 */
router.post('/:id/horarios', turmaController.adicionarHorario);

/**
 * @route   POST /api/turmas/:id/instrutores
 * @desc    Adicionar instrutor à turma
 */
router.post('/:id/instrutores', turmaController.adicionarInstrutor);

/**
 * @route   DELETE /api/turmas/:id/instrutores
 * @desc    Remover instrutor da turma
 */
router.delete('/:id/instrutores', turmaController.removerInstrutor);

module.exports = router;