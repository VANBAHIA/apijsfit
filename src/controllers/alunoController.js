const alunoService = require('../services/alunoService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
// alunoController.js
const avaliacaoFisicaService = require('../services/avaliacaoFisicaService');


class AlunoController {


  async criarComPessoa(req, res) {
    const dadosCompletos = req.body;
    const empresaId = req.empresaId;

    console.log('📋 Controller recebeu:', {
      empresaId,
      pessoaNome: dadosCompletos.pessoa?.nome1,
      alunoSenha: dadosCompletos.aluno?.controleAcesso?.senha ? '***' : 'AUSENTE'
    });

    try {
      // 🔒 Validações iniciais
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

      // 👩‍🎓 Criação do aluno e pessoa
      const aluno = await alunoService.criarComPessoa(dadosCompletos, empresaId);

      // ========================================================================
      // 🧍‍♂️ SALVAR AVALIAÇÃO FÍSICA INICIAL (se enviada)
      // ========================================================================
      if (dadosCompletos.avaliacaoFisica) {
        const payloadAvaliacao = {
          ...dadosCompletos.avaliacaoFisica,
          alunoId: aluno.id,
          empresaId // ✅ agora garantido no payload
        };

        console.log('📌 Payload avaliação física inicial ->', payloadAvaliacao);

        try {
          const avaliacao = await avaliacaoFisicaService.criar(payloadAvaliacao,  empresaId || payloadAvaliacao.empresaId);

          aluno.avaliacaoFisica = avaliacao; // opcional (para retornar junto)
          console.log('✅ Avaliação física inicial criada:', avaliacao?.id || avaliacao);
        } catch (error) {
          console.error('⚠️ Erro ao salvar avaliação física inicial:', error.stack || error);
        }
      }

      // ✅ Resposta final
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
    const dadosCompletos = req.body;
    const empresaId = req.empresaId;
    const { id } = req.params;

    console.log('📋 Controller recebeu:', {
      empresaId,
      pessoaNome: dadosCompletos.pessoa?.nome1,
      alunoSenha: dadosCompletos.aluno?.controleAcesso?.senha ? '***' : 'AUSENTE',
      paramsId: id
    });

    try {
      // 🔄 Atualiza aluno e pessoa
      const alunoAtualizado = await alunoService.atualizarComPessoa(id, dadosCompletos, empresaId);
      console.log('🧩 Body completo recebido no controller:', JSON.stringify(dadosCompletos, null, 2));

      // ✅ Garante que temos o alunoId correto
      const alunoId = alunoAtualizado?.id || id;
      if (!alunoId) {
        console.error('❌ alunoId ausente após atualizarComPessoa:', alunoAtualizado);
        throw new ApiError(500, 'alunoId ausente após atualização');
      }

      // 📊 Se veio avaliação física, cria ou atualiza
      if (dadosCompletos.avaliacaoFisica) {
        const payloadAvaliacao = {
          ...dadosCompletos.avaliacaoFisica,
          alunoId,
          empresaId // ✅ adiciona empresaId obrigatório
        };

        console.log('📌 Payload avaliacaoFisica ->', payloadAvaliacao);

        try {
          let avaliacao;

          if (payloadAvaliacao.id) {
            // 🔁 Atualiza avaliação existente
            avaliacao = await avaliacaoFisicaService.atualizar(
              payloadAvaliacao.id,
              payloadAvaliacao,
              empresaId
            );
            console.log('🔄 Avaliação atualizada:', avaliacao?.id || avaliacao);
          } else {
            // 🆕 Cria nova avaliação física
            avaliacao = await avaliacaoFisicaService.criar(
              payloadAvaliacao,
              empresaId || payloadAvaliacao.empresaId
            );


            console.log('➕ Avaliação física criada:', avaliacao?.id || avaliacao);
          }

          // Anexa ao retorno do aluno
          alunoAtualizado.avaliacaoFisica = avaliacao;
        } catch (error) {
          console.error('⚠️ Erro ao salvar/atualizar avaliação física:', error.stack || error);
        }
      }

      // ✅ Resposta final
      return res
        .status(200)
        .json(new ApiResponse(200, alunoAtualizado, 'Aluno atualizado com sucesso'));

    } catch (error) {
      console.error('❌ Erro geral em atualizarComPessoa:', error.stack || error);
      return res
        .status(error.statusCode || 500)
        .json(new ApiResponse(error.statusCode || 500, null, error.message));
    }
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
