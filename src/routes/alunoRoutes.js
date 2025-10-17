const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');



// ✅ APLICAR PERMISSÕES - Usando os nomes corretos dos métodos
router.get('/',
  verificarAutenticacao,setEmpresaContext ,
  verificarPermissaoModulo('alunos', 'acessar'),
  alunoController.listarTodos
);

router.post('/',
  verificarAutenticacao,setEmpresaContext,
  verificarPermissaoModulo('alunos', 'criar'),
  alunoController.criarComPessoa  // ← Era 'criar' mas o método é 'criarComPessoa'
);

router.get('/:id',
  verificarAutenticacao,setEmpresaContext,
  verificarPermissaoModulo('alunos', 'acessar'),
  alunoController.buscarPorId
);

router.put('/:id',
  verificarAutenticacao,setEmpresaContext,
  verificarPermissaoModulo('alunos', 'editar'),
  alunoController.atualizarComPessoa  // ← Era 'atualizar' mas o método é 'atualizarComPessoa'
);

router.delete('/:id',
  verificarAutenticacao,setEmpresaContext,
  verificarPermissaoModulo('alunos', 'excluir'),
  alunoController.deletar
);

// Rotas adicionais
router.post('/:id/horarios',
  verificarAutenticacao,setEmpresaContext,
  verificarPermissaoModulo('alunos', 'editar'),
  alunoController.adicionarHorario
);

router.post('/:id/validar-senha',
  verificarAutenticacao,setEmpresaContext,
  alunoController.validarSenha
);

module.exports = router;