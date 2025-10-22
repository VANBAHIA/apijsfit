// src/routes/instrutorRoutes.js
const express = require('express');
const router = express.Router();
const instrutorController = require('../controllers/instrutorController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');

/**
 * @route   GET /api/instrutores/ativos
 * @desc    Listar instrutores ativos (DEVE VIR ANTES DE /:id)
 * @access  Privado
 */
router.get('/ativos',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('instrutores', 'acessar'),
  instrutorController.listarAtivos
);

/**
 * @route   GET /api/instrutores/funcionario/:funcionarioId
 * @desc    Buscar instrutor por funcionarioId
 * @access  Privado
 */
router.get('/funcionario/:funcionarioId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('instrutores', 'acessar'),
  instrutorController.buscarPorFuncionarioId
);

/**
 * @route   POST /api/instrutores
 * @desc    Criar novo instrutor
 * @access  Privado
 */
router.post('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('instrutores', 'criar'),
  instrutorController.criar
);

/**
 * @route   GET /api/instrutores
 * @desc    Listar todos os instrutores
 * @access  Privado
 */
router.get('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('instrutores', 'acessar'),
  instrutorController.listarTodos
);

/**
 * @route   GET /api/instrutores/:id
 * @desc    Buscar instrutor por ID
 * @access  Privado
 */
router.get('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('instrutores', 'acessar'),
  instrutorController.buscarPorId
);

/**
 * @route   PUT /api/instrutores/:id
 * @desc    Atualizar instrutor
 * @access  Privado
 */
router.put('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('instrutores', 'editar'),
  instrutorController.atualizar
);

/**
 * @route   DELETE /api/instrutores/:id
 * @desc    Deletar instrutor
 * @access  Privado
 */
router.delete('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('instrutores', 'excluir'),
  instrutorController.deletar
);

module.exports = router;