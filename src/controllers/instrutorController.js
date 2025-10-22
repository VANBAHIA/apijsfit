// src/controllers/instrutorController.js
const instrutorService = require('../services/instrutorService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class InstrutorController {
  /**
   * Criar novo instrutor
   * @route POST /api/instrutores
   */
  async criar(req, res) {
    try {
      const dados = req.body;
      const empresaId = req.empresaId;

      console.log('📋 Controller recebeu:', {
        empresaId,
        funcionarioId: dados.funcionarioId
      });

      if (!empresaId) {
        throw new ApiError(401, 'Usuário não autenticado ou empresaId ausente');
      }

      const instrutor = await instrutorService.criar({
        funcionarioId: dados.funcionarioId,
        empresaId
      });

      res.status(201).json(
        new ApiResponse(201, instrutor, 'Instrutor criado com sucesso')
      );
    } catch (error) {
      console.error('❌ Erro ao criar instrutor:', error);

      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao criar instrutor',
        error: error.message
      });
    }
  }

  /**
   * Listar todos os instrutores
   * @route GET /api/instrutores
   */
  async listarTodos(req, res) {
    try {
      const { page, limit, situacao, busca } = req.query;
      const empresaId = req.empresaId;

      const resultado = await instrutorService.listarTodos({
        empresaId,
        page,
        limit,
        situacao,
        busca
      });

      res.status(200).json(
        new ApiResponse(200, resultado, 'Instrutores listados com sucesso')
      );
    } catch (error) {
      console.error('❌ Erro ao listar instrutores:', error);

      res.status(500).json({
        success: false,
        message: 'Erro ao listar instrutores',
        error: error.message
      });
    }
  }

  /**
   * Listar instrutores ativos
   * @route GET /api/instrutores/ativos
   */
  async listarAtivos(req, res) {
    try {
      const empresaId = req.empresaId;

      const resultado = await instrutorService.listarAtivos(empresaId);

      res.status(200).json(
        new ApiResponse(200, resultado, 'Instrutores ativos listados com sucesso')
      );
    } catch (error) {
      console.error('❌ Erro ao listar instrutores ativos:', error);

      res.status(500).json({
        success: false,
        message: 'Erro ao listar instrutores ativos',
        error: error.message
      });
    }
  }

  /**
   * Buscar instrutor por ID
   * @route GET /api/instrutores/:id
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      const instrutor = await instrutorService.buscarPorId(id, empresaId);

      res.status(200).json(
        new ApiResponse(200, instrutor, 'Instrutor encontrado')
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
        message: 'Erro ao buscar instrutor',
        error: error.message
      });
    }
  }

  /**
   * Buscar instrutor por funcionarioId
   * @route GET /api/instrutores/funcionario/:funcionarioId
   */
  async buscarPorFuncionarioId(req, res) {
    try {
      const { funcionarioId } = req.params;
      const empresaId = req.empresaId;

      const instrutor = await instrutorService.buscarPorFuncionarioId(
        funcionarioId,
        empresaId
      );

      res.status(200).json(
        new ApiResponse(200, instrutor, 'Instrutor encontrado')
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
        message: 'Erro ao buscar instrutor',
        error: error.message
      });
    }
  }

  /**
   * Atualizar instrutor
   * @route PUT /api/instrutores/:id
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dados = req.body;
      const empresaId = req.empresaId;

      const instrutor = await instrutorService.atualizar(id, dados, empresaId);

      res.status(200).json(
        new ApiResponse(200, instrutor, 'Instrutor atualizado com sucesso')
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
        message: 'Erro ao atualizar instrutor',
        error: error.message
      });
    }
  }

  /**
   * Deletar instrutor
   * @route DELETE /api/instrutores/:id
   */
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const empresaId = req.empresaId;

      await instrutorService.deletar(id, empresaId);

      res.status(200).json(
        new ApiResponse(200, null, 'Instrutor deletado com sucesso')
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
        message: 'Erro ao deletar instrutor',
        error: error.message
      });
    }
  }
}

module.exports = new InstrutorController();