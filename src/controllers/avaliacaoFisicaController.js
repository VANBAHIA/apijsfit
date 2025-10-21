// src/controllers/avaliacaoFisicaController.js
const avaliacaoFisicaService = require('../services/avaliacaoFisicaService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class AvaliacaoFisicaController {
  
  /**
   * Criar nova avaliação física
   * @route POST /api/avaliacoes-fisicas
   */
  async criar(req, res) {
    try {
      const dados = req.body;
      const empresaId = req.empresaId;

      console.log('📋 Controller recebeu:', {
        empresaId,
        alunoId: dados.alunoId,
        peso: dados.peso,
        altura: dados.altura
      });

      if (!empresaId) {
        throw new ApiError(401, 'Usuário não autenticado ou empresaId ausente');
      }

      const avaliacao = await avaliacaoFisicaService.criar(dados, empresaId);

      res.status(201).json(
        new ApiResponse(201, avaliacao, 'Avaliação física criada com sucesso')
      );
    } catch (error) {
      console.error('❌ Erro ao criar avaliação física:', error);
      
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao criar avaliação física',
        error: error.message
      });
    }
  }

  /**
   * Listar todas as avaliações físicas
   * @route GET /api/avaliacoes-fisicas
   */
  async listarTodos(req, res) {
    try {
      const { alunoId, dataInicio, dataFim, status, page, limit } = req.query;
      const empresaId = req.empresaId;

      const resultado = await avaliacaoFisicaService.listarTodos({
        empresaId,
        alunoId,
        dataInicio,
        dataFim,
        status,
        skip: page ? (Number(page) - 1) * Number(limit || 10) : 0,
        take: limit ? Number(limit) : 10
      });

      res.status(200).json(
        new ApiResponse(200, resultado, 'Avaliações físicas listadas com sucesso')
      );
    } catch (error) {
      console.error('❌ Erro ao listar avaliações:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao listar avaliações físicas',
        error: error.message
      });
    }
  }

  /**
   * Buscar avaliação física por ID
   * @route GET /api/avaliacoes-fisicas/:id
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const avaliacao = await avaliacaoFisicaService.buscarPorId(id, empresaId);

      res.status(200).json(
        new ApiResponse(200, avaliacao, 'Avaliação física encontrada')
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao buscar avaliação física',
        error: error.message
      });
    }
  }

  /**
   * Buscar histórico de avaliações de um aluno
   * @route GET /api/avaliacoes-fisicas/aluno/:alunoId
   */
  async buscarPorAluno(req, res) {
    try {
      const { alunoId } = req.params;
      const empresaId = req.empresaId;

      const avaliacoes = await avaliacaoFisicaService.buscarPorAluno(alunoId, empresaId);

      res.status(200).json(
        new ApiResponse(200, avaliacoes, 'Histórico de avaliações do aluno')
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico',
        error: error.message
      });
    }
  }

  /**
   * Atualizar avaliação física
   * @route PUT /api/avaliacoes-fisicas/:id
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const empresaId = req.empresaId;

      const avaliacao = await avaliacaoFisicaService.atualizar(id, dados, empresaId);

      res.status(200).json(
        new ApiResponse(200, avaliacao, 'Avaliação física atualizada com sucesso')
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar avaliação física',
        error: error.message
      });
    }
  }

  /**
   * Deletar avaliação física
   * @route DELETE /api/avaliacoes-fisicas/:id
   */
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      await avaliacaoFisicaService.deletar(id, empresaId);

      res.status(200).json(
        new ApiResponse(200, null, 'Avaliação física deletada com sucesso')
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao deletar avaliação física',
        error: error.message
      });
    }
  }

  /**
   * Buscar evolução do aluno
   * @route GET /api/avaliacoes-fisicas/aluno/:alunoId/evolucao
   */
  async buscarEvolucao(req, res) {
    try {
      const { alunoId } = req.params;
      const empresaId = req.empresaId;
      
      // Parâmetros opcionais para filtrar quais dados exibir na evolução
      const parametros = req.query.parametros 
        ? req.query.parametros.split(',')
        : ['peso', 'imc', 'percentualGordura', 'massaMagra', 'massaGorda'];

      const evolucao = await avaliacaoFisicaService.buscarEvolucao(
        alunoId, 
        empresaId, 
        parametros
      );

      res.status(200).json(
        new ApiResponse(200, evolucao, 'Evolução do aluno')
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao buscar evolução',
        error: error.message
      });
    }
  }

  /**
   * Comparar duas avaliações
   * @route GET /api/avaliacoes-fisicas/comparar/:avaliacaoAnteriorId/:avaliacaoAtualId
   */
  async compararAvaliacoes(req, res) {
    try {
      const { avaliacaoAnteriorId, avaliacaoAtualId } = req.params;
      const empresaId = req.empresaId;

      const comparacao = await avaliacaoFisicaService.compararAvaliacoes(
        avaliacaoAnteriorId,
        avaliacaoAtualId,
        empresaId
      );

      res.status(200).json(
        new ApiResponse(200, comparacao, 'Comparação de avaliações')
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao comparar avaliações',
        error: error.message
      });
    }
  }
}

module.exports = new AvaliacaoFisicaController();