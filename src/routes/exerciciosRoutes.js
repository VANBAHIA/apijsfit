const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { verificarPermissaoModulo } = require('../middlewares/verificarPermissao');
const { setEmpresaContext } = require('../middlewares/empresaContext');
const upload = require('../middlewares/uploadMiddleware');

router.post('/:id/imagem',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'editar'),
  upload.single('imagem'),
  exercicioController.uploadImagem
);

router.get('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.listarTodos
);

router.post('/',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'criar'),
  exercicioController.criar
);

router.get('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'acessar'),
  exercicioController.buscarPorId
);

router.put('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'editar'),
  exercicioController.atualizar
);

router.delete('/:id',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicios', 'excluir'),
  exercicioController.deletar
);
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erro do Multer
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
    // Outros erros
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
});


module.exports = router;
