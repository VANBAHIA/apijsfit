const alunoService = require('../services/alunoService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');


class AlunoController {
  async criarComPessoa(req, res) {
    const dadosCompletos = req.body;
    const empresaId = req.empresaId;

    console.log('📋 Controller recebeu:', {
      empresaId,
      pessoaNome: dadosCompletos.pessoa?.nome1,
      alunoSenha: dadosCompletos.aluno?.controleAcesso?.senha ? '***' : 'AUSENTE'
    });

    if (!dadosCompletos.pessoa || !dadosCompletos.aluno) {
      throw new ApiError(400, 'Dados da pessoa e do aluno são obrigatórios');
    }

    if (!empresaId) {
      console.error('❌ ERRO: empresaId ausente no request');
      throw new ApiError(401, 'Usuário não autenticado ou empresaId ausente');
    }

    console.log('✅ Chamando alunoService com:', {
      empresaId,
      pessoaDoc: dadosCompletos.pessoa.doc1
    });

    const aluno = await alunoService.criarComPessoa(dadosCompletos, empresaId);

    res.status(201).json(
      new ApiResponse(201, aluno, 'Aluno criado com sucesso')
    );
  }

  async listarTodos(req, res) {
    const { situacao, page, limit, busca } = req.query;
    const empresaId = req.empresaId;

    const resultado = await alunoService.listarTodos({
      situacao,
      page,
      limit,
      busca,
      empresaId
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Alunos listados com sucesso')
    );
  }

  async buscarPorId(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const aluno = await alunoService.buscarPorId(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, aluno, 'Aluno encontrado')
    );
  }

  async atualizarComPessoa(req, res) {
    const { id } = req.params;
    const dadosCompletos = req.body;
    const empresaId = req.empresaId;

    const aluno = await alunoService.atualizarComPessoa(id, dadosCompletos, empresaId);

    res.status(200).json(
      new ApiResponse(200, aluno, 'Aluno atualizado com sucesso')
    );
  }

  async deletar(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    await alunoService.deletar(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, null, 'Aluno deletado com sucesso')
    );
  }

  async adicionarHorario(req, res) {
    const { id } = req.params;
    const horario = req.body;
    const empresaId = req.empresaId;

    const aluno = await alunoService.adicionarHorario(id, horario, empresaId);

    res.status(200).json(
      new ApiResponse(200, aluno, 'Horário adicionado com sucesso')
    );
  }

  async validarSenha(req, res) {
    const { id } = req.params;
    const { senha } = req.body;
    const empresaId = req.empresaId;

    if (!senha) {
      throw new ApiError(400, 'Senha é obrigatória');
    }

    const resultado = await alunoService.validarSenha(id, senha, empresaId);

    res.status(200).json(
      new ApiResponse(200, resultado, 'Senha validada com sucesso')
    );
  }
}

module.exports = new AlunoController();
 