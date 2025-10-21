// src/routes/avaliacaoFisicaRoutes.js
const express = require('express');
const router = express.Router();
const avaliacaoFisicaController = require('../controllers/avaliacaoFisicaController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');

/**
 * @route   POST /api/avaliacoes-fisicas
 * @desc    Criar nova avaliação física
 * @access  Privado (requer permissão para criar)
 */
router.post('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'editar'), // Usando permissão de alunos
  avaliacaoFisicaController.criar
);

/**
 * @route   GET /api/avaliacoes-fisicas
 * @desc    Listar todas as avaliações físicas
 * @access  Privado (requer permissão para visualizar)
 */
router.get('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'acessar'),
  avaliacaoFisicaController.listarTodos
);

/**
 * @route   GET /api/avaliacoes-fisicas/aluno/:alunoId
 * @desc    Buscar histórico de avaliações de um aluno
 * @access  Privado
 */
router.get('/aluno/:alunoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'acessar'),
  avaliacaoFisicaController.buscarPorAluno
);

/**
 * @route   GET /api/avaliacoes-fisicas/aluno/:alunoId/evolucao
 * @desc    Buscar evolução do aluno
 * @access  Privado
 */
router.get('/aluno/:alunoId/evolucao',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'acessar'),
  avaliacaoFisicaController.buscarEvolucao
);

/**
 * @route   GET /api/avaliacoes-fisicas/comparar/:avaliacaoAnteriorId/:avaliacaoAtualId
 * @desc    Comparar duas avaliações
 * @access  Privado
 */
router.get('/comparar/:avaliacaoAnteriorId/:avaliacaoAtualId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'acessar'),
  avaliacaoFisicaController.compararAvaliacoes
);

/**
 * @route   GET /api/avaliacoes-fisicas/:id
 * @desc    Buscar avaliação física por ID
 * @access  Privado
 */
router.get('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'acessar'),
  avaliacaoFisicaController.buscarPorId
);

/**
 * @route   PUT /api/avaliacoes-fisicas/:id
 * @desc    Atualizar avaliação física
 * @access  Privado (requer permissão para editar)
 */
router.put('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'editar'),
  avaliacaoFisicaController.atualizar
);

/**
 * @route   DELETE /api/avaliacoes-fisicas/:id
 * @desc    Deletar avaliação física
 * @access  Privado (requer permissão para excluir)
 */
router.delete('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('alunos', 'excluir'),
  avaliacaoFisicaController.deletar
);

module.exports = router;