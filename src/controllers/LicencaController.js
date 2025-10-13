const licencaService = require('../services/licencaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class LicencaController {
  criar = asyncHandler(async (req, res) => {
    const dados = req.body;

    const licenca = await licencaService.criar(dados);

    res.status(201).json(
      new ApiResponse(201, licenca, 'Licença criada com sucesso')
    );
  });

  buscarTodos = asyncHandler(async (req, res) => {
    const { empresaId, situacao, page, limit } = req.query;

    const skip = page ? (Number(page) - 1) * Number(limit || 10) : 0;
    const take = limit ? Number(limit) : 10;

    const resultado = await licencaService.buscarTodos({
      empresaId,
      situacao,
      skip,
      take
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Licenças listadas com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const licenca = await licencaService.buscarPorId(req.params.id);

    res.status(200).json(
      new ApiResponse(200, licenca, 'Licença encontrada')
    );
  });

  buscarPorChave = asyncHandler(async (req, res) => {
    const { chave } = req.params;

    const licenca = await licencaService.buscarPorChave(chave);

    res.status(200).json(
      new ApiResponse(200, licenca, 'Licença encontrada')
    );
  });

  validarLicenca = asyncHandler(async (req, res) => {
    const { chave } = req.body;

    if (!chave) {
      throw new ApiError(400, 'Chave é obrigatória');
    }

    const resultado = await licencaService.validarLicenca(chave);

    res.status(200).json(
      new ApiResponse(200, resultado, 'Validação realizada')
    );
  });

  atualizar = asyncHandler(async (req, res) => {
    const dados = req.body;

    const licenca = await licencaService.atualizar(req.params.id, dados);

    res.status(200).json(
      new ApiResponse(200, licenca, 'Licença atualizada com sucesso')
    );
  });

  renovar = asyncHandler(async (req, res) => {
    const { tipo } = req.body;

    if (!tipo) {
      throw new ApiError(400, 'Tipo de renovação é obrigatório');
    }

    const licenca = await licencaService.renovar(req.params.id, tipo);

    res.status(200).json(
      new ApiResponse(200, licenca, 'Licença renovada com sucesso')
    );
  });

  cancelar = asyncHandler(async (req, res) => {
    const { motivo } = req.body;

    const licenca = await licencaService.cancelar(req.params.id, motivo);

    res.status(200).json(
      new ApiResponse(200, licenca, 'Licença cancelada com sucesso')
    );
  });

  suspender = asyncHandler(async (req, res) => {
    const { motivo } = req.body;

    const licenca = await licencaService.suspender(req.params.id, motivo);

    res.status(200).json(
      new ApiResponse(200, licenca, 'Licença suspensa com sucesso')
    );
  });

  reativar = asyncHandler(async (req, res) => {
    const licenca = await licencaService.reativar(req.params.id);

    res.status(200).json(
      new ApiResponse(200, licenca, 'Licença reativada com sucesso')
    );
  });

  gerarChave = asyncHandler(async (req, res) => {
    const chave = licencaService.gerarChave();

    res.status(200).json(
      new ApiResponse(200, { chave }, 'Chave gerada com sucesso')
    );
  });
}

module.exports = new LicencaController();