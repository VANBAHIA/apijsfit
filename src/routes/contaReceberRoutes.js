const express = require('express');
const router = express.Router();
const contaReceberController = require('../controllers/contaReceberController');

router.post('/', contaReceberController.criar);
router.get('/', contaReceberController.listarTodos);
router.get('/:id', contaReceberController.buscarPorId);
router.post('/:id/pagar', contaReceberController.registrarPagamento);
router.patch('/:id/cancelar', contaReceberController.cancelar);
router.patch('/atualizar-vencidas', contaReceberController.atualizarVencidas);

module.exports = router;