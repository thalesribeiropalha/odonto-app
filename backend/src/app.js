const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
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
const userRoutes = require('./routes/users');
const testSupabaseRoutes = require('./routes/test-supabase');
const organizationRoutes = require('./routes/organizations');
const fixAdminRoutes = require('./routes/fix-admin');
const debugAuthRoutes = require('./routes/debug-auth');
const patientRoutes = require('./routes/patients');

app.use('/api', statusRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test-supabase', testSupabaseRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/fix', fixAdminRoutes);
app.use('/api/debug-auth', debugAuthRoutes);
app.use('/api/patients', patientRoutes);

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




