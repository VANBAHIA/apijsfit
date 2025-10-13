const matriculaService = require('../services/matriculaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class MatriculaController {
  /**
   * ✅ ATUALIZADO: Criar matrícula (agora retorna também a primeira cobrança)
   */
  criar = asyncHandler(async (req, res) => {
    const resultado = await matriculaService.criar(req.body);
    
    res.status(201).json(
      new ApiResponse(
        201, 
        resultado, 
        'Matrícula criada com sucesso e primeira cobrança gerada'
      )
    );
  });

  listarTodos = asyncHandler(async (req, res) => {
    const { situacao, alunoId, page, limit } = req.query;
    const resultado = await matriculaService.listarTodos({
      situacao,
      alunoId,
      skip: page ? (Number(page) - 1) * Number(limit || 10) : 0,
      take: limit
    });
    res.status(200).json(
      new ApiResponse(200, resultado, 'Matrículas listadas com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const matricula = await matriculaService.buscarPorId(req.params.id);
    res.status(200).json(
      new ApiResponse(200, matricula, 'Matrícula encontrada')
    );
  });

  atualizar = asyncHandler(async (req, res) => {
    const matricula = await matriculaService.atualizar(req.params.id, req.body);
    res.status(200).json(
      new ApiResponse(200, matricula, 'Matrícula atualizada com sucesso')
    );
  });

  inativar = asyncHandler(async (req, res) => {
    const { motivo } = req.body;
    const matricula = await matriculaService.inativar(req.params.id, motivo);
    res.status(200).json(
      new ApiResponse(200, matricula, 'Matrícula inativada com sucesso')
    );
  });

  reativar = asyncHandler(async (req, res) => {
    const matricula = await matriculaService.reativar(req.params.id);
    res.status(200).json(
      new ApiResponse(200, matricula, 'Matrícula reativada com sucesso')
    );
  });

  deletar = asyncHandler(async (req, res) => {
    await matriculaService.deletar(req.params.id);
    res.status(200).json(
      new ApiResponse(200, null, 'Matrícula deletada com sucesso')
    );
  });
}

module.exports = new MatriculaController();