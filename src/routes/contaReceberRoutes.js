const express = require('express');
const router = express.Router();
const contaReceberController = require('../controllers/contaReceberController');

/**
 * @route   POST /api/contas-receber
 * @desc    Criar nova conta a receber
 */
router.post('/', contaReceberController.criar);

/**
 * @route   GET /api/contas-receber
 * @desc    Listar todas as contas a receber
 */
router.get('/', contaReceberController.listarTodos);

/**
 * @route   GET /api/contas-receber/:id
 * @desc    Buscar conta por ID
 */
router.get('/:id', contaReceberController.buscarPorId);

/**
 * @route   PUT /api/contas-receber/:id
 * @desc    Atualizar conta (antes do pagamento)
 */
router.put('/:id', contaReceberController.atualizar);

/**
 * @route   POST /api/contas-receber/:id/pagar
 * @desc    Registrar pagamento (lança automaticamente no caixa)
 */
router.post('/:id/pagar', contaReceberController.registrarPagamento);

/**
 * @route   PATCH /api/contas-receber/:id/cancelar
 * @desc    Cancelar conta
 */
router.patch('/:id/cancelar', contaReceberController.cancelar);

/**
 * @route   PATCH /api/contas-receber/atualizar-vencidas
 * @desc    Atualizar status de contas vencidas
 */
router.patch('/atualizar-vencidas', contaReceberController.atualizarVencidas);

module.exports = router;