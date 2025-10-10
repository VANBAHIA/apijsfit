const express = require('express');
const router = express.Router();

const pessoaRoutes = require('./pessoaRoutes');
const alunoRoutes = require('./alunoRoutes');
const userRoutes = require('./userRoutes');

router.use('/pessoas', pessoaRoutes);
router.use('/alunos', alunoRoutes);
router.use('/users', userRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;