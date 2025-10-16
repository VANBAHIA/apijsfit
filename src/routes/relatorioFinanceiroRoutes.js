// src/routes/relatorioFinanceiroRoutes.js
const express = require('express');
const router = express.Router();
const relatorioFinanceiroService = require('../services/relatorioFinanceiroService');

/**
 * ✅ GET /relatorios/financeiro/resumo
 * Retorna resumo financeiro (receitas, despesas, saldo) por período
 */
router.get('/resumo', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    // Validação
    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'dataInicio e dataFim são obrigatórios'
      });
    }

    const resultado = await relatorioFinanceiroService.resumoFinanceiro(dataInicio, dataFim);

    return res.json({
      statusCode: 200,
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro em /resumo:', error);
    res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || 'Erro ao gerar resumo financeiro'
    });
  }
});

/**
 * ✅ GET /relatorios/financeiro/receitas-forma
 * Receitas agrupadas por forma de pagamento
 */
router.get('/receitas-forma', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'dataInicio e dataFim são obrigatórios'
      });
    }

    const resultado = await relatorioFinanceiroService.receitasPorFormaPagamento(dataInicio, dataFim);

    return res.json({
      statusCode: 200,
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro em /receitas-forma:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Erro ao buscar receitas por forma'
    });
  }
});

/**
 * ✅ GET /relatorios/financeiro/despesas-categoria
 * Despesas agrupadas por categoria
 */
router.get('/despesas-categoria', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'dataInicio e dataFim são obrigatórios'
      });
    }

    const resultado = await relatorioFinanceiroService.despesasPorCategoria(dataInicio, dataFim);

    return res.json({
      statusCode: 200,
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro em /despesas-categoria:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Erro ao buscar despesas por categoria'
    });
  }
});

/**
 * ✅ GET /relatorios/financeiro/evolucao
 * Evolução diária de receitas vs despesas
 */
router.get('/evolucao', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: 'dataInicio e dataFim são obrigatórios'
      });
    }

    const resultado = await relatorioFinanceiroService.evolucaoDiaria(dataInicio, dataFim);

    return res.json({
      statusCode: 200,
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro em /evolucao:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Erro ao buscar evolução diária'
    });
  }
});

/**
 * ✅ GET /relatorios/financeiro/vencidas
 * Contas vencidas (receitas e despesas)
 */
router.get('/vencidas', async (req, res) => {
  try {
    const resultado = await relatorioFinanceiroService.contasVencidas();

    return res.json({
      statusCode: 200,
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('❌ Erro em /vencidas:', error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || 'Erro ao buscar contas vencidas'
    });
  }
});

module.exports = router;