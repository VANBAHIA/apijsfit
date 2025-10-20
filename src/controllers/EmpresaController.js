const empresaService = require('../services/empresaService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class EmpresaController {

  buscarPorCNPJ = asyncHandler(async (req, res) => {  
    let cnpj = req.body.cnpj;   

    if (!cnpj || typeof cnpj !== 'string') {
      return res.status(400).json({
        success: false,
        message: "CNPJ inválido ou não fornecido"
      });
    }

    cnpj = cnpj.replace(/\D/g, '');  
    
    const empresa = await empresaService.buscarPorCNPJ(cnpj);

    res.status(200).json(
      new ApiResponse(200, empresa, 'Empresa encontrada')
    );
  });

  criar = asyncHandler(async (req, res) => {
    const dados = req.body;

    const empresa = await empresaService.criar(dados);

    res.status(201).json(
      new ApiResponse(201, empresa, 'Empresa criada com sucesso')
    );
  });

  buscarTodos = asyncHandler(async (req, res) => {
    const { situacao, page, limit } = req.query;

    const skip = page ? (Number(page) - 1) * Number(limit || 10) : 0;
    const take = limit ? Number(limit) : 10;

    const resultado = await empresaService.buscarTodos({
      situacao,
      skip,
      take
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Empresas listadas com sucesso')
    );
  });

  buscarPorId = asyncHandler(async (req, res) => {
    const empresa = await empresaService.buscarPorId(req.params.id);

    res.status(200).json(
      new ApiResponse(200, empresa, 'Empresa encontrada')
    );
  });

  atualizar = asyncHandler(async (req, res) => {
    const dados = req.body;

    const empresa = await empresaService.atualizar(req.params.id, dados);

    res.status(200).json(
      new ApiResponse(200, empresa, 'Empresa atualizada com sucesso')
    );
  });

  deletar = asyncHandler(async (req, res) => {
    if  (req.usuario.perfil === "SUPER_ADMIN" ) {    
    await empresaService.deletar(req.params.id);

    res.status(200).json(
      new ApiResponse(200, null, 'Empresa deletada com sucesso')
    );
  }

  });

  buscarComFiltros = asyncHandler(async (req, res) => {
    const empresas = await empresaService.buscarComFiltros(req.query);

    res.status(200).json(
      new ApiResponse(200, empresas, 'Busca realizada com sucesso')
    );
  });

  alterarSituacao = asyncHandler(async (req, res) => {
     if  (req.usuario.perfil === "SUPER_ADMIN" ) {  
    const { situacao } = req.body;

    const empresa = await empresaService.alterarSituacao(req.params.id, situacao);

    res.status(200).json(
      new ApiResponse(200, empresa, 'Situação alterada com sucesso')
    );
  }});

}

module.exports = new EmpresaController();