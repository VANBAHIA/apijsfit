const frequenciaService = require('../services/frequenciaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class FrequenciaController {
  /**
   * Registra uma nova frequência
   * @route POST /api/frequencias
   */
  registrar = asyncHandler(async (req, res) => {
    const dados = req.body;

    // Validação básica
    if (!dados.alunoId || !dados.data || !dados.horarioInicio) {
      throw new ApiError(400, 'AlunoId, data e horarioInicio são obrigatórios');
    }

    const frequencia = await frequenciaService.registrar(dados);

    res.status(201).json(
      new ApiResponse(201, frequencia, 'Frequência registrada com sucesso')
    );
  });

  /**
   * Registra presença via senha
   * @route POST /api/frequencias/registrar-presenca
   */
  registrarPresenca = asyncHandler(async (req, res) => {
    const { alunoId, senha } = req.body;

    if (!alunoId || !senha) {
      throw new ApiError(400, 'AlunoId e senha são obrigatórios');
    }

    const frequencia = await frequenciaService.registrarPresencaPorSenha(alunoId, senha);

    res.status(201).json(
      new ApiResponse(201, frequencia, 'Presença registrada com sucesso')
    );
  });

  /**
   * Lista todas as frequências com filtros
   * @route GET /api/frequencias
   */
  listarTodos = asyncHandler(async (req, res) => {
    const filtros = req.query;

    const resultado = await frequenciaService.listarTodos(filtros);

    res.status(200).json(
      new ApiResponse(200, resultado, 'Frequências listadas com sucesso')
    );
  });

  /**
   * Busca uma frequência por ID
   * @route GET /api/frequencias/:id
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const frequencia = await frequenciaService.buscarPorId(id);

    res.status(200).json(
      new ApiResponse(200, frequencia, 'Frequência encontrada')
    );
  });

  /**
   * Atualiza uma frequência
   * @route PUT /api/frequencias/:id
   */
  atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dados = req.body;

    const frequencia = await frequenciaService.atualizar(id, dados);

    res.status(200).json(
      new ApiResponse(200, frequencia, 'Frequência atualizada com sucesso')
    );
  });

  /**
   * Deleta uma frequência
   * @route DELETE /api/frequencias/:id
   */
  deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await frequenciaService.deletar(id);

    res.status(200).json(
      new ApiResponse(200, null, 'Frequência deletada com sucesso')
    );
  });

  /**
   * Busca estatísticas de frequência de um aluno
   * @route GET /api/frequencias/aluno/:alunoId/estatisticas
   */
  buscarEstatisticas = asyncHandler(async (req, res) => {
    const { alunoId } = req.params;
    const { dataInicio, dataFim } = req.query;

    const estatisticas = await frequenciaService.buscarEstatisticas(
      alunoId,
      dataInicio,
      dataFim
    );

    res.status(200).json(
      new ApiResponse(200, estatisticas, 'Estatísticas obtidas com sucesso')
    );
  });

  /**
   * Gera relatório de frequência
   * @route GET /api/frequencias/relatorio
   */
  gerarRelatorio = asyncHandler(async (req, res) => {
    const { dataInicio, dataFim, alunoIds } = req.query;

    const relatorio = await frequenciaService.gerarRelatorio({
      dataInicio,
      dataFim,
      alunoIds: alunoIds ? alunoIds.split(',') : undefined,
    });

    res.status(200).json(
      new ApiResponse(200, relatorio, 'Relatório gerado com sucesso')
    );
  });
}

module.exports = new FrequenciaController();