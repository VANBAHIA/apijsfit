const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

router.post('/', alunoController.criarComPessoa);
router.get('/', alunoController.listarTodos);
router.get('/:id', alunoController.buscarPorId);
router.put('/:id', alunoController.atualizarComPessoa);
router.delete('/:id', alunoController.deletar);
router.post('/:id/horarios', alunoController.adicionarHorario);
router.post('/:id/validar-senha', alunoController.validarSenha); // Nova

module.exports = router;