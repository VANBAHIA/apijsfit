const alunoService = require('../services/alunoService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
// alunoController.js
const avaliacaoFisicaService = require('../services/avaliacaoFisicaService');


class AlunoController {

// alunoController.js - método criarComPessoa
async criarComPessoa(req, res) {
  const dadosCompletos = req.body;
  const empresaId = req.empresaId;

  try {
    if (!dadosCompletos.pessoa || !dadosCompletos.aluno) {
      throw new ApiError(400, 'Dados da pessoa e do aluno são obrigatórios');
    }

    if (!empresaId) {
      throw new ApiError(401, 'Usuário não autenticado ou empresaId ausente');
    }

    const aluno = await alunoService.criarComPessoa(dadosCompletos, empresaId);

    // 🧍‍♂️ SALVAR AVALIAÇÃO FÍSICA INICIAL
    if (dadosCompletos.avaliacaoFisica) {
      const payloadAvaliacao = {
        ...dadosCompletos.avaliacaoFisica,
        alunoId: aluno.id,
        empresaId
      };

      try {
        // ✅ CORREÇÃO: passar os 3 parâmetros na ordem correta
        const avaliacao = await avaliacaoFisicaService.criar(
          payloadAvaliacao,  // dados
          aluno.id,          // alunoId
          empresaId          // empresaId
        );

        aluno.avaliacaoFisica = avaliacao;
        console.log('✅ Avaliação física inicial criada:', avaliacao?.id);
      } catch (error) {
        console.error('⚠️ Erro ao salvar avaliação física inicial:', error.message);
      }
    }

    return res
      .status(201)
      .json(new ApiResponse(201, aluno, 'Aluno criado com sucesso'));

  } catch (error) {
    console.error('❌ Erro em criarComPessoa:', error.stack || error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
}

// alunoController.js - método atualizarComPessoa
async atualizarComPessoa(req, res) {
  const dadosCompletos = req.body;
  const empresaId = req.empresaId;
  const { id } = req.params;

  try {
    const alunoAtualizado = await alunoService.atualizarComPessoa(id, dadosCompletos, empresaId);
    const alunoId = alunoAtualizado?.id || id;

    if (!alunoId) {
      throw new ApiError(500, 'alunoId ausente após atualização');
    }

    if (dadosCompletos.avaliacaoFisica) {
      const payloadAvaliacao = {
        ...dadosCompletos.avaliacaoFisica,
        alunoId,
        empresaId
      };

      try {
        let avaliacao;

        if (payloadAvaliacao.id) {
          // 🔁 Atualiza avaliação existente
          avaliacao = await avaliacaoFisicaService.atualizar(
            payloadAvaliacao.id,
            payloadAvaliacao,
            empresaId
          );
          console.log('🔄 Avaliação atualizada:', avaliacao?.id);
        } else {
          // ✅ CORREÇÃO: passar os 3 parâmetros corretos
          avaliacao = await avaliacaoFisicaService.criar(
            payloadAvaliacao,  // dados
            alunoId,           // alunoId
            empresaId          // empresaId
          );
          console.log('➕ Avaliação física criada:', avaliacao?.id);
        }

        alunoAtualizado.avaliacaoFisica = avaliacao;
      } catch (error) {
        console.error('⚠️ Erro ao salvar/atualizar avaliação física:', error.message);
        // Não lança erro para não impedir a atualização do aluno
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, alunoAtualizado, 'Aluno atualizado com sucesso'));

  } catch (error) {
    console.error('❌ Erro em atualizarComPessoa:', error.stack || error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, null, error.message));
  }
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
