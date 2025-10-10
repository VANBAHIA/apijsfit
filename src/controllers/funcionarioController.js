const funcionarioService = require('../services/funcionarioService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class FuncionarioController {
  /**
   * Cria um novo funcionário com sua pessoa em transação atômica
   * @route POST /api/funcionarios
   */
  criarComPessoa = asyncHandler(async (req, res) => {
    const dadosCompletos = req.body;

    // Validação básica da estrutura
    if (!dadosCompletos.pessoa || !dadosCompletos.funcionario) {
      throw new ApiError(400, 'Dados da pessoa e do funcionário são obrigatórios');
    }

    const funcionario = await funcionarioService.criarComPessoa(dadosCompletos);

    res.status(201).json(
      new ApiResponse(201, funcionario, 'Funcionário criado com sucesso')
    );
  });

  /**
   * Lista todos os funcionários com paginação e filtros
   * @route GET /api/funcionarios
   */
  listarTodos = asyncHandler(async (req, res) => {
    const { situacao, funcao, page, limit, busca } = req.query;

    const resultado = await funcionarioService.listarTodos({
      situacao,
      funcao,
      page,
      limit,
      busca
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Funcionários listados com sucesso')
    );
  });

  /**
   * Busca um funcionário por ID
   * @route GET /api/funcionarios/:id
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const funcionario = await funcionarioService.buscarPorId(id);

    res.status(200).json(
      new ApiResponse(200, funcionario, 'Funcionário encontrado')
    );
  });

  /**
   * Atualiza funcionário e pessoa em transação atômica
   * @route PUT /api/funcionarios/:id
   */
  atualizarComPessoa = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dadosCompletos = req.body;

    const funcionario = await funcionarioService.atualizarComPessoa(id, dadosCompletos);

    res.status(200).json(
      new ApiResponse(200, funcionario, 'Funcionário atualizado com sucesso')
    );
  });

  /**
   * Deleta um funcionário (mantém a pessoa)
   * @route DELETE /api/funcionarios/:id
   */
  deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await funcionarioService.deletar(id);

    res.status(200).json(
      new ApiResponse(200, null, 'Funcionário deletado com sucesso')
    );
  });

  /**
   * Lista apenas instrutores ativos
   * @route GET /api/funcionarios/instrutores/lista
   */
  listarInstrutores = asyncHandler(async (req, res) => {
    const { skip, take } = req.query;

    const resultado = await funcionarioService.listarInstrutores({
      skip,
      take
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Instrutores listados com sucesso')
    );
  });

  /**
   * Demite um funcionário
   * @route PATCH /api/funcionarios/:id/demitir
   */
  demitir = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { dataDemissao } = req.body;

    const funcionario = await funcionarioService.demitir(id, dataDemissao);

    res.status(200).json(
      new ApiResponse(200, funcionario, 'Funcionário demitido com sucesso')
    );
  });

  /**
   * Reativa um funcionário
   * @route PATCH /api/funcionarios/:id/reativar
   */
  reativar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const funcionario = await funcionarioService.reativar(id);

    res.status(200).json(
      new ApiResponse(200, funcionario, 'Funcionário reativado com sucesso')
    );
  });
}

module.exports = new FuncionarioController();