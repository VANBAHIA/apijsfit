const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');
const exercicioEquipamentoController = require('../controllers/exercicioEquipamentoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');
const upload = require('../middlewares/uploadMiddleware');
const multer = require('multer');

// ⚠️ ORDEM CRÍTICA: Rotas específicas ANTES de :id

// 1️⃣ ROTAS DE LISTAGEM (sem parâmetros dinâmicos)
router.get(
  '/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.listarTodos
);

// 2️⃣ ROTAS COM PALAVRAS-CHAVE FIXAS (antes de :id)

// Obter exercício com todos seus equipamentos (GET /completo)
router.get(
  '/completo',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'visualizar'),
  exercicioEquipamentoController.obterExercicioCompleto
);

// 3️⃣ ROTAS COM DOIS PARÂMETROS DINÂMICOS (mais específicas)

// Vincular exercício a equipamento (POST)
router.post(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'vincular'),
  exercicioEquipamentoController.vincular
);

// Listar equipamentos de um exercício (GET)
router.get(
  '/:exercicioId/equipamentos',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'visualizar'),
  exercicioEquipamentoController.listarEquipamentosDoExercicio
);

// Desvincular exercício de equipamento (DELETE)
router.delete(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'desvincular'),
  exercicioEquipamentoController.desvincular
);

// Atualizar vínculo (PATCH)
router.patch(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'editar'),
  exercicioEquipamentoController.atualizarVinculo
);

// 4️⃣ ROTAS COM UPLOAD (com parâmetro único :id)

// Upload de imagem
router.post(
  '/:id/imagem',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'editar'),
  upload.single('imagem'),
  exercicioController.uploadImagem
);

// 5️⃣ ROTAS COM UM PARÂMETRO DINÂMICO (genéricas - POR ÚLTIMO!)

// Criar
router.post(
  '/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'criar'),
  exercicioController.criar
);

// Buscar por ID
router.get(
  '/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.buscarPorId
);

// Atualizar
router.put(
  '/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'editar'),
  exercicioController.atualizar
);

// Deletar
router.delete(
  '/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'excluir'),
  exercicioController.deletar
);

// ========================
// ERROR HANDLER
// ========================

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Erro no upload: ' + err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
});

module.exports = router;