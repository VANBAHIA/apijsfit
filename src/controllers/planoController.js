const planoService = require('../services/planoService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class PlanoController {
  criar = asyncHandler(async (req, res) => {
    const plano = await planoService.criar(req.body);

    res.status(201).json(
      new ApiResponse(201, plano, 'Plano criado com sucesso')
    );
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { status, skip, take } = req.query;

    const resultado = await planoService.buscarTodos({
      status,
      skip,
      take,
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Planos listados com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const plano = await planoService.buscarPorId(req.params.id);

    res.status(200).json(
      new ApiResponse(200, plano, 'Plano encontrado')
    );
  });

  atualizar = asyncHandler(async (req, res) => {
    const plano = await planoService.atualizar(req.params.id, req.body);

    res.status(200).json(
      new ApiResponse(200, plano, 'Plano atualizado com sucesso')
    );
  });

  deletar = asyncHandler(async (req, res) => {
    await planoService.deletar(req.params.id);

    res.status(200).json(
      new ApiResponse(200, null, 'Plano deletado com sucesso')
    );
  });
}

module.exports = new PlanoController();