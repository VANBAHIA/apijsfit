const express = require('express');
const router = express.Router();
const grupoExercicioController = require('../controllers/grupoExercicioController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');

// ✅ APLICAR PERMISSÕES
router.get('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('modalidades', 'acessar'),
  grupoExercicioController.listarTodos
);

router.post('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('modalidades', 'criar'),
  grupoExercicioController.criar
);

router.get('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('modalidades', 'acessar'),
  grupoExercicioController.buscarPorId
);

router.put('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('modalidades', 'editar'),
  grupoExercicioController.atualizar
);

router.delete('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('modalidades', 'excluir'),
  grupoExercicioController.deletar
);

module.exports = router;