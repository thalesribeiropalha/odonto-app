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

// Rota temporária de usuários mockados para teste
router.get('/mock-users', (req, res) => {
  const mockUsers = [
    {
      id: '1',
      name: 'Dr. João Silva',
      email: 'joao.silva@clinica.com',
      role: 'dentista',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@clinica.com',
      role: 'secretaria',
      isActive: true,
      createdAt: '2024-02-20T14:20:00Z'
    },
    {
      id: '3',
      name: 'Admin Sistema',
      email: 'admin@clinica.com',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Dra. Ana Costa',
      email: 'ana.costa@clinica.com',
      role: 'dentista',
      isActive: false,
      createdAt: '2024-03-10T11:30:00Z'
    }
  ];

  res.json({
    success: true,
    total: mockUsers.length,
    users: mockUsers
  });
});

module.exports = router;
