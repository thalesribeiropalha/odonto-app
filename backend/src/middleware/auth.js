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


      // VERIFICAÇÃO NORMAL DE TOKEN JWT
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
          error: 'Usuário não encontrado',
          message: 'Não foi possível encontrar este usuário no sistema. Verifique suas credenciais ou entre em contato com o suporte.'
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
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'O token de acesso fornecido é inválido. Faça login novamente.'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expirado',
          message: 'Sua sessão expirou. Faça login novamente para continuar.'
        });
      }
      
      return res.status(401).json({
        error: 'Erro de autenticação',
        message: 'Ocorreu um erro durante a verificação de suas credenciais. Tente fazer login novamente.'
      });
    }
  } else {
    res.status(401).json({
      error: 'Token de acesso não fornecido',
      message: 'É necessário fazer login para acessar este recurso.'
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

// Middleware para acesso operacional (dentist, secretary, admin, owner)
const hasOperationalAccess = (req, res, next) => {
  const operationalRoles = ['owner', 'admin', 'dentist', 'secretary'];
  if (!operationalRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissão insuficiente.',
      requiredRoles: operationalRoles
    });
  }
  next();
};

// Middleware para acesso administrativo (admin, owner)
const hasAdminAccess = (req, res, next) => {
  const adminRoles = ['owner', 'admin'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito a administradores.',
      requiredRoles: adminRoles
    });
  }
  next();
};

// Middleware para proprietário apenas
const hasOwnerAccess = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito ao proprietário do sistema.',
      requiredRole: 'owner'
    });
  }
  next();
};

// Middleware para validar organização (não se aplica ao proprietário)
const validateOrganizationAccess = (req, res, next) => {
  // Proprietário tem acesso global
  if (req.user.role === 'owner') {
    return next();
  }
  
  // Outros roles devem ter organização
  if (!req.user.organization_id) {
    return res.status(403).json({
      success: false,
      message: 'Usuário deve estar vinculado a uma organização'
    });
  }
  
  next();
};

// Função para obter permissões por role
const getPermissionsByRole = (role) => {
  const permissionsMap = {
    owner: ['*'], // Acesso total
    admin: [
      'organization.manage',
      'users.create', 'users.read', 'users.update', 'users.delete',
      'patients.create', 'patients.read', 'patients.update', 'patients.delete',
      'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
      'financial.create', 'financial.read', 'financial.update', 'financial.delete',
      'reports.read'
    ],
    dentist: [
      'patients.create', 'patients.read', 'patients.update', 'patients.delete',
      'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
      'financial.create', 'financial.read', 'financial.update', 'financial.delete'
    ],
    secretary: [
      'patients.create', 'patients.read', 'patients.update', 'patients.delete',
      'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
      'financial.create', 'financial.read', 'financial.update', 'financial.delete'
    ]
  };
  
  return permissionsMap[role] || [];
};

// Função para verificar se usuário tem permissão específica
const hasPermission = (userRole, userPermissions, requiredPermission) => {
  // Proprietário tem todas as permissões
  if (userRole === 'owner') {
    return true;
  }
  
  // Verificar se usuário tem a permissão específica
  if (userPermissions && userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Verificar permissões padrão do role
  const rolePermissions = getPermissionsByRole(userRole);
  return rolePermissions.includes(requiredPermission) || rolePermissions.includes('*');
};

// Funções de compatibilidade (para não quebrar código existente)
const addUserToMemory = () => {};
const getUsersFromMemory = () => [];
const usersInMemory = [];

module.exports = { 
  protect, 
  authorize, 
  checkPermission,
  hasOperationalAccess,
  hasAdminAccess,
  hasOwnerAccess,
  validateOrganizationAccess,
  getPermissionsByRole,
  hasPermission,
  addUserToMemory, 
  getUsersFromMemory, 
  usersInMemory 
};









