// src/routes/contaReceberRoutes.js
const express = require('express');
const router = express.Router();
const contaReceberController = require('../controllers/contaReceberController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/contas-receber
 * @desc    Criar nova conta a receber
 */
router.post('/', verificarAutenticacao, setEmpresaContext, contaReceberController.criar);

/**
 * @route   GET /api/contas-receber
 * @desc    Listar todas as contas a receber
 */
router.get('/', verificarAutenticacao, setEmpresaContext, contaReceberController.listarTodos);

/**
 * @route   GET /api/contas-receber/:id
 * @desc    Buscar conta por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, contaReceberController.buscarPorId);

/**
 * @route   PUT /api/contas-receber/:id
 * @desc    Atualizar dados da conta (antes do pagamento)
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, contaReceberController.atualizar);

/**
 * @route   POST /api/contas-receber/:id/pagar
 * @desc    Registrar pagamento (lançado automaticamente no caixa)
 */
router.post('/:id/pagar', verificarAutenticacao, setEmpresaContext, contaReceberController.registrarPagamento);

/**
 * @route   PATCH /api/contas-receber/:id/cancelar
 * @desc    Cancelar uma conta a receber
 */
router.patch('/:id/cancelar', verificarAutenticacao, setEmpresaContext, contaReceberController.cancelar);

/**
 * @route   PATCH /api/contas-receber/atualizar-vencidas
 * @desc    Atualizar status das contas vencidas
 */
router.patch('/atualizar-vencidas', verificarAutenticacao, setEmpresaContext, contaReceberController.atualizarVencidas);

module.exports = router;
