const express = require('express');
const router = express.Router();
const frequenciaController = require('../controllers/frequenciaController');

// Rotas principais
router.post('/', frequenciaController.registrar);
router.post('/registrar-presenca', frequenciaController.registrarPresenca);
router.get('/', frequenciaController.listarTodos);
router.get('/relatorio', frequenciaController.gerarRelatorio);
router.get('/aluno/:alunoId/estatisticas', frequenciaController.buscarEstatisticas);
router.get('/:id', frequenciaController.buscarPorId);
router.put('/:id', frequenciaController.atualizar);
router.delete('/:id', frequenciaController.deletar);

module.exports = router;