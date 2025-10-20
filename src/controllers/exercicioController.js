const exercicioService = require('../services/exercicioService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const fs = require('fs');
const path = require('path');

class ExercicioController {
  async criar(req, res) {
    const dados = req.body;
    const empresaId = req.empresaId;

    const exercicio = await exercicioService.criar(dados, empresaId);

    res.status(201).json(
      new ApiResponse(201, exercicio, 'Exercício criado com sucesso')
    );
  }

  async listarTodos(req, res) {
    const { page, limit, busca, grupoId } = req.query;
    const empresaId = req.empresaId;

    const resultado = await exercicioService.listarTodos({
      page,
      limit,
      busca,
      grupoId,
      empresaId
    });

    res.status(200).json(
      new ApiResponse(200, resultado, 'Exercícios listados com sucesso')
    );
  }

  async buscarPorId(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    const exercicio = await exercicioService.buscarPorId(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, exercicio, 'Exercício encontrado')
    );
  }

  async atualizar(req, res) {
    const { id } = req.params;
    const dados = req.body;
    const empresaId = req.empresaId;

    const exercicio = await exercicioService.atualizar(id, dados, empresaId);

    res.status(200).json(
      new ApiResponse(200, exercicio, 'Exercício atualizado com sucesso')
    );
  }

  async deletar(req, res) {
    const { id } = req.params;
    const empresaId = req.empresaId;

    await exercicioService.deletar(id, empresaId);

    res.status(200).json(
      new ApiResponse(200, null, 'Exercício deletado com sucesso')
    );
  }
  // src/controllers/exercicioController.js
 // Temporário - só para testar
async uploadImagem(req, res) {
  try {
    console.log('📤 Upload recebido');
    console.log('👤 Empresa ID:', req.empresaId);
    console.log('🆔 Exercicio ID:', req.params.id);
    console.log('📎 Arquivo:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const { empresaId } = req;
    const { id } = req.params;

    // Buscar exercício usando o service
    const exercicio = await exercicioService.buscarPorId(id, empresaId);

    if (!exercicio) {
      // Deletar arquivo se exercício não existe
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Exercício não encontrado'
      });
    }

    // Deletar imagem antiga se existir
    if (exercicio.imagemUrl) {
      // Se a URL antiga é do nosso servidor
      if (exercicio.imagemUrl.startsWith('/imagens/') || 
          exercicio.imagemUrl.includes(process.env.BACKEND_URL)) {
        
        // Extrair o caminho relativo
        let relativePath = exercicio.imagemUrl;
        if (relativePath.includes(process.env.BACKEND_URL)) {
          relativePath = relativePath.replace(process.env.BACKEND_URL, '');
        }
        
        const oldPath = path.join(__dirname, '../../public', relativePath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log('🗑️ Imagem antiga deletada:', oldPath);
        }
      }
    }

    // ✅ URL COMPLETA da nova imagem
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
    const imagemUrl = `${backendUrl}/imagens/exercicios/${req.file.filename}`;
    
    console.log('✅ URL completa da imagem:', imagemUrl);

    // Atualizar usando o service
    const exercicioAtualizado = await exercicioService.atualizar(
      id, 
      { imagemUrl }, 
      empresaId
    );

    res.json(
      new ApiResponse(200, { imagemUrl, exercicio: exercicioAtualizado }, 'Imagem enviada com sucesso')
    );

  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    
    // Deletar arquivo se houver erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da imagem',
      error: error.message
    });
  }
}


}


module.exports = new ExercicioController();
