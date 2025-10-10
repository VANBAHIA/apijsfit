const express = require('express');
const router = express.Router();

// Importar todas as rotas
const pessoaRoutes = require('./pessoaRoutes');
const alunoRoutes = require('./alunoRoutes');
const userRoutes = require('./userRoutes');
const localRoutes = require('./localRoutes');
const planoRoutes = require('./planoRoutes');
const funcaoRoutes = require('./funcaoRoutes');
const descontoRoutes = require('./descontoRoutes');
const turmaRoutes = require('./turmaRoutes');
const funcionarioRoutes = require('./funcionarioRoutes');




// Registrar rotas
router.use('/pessoas', pessoaRoutes);
router.use('/alunos', alunoRoutes);
router.use('/users', userRoutes);
router.use('/locais', localRoutes);
router.use('/planos', planoRoutes);
router.use('/funcoes', funcaoRoutes)
router.use('/descontos', descontoRoutes);
router.use('/turmas', turmaRoutes);
router.use('/funcionarios', funcionarioRoutes);


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
      planos: '/api/planos',
      funcoes: '/api/funcoes',
      descontos: '/api/descontos',
      turmas: '/api/turmas',
      funcionarios: '/api/funcionarios'
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
      { path: '/api/planos', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/descontos', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/funcoes', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/turmas', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/funcionarios', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
    ]
  });
});

module.exports = router;