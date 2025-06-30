const express = require('express');
const router = express.Router();

// Dados mockados simples
const testUsers = [
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

// Endpoint simples de teste
router.get('/users', (req, res) => {
  console.log('📊 TESTE: Retornando dados mockados simples');
  
  res.json({
    success: true,
    total: testUsers.length,
    users: testUsers
  });
});

module.exports = router;
