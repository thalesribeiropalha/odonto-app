const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Dados mockados para modo demo
const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Dr. João Silva',
    email: 'joao.silva@clinica.com',
    role: 'dentista',
    isActive: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    lastLogin: new Date('2024-12-29T08:30:00Z')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Maria Santos',
    email: 'maria.santos@clinica.com',
    role: 'secretaria',
    isActive: true,
    createdAt: new Date('2024-02-20T14:20:00Z'),
    lastLogin: new Date('2024-12-28T16:45:00Z')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Admin Sistema',
    email: 'admin@clinica.com',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastLogin: new Date('2024-12-29T09:15:00Z')
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'Dra. Ana Costa',
    email: 'ana.costa@clinica.com',
    role: 'dentista',
    isActive: false,
    createdAt: new Date('2024-03-10T11:30:00Z'),
    lastLogin: new Date('2024-11-15T14:20:00Z')
  }
];

// Verificar se está conectado ao MongoDB
const isConnectedToDB = () => {
  return process.env.MONGODB_URI && require('mongoose').connection.readyState === 1;
};

// Endpoint temporário para debug - listar usuários
router.get('/users', async (req, res) => {
  try {
    let users;
    
    console.log('🔍 DEBUG - MONGODB_URI:', !!process.env.MONGODB_URI);
    console.log('🔍 DEBUG - Connection state:', require('mongoose').connection.readyState);
    console.log('🔍 DEBUG - isConnectedToDB():', isConnectedToDB());
    
    // FORÇAR uso de dados mockados para teste
    console.log('📊 TESTE: Forçando uso de dados mockados');
    users = mockUsers;
    
    res.json({
      total: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      message: 'Erro ao buscar usuários',
      error: error.message
    });
  }
});

module.exports = router;
