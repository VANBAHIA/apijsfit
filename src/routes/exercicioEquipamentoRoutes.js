const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');
const exercicioEquipamentoController = require('../controllers/exercicioEquipamentoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');
const upload = require('../middlewares/uploadMiddleware');

// ✅ ROTAS MAIS ESPECÍFICAS PRIMEIRO!

// 1️⃣ Upload de imagem (específico)
router.post('/:id/imagem',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'editar'),
  upload.single('imagem'),
  exercicioController.uploadImagem
);

// 2️⃣ ROTAS DE EQUIPAMENTO (mais específicas que :id genérico)
// Vincular exercício a equipamento
router.post(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'vincular'),
  exercicioEquipamentoController.vincular
);

// Listar equipamentos de um exercício
router.get(
  '/:exercicioId/equipamentos',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'visualizar'),
  exercicioEquipamentoController.listarEquipamentosDoExercicio
);

// Obter exercício com todos seus equipamentos
router.get(
  '/:exercicioId/completo',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'visualizar'),
  exercicioEquipamentoController.obterExercicioCompleto
);

// Desvincular exercício de equipamento
router.delete(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'desvincular'),
  exercicioEquipamentoController.desvincular
);

// Atualizar vínculo
router.patch(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'editar'),
  exercicioEquipamentoController.atualizarVinculo
);

// 3️⃣ ROTAS GENÉRICAS POR ÚLTIMO (pegam :id)

// Listar todos
router.get('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.listarTodos
);

// Criar
router.post('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'criar'),
  exercicioController.criar
);

// Buscar por ID
router.get('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.buscarPorId
);

// Atualizar
router.put('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'editar'),
  exercicioController.atualizar
);

// Deletar
router.delete('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'excluir'),
  exercicioController.deletar
);

// Error handler para upload
router.use((err, req, res, next) => {
  const multer = require('multer');
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