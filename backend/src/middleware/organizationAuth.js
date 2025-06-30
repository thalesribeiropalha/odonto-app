const Organization = require('../models/Organization');

// Middleware para verificar se o usuário pertence a uma organização ativa
const organizationAuth = async (req, res, next) => {
  try {
    // 1. Verificar se o usuário tem organização
    if (!req.user.organization?.id) {
      return res.status(403).json({
        success: false,
        message: 'Usuário não pertence a uma organização'
      });
    }
    
    // 2. Verificar se a organização existe e está ativa
    const organization = await Organization.findById(req.user.organization.id);
    if (!organization || !organization.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Organização inativa ou não encontrada'
      });
    }
    
    // 3. Verificar plano ativo
    if (organization.subscription.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Plano expirado. Renove sua assinatura.'
      });
    }
    
    // 4. Verificar se o plano está ativo
    if (!organization.subscription.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Plano inativo. Entre em contato com o suporte.'
      });
    }
    
    // 5. Adicionar organização ao request
    req.organization = organization;
    req.userRole = req.user.organization.role;
    req.userPermissions = req.user.organization.permissions || [];
    
    next();
  } catch (error) {
    console.error('Erro na validação da organização:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno na validação da organização' 
    });
  }
};

// Middleware para verificar permissões específicas
const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Permissão insuficiente. Necessária: ${requiredPermission}`
      });
    }
    next();
  };
};

// Middleware para verificar se pode gerenciar usuários
const canManageUsers = (req, res, next) => {
  const allowedRoles = ['owner', 'admin'];
  if (!allowedRoles.includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Apenas proprietários e administradores podem gerenciar usuários'
    });
  }
  next();
};

// Middleware para verificar se é owner da organização
const isOwner = (req, res, next) => {
  if (req.userRole !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Apenas o proprietário da organização pode realizar esta ação'
    });
  }
  next();
};

// Função para obter permissões padrão por função
const getDefaultPermissions = (role) => {
  const permissions = {
    owner: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'patients.create', 'patients.read', 'patients.update', 'patients.delete',
      'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
      'financial.create', 'financial.read', 'financial.update', 'financial.delete',
      'reports.read', 'settings.update', 'organization.manage'
    ],
    admin: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'patients.create', 'patients.read', 'patients.update', 'patients.delete',
      'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
      'financial.create', 'financial.read', 'financial.update', 'financial.delete',
      'reports.read', 'settings.update'
    ],
    dentist: [
      'patients.create', 'patients.read', 'patients.update',
      'appointments.create', 'appointments.read', 'appointments.update',
      'financial.read'
    ],
    secretary: [
      'patients.create', 'patients.read', 'patients.update',
      'appointments.create', 'appointments.read', 'appointments.update'
    ]
  };
  
  return permissions[role] || [];
};

// Função para obter todas as permissões (para owner)
const getAllPermissions = () => {
  return [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'patients.create', 'patients.read', 'patients.update', 'patients.delete',
    'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
    'financial.create', 'financial.read', 'financial.update', 'financial.delete',
    'reports.read', 'settings.update', 'organization.manage'
  ];
};

module.exports = {
  organizationAuth,
  hasPermission,
  canManageUsers,
  isOwner,
  getDefaultPermissions,
  getAllPermissions
};
