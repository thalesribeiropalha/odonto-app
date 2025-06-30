const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Sistema de usuários em memória para demonstração (quando não há MongoDB)
let usersInMemory = [];

// Helper para modo demo (sem MongoDB)
const isDemoMode = () => !process.env.MONGODB_URI;

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

      if (isDemoMode()) {
        // MODO DEMO - Buscar usuário em memória
        const user = usersInMemory.find(u => u._id === decoded.id);
        
        if (!user) {
          return res.status(401).json({
            message: 'Não autorizado, usuário não encontrado (Demo)'
          });
        }

        req.user = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          isActive: true
        };
      } else {
        // MODO MONGODB
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
          return res.status(401).json({
            message: 'Não autorizado, usuário não encontrado'
          });
        }

        if (!req.user.isActive) {
          return res.status(401).json({
            message: 'Não autorizado, usuário inativo'
          });
        }
      }

      next();
    } catch (error) {
      console.error('Erro na autenticação:', error);
      res.status(401).json({
        message: 'Não autorizado, token inválido'
      });
    }
  } else {
    res.status(401).json({
      message: 'Não autorizado, sem token'
    });
  }
};

// Função para adicionar usuário à memória (para uso do authController)
const addUserToMemory = (user) => {
  usersInMemory.push(user);
};

// Função para obter usuários da memória
const getUsersFromMemory = () => {
  return usersInMemory;
};

// Middleware para verificar permissões por role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Não autorizado. Role '${req.user.role}' não tem permissão para acessar esta rota`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, addUserToMemory, getUsersFromMemory, usersInMemory };
