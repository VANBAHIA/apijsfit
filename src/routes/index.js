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
const matriculaRoutes = require('./matriculaRoutes');
const contaReceberRoutes = require('./contaReceberRoutes');
const caixaRoutes = require('./caixaRoutes');
const contaPagarRoutes = require('./contaPagarRoutes');
const empresaRoutes = require('./empresaRoutes');
const licencaRoutes = require('./licencaRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const jobRoutes = require('./jobRoutes');
const visitanteRoutes = require('./visitanteRoutes');
const frequenciaRoutes = require('./frequenciaRoutes');
const relatorioFinanceiroRoutes = require('./relatorioFinanceiroRoutes');






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
router.use('/matriculas', matriculaRoutes);
router.use('/contas-receber', contaReceberRoutes);
router.use('/contas-pagar', contaPagarRoutes);
router.use('/caixas', caixaRoutes);
router.use('/empresas', empresaRoutes);
router.use('/licencas', licencaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/jobs', jobRoutes);
router.use('/visitantes', visitanteRoutes);
router.use('/frequencias', frequenciaRoutes);
router.use('/relatorios/financeiro', relatorioFinanceiroRoutes);







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
      funcionarios: '/api/funcionarios',
      matriculas: '/api/matriculas',
      contaReceber: '/api/contas-receber',
      contaPagar: '/api/contas-pagar',
      caixas: '/api/caixas',
      empresas: '/api/empresas',
      licensas: '/api/licensas',
      usuarios: '/api/usuarios',
      jobs: '/api/jobs',
      visitantes: '/api/visitantes',
      frequencias: 'api/frequencias',
      relatorioFinanceiroRoutes: 'api/relatorioFinanceiroRoutes'
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
      { path: '/api/funcionarios', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/matriculas', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/contas-receber', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/contas-pagar', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/caixas', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/empresas', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/licensas', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/usuarios', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/jobs', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/visitantes', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
       { path: '/api/frequencias', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
       { path: '/api/relatorioFinanceiroRoutes', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
       

    ]
  });
});

module.exports = router;