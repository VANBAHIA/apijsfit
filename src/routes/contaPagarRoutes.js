// src/routes/contaPagarRoutes.js
const express = require('express');
const router = express.Router();
const contaPagarController = require('../controllers/contaPagarController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/contas-pagar
 * @desc    Criar nova conta a pagar
 */
router.post('/', verificarAutenticacao, setEmpresaContext, contaPagarController.criar);

/**
 * @route   POST /api/contas-pagar/parcelado
 * @desc    Criar contas a pagar parceladas
 */
router.post('/parcelado', verificarAutenticacao, setEmpresaContext, contaPagarController.criarParcelado);

/**
 * @route   GET /api/contas-pagar
 * @desc    Listar todas as contas a pagar
 */
router.get('/', verificarAutenticacao, setEmpresaContext, contaPagarController.listarTodos);

/**
 * @route   GET /api/contas-pagar/relatorio-totais
 * @desc    Obter relatório de totais por categoria
 */
router.get('/relatorio-totais', verificarAutenticacao, setEmpresaContext, contaPagarController.relatorioTotais);

/**
 * @route   GET /api/contas-pagar/categoria/:categoria
 * @desc    Buscar contas por categoria
 */
router.get('/categoria/:categoria', verificarAutenticacao, setEmpresaContext, contaPagarController.buscarPorCategoria);

/**
 * @route   GET /api/contas-pagar/:id
 * @desc    Buscar conta por ID
 */
router.get('/:id', verificarAutenticacao, setEmpresaContext, contaPagarController.buscarPorId);

/**
 * @route   PUT /api/contas-pagar/:id
 * @desc    Atualizar conta a pagar
 */
router.put('/:id', verificarAutenticacao, setEmpresaContext, contaPagarController.atualizar);

/**
 * @route   POST /api/contas-pagar/:id/pagar
 * @desc    Registrar pagamento (movimenta o caixa)
 */
router.post('/:id/pagar', verificarAutenticacao, setEmpresaContext, contaPagarController.registrarPagamento);

/**
 * @route   PATCH /api/contas-pagar/:id/cancelar
 * @desc    Cancelar uma conta a pagar
 */
router.patch('/:id/cancelar', verificarAutenticacao, setEmpresaContext, contaPagarController.cancelar);

/**
 * @route   DELETE /api/contas-pagar/:id
 * @desc    Excluir conta (somente se não estiver paga)
 */
router.delete('/:id', verificarAutenticacao, setEmpresaContext, contaPagarController.deletar);

/**
 * @route   PATCH /api/contas-pagar/atualizar-vencidas
 * @desc    Atualizar status das contas vencidas
 */
router.patch('/atualizar-vencidas', verificarAutenticacao, setEmpresaContext, contaPagarController.atualizarVencidas);

module.exports = router;
