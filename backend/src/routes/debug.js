const express = require('express');
const router = express.Router();

// Rota para criar usuário admin em modo demo
router.post('/create-admin', async (req, res) => {
  try {
    // Importar o sistema de usuários em memória
    const { usersInMemory } = require('../middleware/auth');
    const bcrypt = require('bcrypt');
    
    console.log('🔧 DEBUG: Criando usuário admin...');
    
    // Verificar se usuário já existe
    const existingUser = usersInMemory.find(u => u.email === 'thales.rp@hotmail.com');
    if (existingUser) {
      return res.json({
        success: true,
        message: 'Usuário admin já existe',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        }
      });
    }
    
    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    // Criar usuário admin
    const adminUser = {
      _id: `demo_admin_${Date.now()}`,
      name: 'Thales Ribeiro',
      email: 'thales.rp@hotmail.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      lastLogin: null
    };
    
    usersInMemory.push(adminUser);
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📊 Total de usuários na memória:', usersInMemory.length);
    
    res.json({
      success: true,
      message: 'Usuário admin criado com sucesso!',
      user: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      totalUsers: usersInMemory.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário admin',
      error: error.message
    });
  }
});

// Rota para listar usuários em memória
router.get('/users', (req, res) => {
  try {
    const { usersInMemory } = require('../middleware/auth');
    
    const users = usersInMemory.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.json({
      success: true,
      totalUsers: users.length,
      users
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
});

// Rota de teste de conexão
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Debug API funcionando!',
    timestamp: new Date().toISOString(),
    mode: process.env.MONGODB_URI ? 'MONGODB' : 'DEMO'
  });
});

module.exports = router;
