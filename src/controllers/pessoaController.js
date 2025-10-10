const pessoaService = require('../services/pessoaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

class PessoaController {
  criar = asyncHandler(async (req, res) => {
    const dados = req.body;

    // Converte dtNsc para Date se existir
    if (dados.dtNsc) {
      dados.dtNsc = new Date(dados.dtNsc);
    }

    // ✅ NÃO precisa mais validar/gerar código aqui

    const pessoa = await pessoaService.criar(dados);

    res.status(201).json(
      new ApiResponse(201, pessoa, 'Pessoa criada com sucesso')
    );
  });

  buscarTodos = asyncHandler(async (req, res) => {
    const { situacao, tipo, skip, take } = req.query;

    const resultado = await pessoaService.buscarTodos({
      situacao,
      tipo,
      skip,
      take,
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Pessoas listadas com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const pessoa = await pessoaService.buscarPorId(req.params.id);

    res.status(200).json(
      new ApiResponse(200, pessoa, 'Pessoa encontrada')
    );
  });

  atualizar = asyncHandler(async (req, res) => {
    const dados = req.body;

    // Converte dtNsc para Date se existir
    if (dados.dtNsc) {
      dados.dtNsc = new Date(dados.dtNsc);
    }

    const pessoa = await pessoaService.atualizar(req.params.id, dados);

    res.status(200).json(
      new ApiResponse(200, pessoa, 'Pessoa atualizada com sucesso')
    );
  });

  deletar = asyncHandler(async (req, res) => {
    await pessoaService.deletar(req.params.id);

    res.status(200).json(
      new ApiResponse(200, null, 'Pessoa deletada com sucesso')
    );
  });

  buscarComFiltros = asyncHandler(async (req, res) => {
    const pessoas = await pessoaService.buscarComFiltros(req.query);

    res.status(200).json(
      new ApiResponse(200, pessoas, 'Busca realizada com sucesso')
    );
  });
}

module.exports = new PessoaController();