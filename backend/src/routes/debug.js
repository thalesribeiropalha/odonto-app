const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Endpoint temporário para debug - listar usuários
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, {
      password: 0 // Não retornar senhas por segurança
    });
    
    res.json({
      total: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
