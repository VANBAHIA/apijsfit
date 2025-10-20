require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/apiError');

// ✅ IMPORTAR SCHEDULER
const jobScheduler = require('./jobs/scheduler');

const app = express();
const path = require('path');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Adicione seus domínios
  credentials: true
}));

const PORT = process.env.PORT || 3000;

// ✅ Agora servindo a pasta public fora do /src
app.use('/imagens', express.static(path.join(__dirname, '../public/imagens')));

// Middlewares de segurança e otimização
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rotas
app.use('/api', routes);

// Rota não encontrada
app.use((req, res, next) => {
  next(new ApiError(404, `Rota ${req.originalUrl} não encontrada`));
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);

  // ✅ INICIAR JOBS AGENDADOS
  jobScheduler.iniciar();
});

module.exports = app;
