const express = require('express');
const router = express.Router();
const contaPagarController = require('../controllers/contaPagarController');

/**
 * @route   POST /api/contas-pagar
 * @desc    Criar nova conta a pagar
 */
router.post('/', contaPagarController.criar);

/**
 * @route   POST /api/contas-pagar/parcelado
 * @desc    Criar conta parcelada
 */
router.post('/parcelado', contaPagarController.criarParcelado);

/**
 * @route   GET /api/contas-pagar
 * @desc    Listar todas as contas a pagar
 */
router.get('/', contaPagarController.listarTodos);

/**
 * @route   GET /api/contas-pagar/relatorio-totais
 * @desc    Relatório de totais por categoria
 */
router.get('/relatorio-totais', contaPagarController.relatorioTotais);

/**
 * @route   GET /api/contas-pagar/categoria/:categoria
 * @desc    Buscar contas por categoria
 */
router.get('/categoria/:categoria', contaPagarController.buscarPorCategoria);

/**
 * @route   GET /api/contas-pagar/:id
 * @desc    Buscar conta por ID
 */
router.get('/:id', contaPagarController.buscarPorId);

/**
 * @route   PUT /api/contas-pagar/:id
 * @desc    Atualizar conta
 */
router.put('/:id', contaPagarController.atualizar);

/**
 * @route   POST /api/contas-pagar/:id/pagar
 * @desc    Registrar pagamento
 */
router.post('/:id/pagar', contaPagarController.registrarPagamento);

/**
 * @route   PATCH /api/contas-pagar/:id/cancelar
 * @desc    Cancelar conta
 */
router.patch('/:id/cancelar', contaPagarController.cancelar);

/**
 * @route   DELETE /api/contas-pagar/:id
 * @desc    Deletar conta
 */
router.delete('/:id', contaPagarController.deletar);

/**
 * @route   PATCH /api/contas-pagar/atualizar-vencidas
 * @desc    Atualizar status de contas vencidas
 */
router.patch('/atualizar-vencidas', contaPagarController.atualizarVencidas);

module.exports = router;