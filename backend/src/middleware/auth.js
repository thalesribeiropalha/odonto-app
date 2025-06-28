const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

      // Obter usuário do token
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

      next();
    } catch (error) {
      console.error('Erro na autenticação:', error);
      res.status(401).json({
        message: 'Não autorizado, token inválido'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      message: 'Não autorizado, sem token'
    });
  }
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

module.exports = { protect, authorize };
