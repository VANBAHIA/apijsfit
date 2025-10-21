const express = require('express');
const router = express.Router();
const equipamentoController = require('../controllers/equipamentoController');
const exercicioEquipamentoController = require('../controllers/exercicioEquipamentoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');

// ✅ ROTAS MAIS ESPECÍFICAS PRIMEIRO

// Listar exercícios de um equipamento (GET)
router.get(
  '/:equipamentoId/exercicios',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'visualizar'),
  exercicioEquipamentoController.listarExerciciosDoEquipamento
);

// ✅ ROTAS GENÉRICAS POR ÚLTIMO

// Listar todos
router.get(
  '/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'acessar'),
  equipamentoController.listarTodos
);

// Criar
router.post(
  '/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'criar'),
  equipamentoController.criar
);

// Buscar por ID
router.get(
  '/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'acessar'),
  equipamentoController.buscarPorId
);

// Buscar por código
router.get(
  '/codigo/:codigo',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'acessar'),
  equipamentoController.buscarPorCodigo
);

// Atualizar
router.put(
  '/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'editar'),
  equipamentoController.atualizar
);

// Deletar
router.delete(
  '/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'excluir'),
  equipamentoController.deletar
);

module.exports = router;