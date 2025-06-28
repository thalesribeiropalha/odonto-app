const express = require('express');
const router = express.Router();

// Rota de status para testar se a API está funcionando
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Odonto App API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API funcionando perfeitamente! 🦷'
  });
});

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
