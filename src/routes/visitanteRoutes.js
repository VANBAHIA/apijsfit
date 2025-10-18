// src/routes/visitanteRoutes.js
const express = require('express');
const router = express.Router();
const visitanteController = require('../controllers/visitanteController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

// ✅ Aplica autenticação e contexto da empresa
router.post('/', verificarAutenticacao, setEmpresaContext, visitanteController.criar);
router.get('/', verificarAutenticacao, setEmpresaContext, visitanteController.listarTodos);
router.get('/:id', verificarAutenticacao, setEmpresaContext, visitanteController.buscarPorId);
router.put('/:id', verificarAutenticacao, setEmpresaContext, visitanteController.atualizar);
router.delete('/:id', verificarAutenticacao, setEmpresaContext, visitanteController.deletar);
router.get('/relatorio/por-periodo', verificarAutenticacao, setEmpresaContext, visitanteController.relatorioPorPeriodo);

module.exports = router;
