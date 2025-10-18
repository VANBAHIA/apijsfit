const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');

// Listar (GET) - permissões conforme módulo 'exercicios'
router.get('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.listarTodos
);

router.post('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'criar'),
  exercicioController.criar
);

router.get('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.buscarPorId
);

router.put('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'editar'),
  exercicioController.atualizar
);

router.delete('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'excluir'),
  exercicioController.deletar
);

module.exports = router;
