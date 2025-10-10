const alunoService = require('../services/alunoService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class AlunoController {
  /**
   * Cria um novo aluno com sua pessoa em transação atômica
   * @route POST /api/alunos
   */
  criarComPessoa = asyncHandler(async (req, res) => {
    const dadosCompletos = req.body;

    // Validação básica da estrutura
    if (!dadosCompletos.pessoa || !dadosCompletos.aluno) {
      throw new ApiError(400, 'Dados da pessoa e do aluno são obrigatórios');
    }

    const aluno = await alunoService.criarComPessoa(dadosCompletos);

    res.status(201).json(
      new ApiResponse(201, aluno, 'Aluno criado com sucesso')
    );
  });

  /**
   * Lista todos os alunos com paginação e filtros
   * @route GET /api/alunos
   */
  listarTodos = asyncHandler(async (req, res) => {
    const { situacao, page, limit, busca } = req.query;

    const resultado = await alunoService.listarTodos({
      situacao,
      page,
      limit,
      busca,
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Alunos listados com sucesso')
    );
  });

  /**
   * Busca um aluno por ID
   * @route GET /api/alunos/:id
   */
  buscarPorId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const aluno = await alunoService.buscarPorId(id);

    res.status(200).json(
      new ApiResponse(200, aluno, 'Aluno encontrado')
    );
  });

  /**
   * Atualiza aluno e pessoa em transação atômica
   * @route PUT /api/alunos/:id
   */
  atualizarComPessoa = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dadosCompletos = req.body;

    const aluno = await alunoService.atualizarComPessoa(id, dadosCompletos);

    res.status(200).json(
      new ApiResponse(200, aluno, 'Aluno atualizado com sucesso')
    );
  });

  /**
   * Deleta um aluno (mantém a pessoa)
   * @route DELETE /api/alunos/:id
   */
  deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await alunoService.deletar(id);

    res.status(200).json(
      new ApiResponse(200, null, 'Aluno deletado com sucesso')
    );
  });

  /**
   * Adiciona um horário ao aluno
   * @route POST /api/alunos/:id/horarios
   */
  adicionarHorario = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const horario = req.body;

    const aluno = await alunoService.adicionarHorario(id, horario);

    res.status(200).json(
      new ApiResponse(200, aluno, 'Horário adicionado com sucesso')
    );
  });

  /**
   * Valida senha de acesso do aluno
   * @route POST /api/alunos/:id/validar-senha
   */
  validarSenha = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;

    if (!senha) {
      throw new ApiError(400, 'Senha é obrigatória');
    }

    const resultado = await alunoService.validarSenha(id, senha);

    res.status(200).json(
      new ApiResponse(200, resultado, 'Senha validada com sucesso')
    );
  });
}

module.exports = new AlunoController();