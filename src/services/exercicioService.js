const exercicioRepository = require('../repositories/exercicioRepository');
const grupoExercicioRepository = require('../repositories/grupoExercicioRepository');
const ApiError = require('../utils/apiError');

class ExercicioService {
  async criar(dados, empresaId) {
    const { nome, descricao, musculos, grupoId, imagemUrl } = dados;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    if (!nome || nome.trim().length < 3) {
      throw new ApiError(400, 'Nome do exercício é obrigatório e deve ter pelo menos 3 caracteres');
    }

    // musculos deve ser array (se o cliente enviar string, convertemos)
    let musculosFinal = musculos;
    if (!musculosFinal) musculosFinal = [];
    else if (!Array.isArray(musculosFinal)) {
      // permitir envio "Peito,Triceps" -> transformar em array
      if (typeof musculosFinal === 'string') {
        musculosFinal = musculosFinal.split(',').map(m => m.trim()).filter(Boolean);
      } else {
        throw new ApiError(400, 'musculos deve ser um array de strings ou uma string separada por vírgula');
      }
    }

    try {
      // Se informar grupoId, validar existência e associação com a mesma empresa
      if (grupoId) {
        const grupo = await grupoExercicioRepository.buscarPorId(grupoId, empresaId);
        if (!grupo) {
          throw new ApiError(400, 'Grupo de exercício informado não existe ou não pertence a esta empresa');
        }
      }

      const payload = {
        nome: nome.trim().toUpperCase(),
        descricao: descricao ? descricao.trim() : null,
        musculos: musculosFinal,
        empresaId,
        grupoId: grupoId || null,
        imagemUrl: imagemUrl || null
      };

      const exercicio = await exercicioRepository.criar(payload);

      return exercicio;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('❌ Erro ao criar exercício:', error);
      throw new ApiError(500, `Erro ao criar exercício: ${error.message}`);
    }
  }

  async listarTodos({ page = 1, limit = 50, busca, empresaId, grupoId } = {}) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const skip = (Number(page) - 1) * Number(limit);

    try {
      const resultado = await exercicioRepository.buscarTodos({
        skip,
        take: Number(limit),
        empresaId,
        busca,
        grupoId
      });

      return {
        data: resultado.exercicios,
        pagination: {
          total: resultado.total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(resultado.total / Number(limit) || 1)
        }
      };
    } catch (error) {
      console.error('❌ Erro ao listar exercícios:', error);
      throw new ApiError(500, `Erro ao listar exercícios: ${error.message}`);
    }
  }

  async buscarPorId(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const exercicio = await exercicioRepository.buscarPorId(id, empresaId);
    if (!exercicio) throw new ApiError(404, 'Exercício não encontrado');

    return exercicio;
  }

  async atualizar(id, dados, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const exercicioExistente = await exercicioRepository.buscarPorId(id, empresaId);
    if (!exercicioExistente) throw new ApiError(404, 'Exercício não encontrado');

    // Se tentar atualizar grupoId, validar
    if (dados.grupoId) {
      const grupo = await grupoExercicioRepository.buscarPorId(dados.grupoId, empresaId);
      if (!grupo) throw new ApiError(400, 'Grupo de exercício informado não existe ou não pertence a esta empresa');
    }

    // Normalizar musculos se enviado
    if (dados.musculos && !Array.isArray(dados.musculos)) {
      if (typeof dados.musculos === 'string') {
        dados.musculos = dados.musculos.split(',').map(m => m.trim()).filter(Boolean);
      } else {
        throw new ApiError(400, 'musculos deve ser um array de strings ou uma string separada por vírgula');
      }
    }

    // Uppercase nome
    if (dados.nome) dados.nome = dados.nome.trim().toUpperCase();
    if (dados.descricao === '') dados.descricao = null;

    try {
      const atualizado = await exercicioRepository.atualizar(id, dados, empresaId);
      if (!atualizado) throw new ApiError(500, 'Falha ao atualizar exercício');
      return atualizado;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('❌ Erro ao atualizar exercício:', error);
      throw new ApiError(500, `Erro ao atualizar exercício: ${error.message}`);
    }
  }

  async deletar(id, empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const exercicioExistente = await exercicioRepository.buscarPorId(id, empresaId);
    if (!exercicioExistente) throw new ApiError(404, 'Exercício não encontrado');

    try {
      const deletedCount = await exercicioRepository.deletar(id, empresaId);
      if (deletedCount === 0) throw new ApiError(500, 'Falha ao deletar exercício');
      return { message: 'Exercício deletado com sucesso' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('❌ Erro ao deletar exercício:', error);
      throw new ApiError(500, `Erro ao deletar exercício: ${error.message}`);
    }
  }
}

module.exports = new ExercicioService();
