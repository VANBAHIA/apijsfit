const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

/**
 * @route   POST /api/jobs/gerar-cobrancas
 * @desc    Executa manualmente o job de geração de cobranças
 * @access  Admin (adicionar autenticação depois)
 */
router.post('/gerar-cobrancas', jobController.executarGeracaoCobrancas);

module.exports = router;