// src/routes/matriculaRoutes.js
const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * Rotas de matrícula - todas passam por autenticação e recebem empresaId via middleware
 */

// Criar matrícula (gera também primeira cobrança)
router.post('/', verificarAutenticacao, setEmpresaContext, matriculaController.criar);

// Listar matrículas (paginado / filtros)
router.get('/', verificarAutenticacao, setEmpresaContext, matriculaController.listarTodos);

// Buscar matrícula por id
router.get('/:id', verificarAutenticacao, setEmpresaContext, matriculaController.buscarPorId);

// Atualizar matrícula
router.put('/:id', verificarAutenticacao, setEmpresaContext, matriculaController.atualizar);

// Inativar matrícula (patch)
router.patch('/:id/inativar', verificarAutenticacao, setEmpresaContext, matriculaController.inativar);

// Reativar matrícula (patch)
router.patch('/:id/reativar', verificarAutenticacao, setEmpresaContext, matriculaController.reativar);

// Deletar matrícula
router.delete('/:id', verificarAutenticacao, setEmpresaContext, matriculaController.deletar);

module.exports = router;
