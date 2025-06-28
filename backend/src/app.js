const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar ao banco de dados
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://odonto-app-eight.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const statusRoutes = require('./routes/status');
const authRoutes = require('./routes/auth');
const debugRoutes = require('./routes/debug');

app.use('/api', statusRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/debug', debugRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Algo deu errado!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    availableRoutes: [
      'GET /api/status',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

module.exports = app;
