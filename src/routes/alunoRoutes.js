const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');

// ✅ APLICAR PERMISSÕES - Usando os nomes corretos dos métodos
router.get('/',
  verificarAutenticacao,
  verificarPermissaoModulo('alunos', 'acessar'),
  alunoController.listarTodos
);

router.post('/',
  verificarAutenticacao,
  verificarPermissaoModulo('alunos', 'criar'),
  alunoController.criarComPessoa  // ← Era 'criar' mas o método é 'criarComPessoa'
);

router.get('/:id',
  verificarAutenticacao,
  verificarPermissaoModulo('alunos', 'acessar'),
  alunoController.buscarPorId
);

router.put('/:id',
  verificarAutenticacao,
  verificarPermissaoModulo('alunos', 'editar'),
  alunoController.atualizarComPessoa  // ← Era 'atualizar' mas o método é 'atualizarComPessoa'
);

router.delete('/:id',
  verificarAutenticacao,
  verificarPermissaoModulo('alunos', 'excluir'),
  alunoController.deletar
);

// Rotas adicionais
router.post('/:id/horarios',
  verificarAutenticacao,
  verificarPermissaoModulo('alunos', 'editar'),
  alunoController.adicionarHorario
);

router.post('/:id/validar-senha',
  verificarAutenticacao,
  alunoController.validarSenha
);

module.exports = router;