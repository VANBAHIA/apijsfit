const express = require('express');
const router = express.Router();
const equipamentoController = require('../controllers/equipamentoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');

// ✅ APLICAR PERMISSÕES
router.get('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'acessar'),
  equipamentoController.listarTodos
);

router.post('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'criar'),
  equipamentoController.criar
);

router.get('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'acessar'),
  equipamentoController.buscarPorId
);

router.get('/codigo/:codigo',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'acessar'),
  equipamentoController.buscarPorCodigo
);

router.put('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'editar'),
  equipamentoController.atualizar
);

router.delete('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('equipamentos', 'excluir'),
  equipamentoController.deletar
);

module.exports = router;