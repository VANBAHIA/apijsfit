const express = require('express');
const router = express.Router();

// Importar todas as rotas
const pessoaRoutes = require('./pessoaRoutes');
const alunoRoutes = require('./alunoRoutes');
const userRoutes = require('./userRoutes');
const localRoutes = require('./localRoutes');
const planoRoutes = require('./planoRoutes');

// Registrar rotas
router.use('/pessoas', pessoaRoutes);
router.use('/alunos', alunoRoutes);
router.use('/users', userRoutes);
router.use('/locais', localRoutes);
router.use('/planos', planoRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      pessoas: '/api/pessoas',
      alunos: '/api/alunos',
      users: '/api/users',
      locais: '/api/locais',
      planos: '/api/planos'
    }
  });
});

// Rota raiz da API
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bem-vindo à API JSFlexWeb',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      { path: '/api/pessoas', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/alunos', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/users', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/locais', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/planos', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
    ]
  });
});

module.exports = router;