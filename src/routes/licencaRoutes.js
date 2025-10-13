const express = require('express');
const router = express.Router();
const licencaController = require('../controllers/licencaController');

/**
 * @route   POST /api/licencas
 * @desc    Criar nova licença
 * @access  Public
 */
router.post('/', licencaController.criar);

/**
 * @route   GET /api/licencas
 * @desc    Listar todas as licenças com paginação
 * @access  Public
 */
router.get('/', licencaController.buscarTodos);

/**
 * @route   GET /api/licencas/gerar-chave
 * @desc    Gerar chave única de licença
 * @access  Public
 */
router.get('/gerar-chave', licencaController.gerarChave);

/**
 * @route   POST /api/licencas/validar
 * @desc    Validar chave de licença
 * @access  Public
 */
router.post('/validar', licencaController.validarLicenca);

/**
 * @route   GET /api/licencas/chave/:chave
 * @desc    Buscar licença por chave
 * @access  Public
 */
router.get('/chave/:chave', licencaController.buscarPorChave);

/**
 * @route   GET /api/licencas/:id
 * @desc    Buscar licença por ID
 * @access  Public
 */
router.get('/:id', licencaController.buscarPorId);

/**
 * @route   PUT /api/licencas/:id
 * @desc    Atualizar licença
 * @access  Public
 */
router.put('/:id', licencaController.atualizar);

/**
 * @route   PATCH /api/licencas/:id/renovar
 * @desc    Renovar licença
 * @access  Public
 */
router.patch('/:id/renovar', licencaController.renovar);

/**
 * @route   PATCH /api/licencas/:id/cancelar
 * @desc    Cancelar licença
 * @access  Public
 */
router.patch('/:id/cancelar', licencaController.cancelar);

/**
 * @route   PATCH /api/licencas/:id/suspender
 * @desc    Suspender licença
 * @access  Public
 */
router.patch('/:id/suspender', licencaController.suspender);

/**
 * @route   PATCH /api/licencas/:id/reativar
 * @desc    Reativar licença
 * @access  Public
 */
router.patch('/:id/reativar', licencaController.reativar);

module.exports = router;