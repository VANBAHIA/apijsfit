const express = require('express');
const router = express.Router();
const localController = require('../controllers/localController');

router.post('/', localController.criar);
router.get('/', localController.listarTodos);
router.get('/:id', localController.buscarPorId);
router.put('/:id', localController.atualizar);
router.delete('/:id', localController.deletar);

module.exports = router;