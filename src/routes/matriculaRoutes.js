const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');

router.post('/', matriculaController.criar);
router.get('/', matriculaController.listarTodos);
router.get('/:id', matriculaController.buscarPorId);
router.put('/:id', matriculaController.atualizar);
router.patch('/:id/inativar', matriculaController.inativar);
router.patch('/:id/reativar', matriculaController.reativar);
router.delete('/:id', matriculaController.deletar);

module.exports = router;