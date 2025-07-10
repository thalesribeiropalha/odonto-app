const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

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

      // Buscar usuário no Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, organization_id, permissions, is_active')
        .eq('id', decoded.id)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return res.status(401).json({
          message: 'Não autorizado, usuário não encontrado'
        });
      }

      req.user = {
        id: user.id,
        _id: user.id, // Compatibilidade com código existente
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
        organizationId: user.organization_id, // Manter compatibilidade
        permissions: user.permissions || [],
        isActive: user.is_active
      };

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

// Middleware para verificar permissões específicas
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        message: `Não autorizado. Permissão '${permission}' necessária`
      });
    }
    next();
  };
};

// Funções de compatibilidade (para não quebrar código existente)
const addUserToMemory = () => {};
const getUsersFromMemory = () => [];
const usersInMemory = [];

module.exports = { 
  protect, 
  authorize, 
  checkPermission,
  addUserToMemory, 
  getUsersFromMemory, 
  usersInMemory 
};

