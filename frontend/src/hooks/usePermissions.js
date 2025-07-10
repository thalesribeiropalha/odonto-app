import { useAuth } from '../context/AuthContext';

// Mapeamento de permissões por role
const PERMISSIONS_MAP = {
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

export const usePermissions = () => {
  const { user } = useAuth();

  // Função para verificar se usuário tem uma permissão específica
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    // Proprietário tem todas as permissões
    if (user.role === 'owner') return true;
    
    // Verificar permissões customizadas do usuário
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }
    
    // Verificar permissões padrão do role
    const rolePermissions = PERMISSIONS_MAP[user.role] || [];
    return rolePermissions.includes(permission) || rolePermissions.includes('*');
  };

  // Função para verificar se usuário tem um dos roles especificados
  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  // Verificações específicas por funcionalidade
  const permissions = {
    // Verificar se pode gerenciar usuários
    canManageUsers: hasRole('owner', 'admin'),
    
    // Verificar se pode gerenciar organizações
    canManageOrganizations: hasRole('owner'),
    
    // Verificar se pode acessar pacientes
    canAccessPatients: hasRole('owner', 'admin', 'dentist', 'secretary'),
    
    // Verificar se pode criar pacientes
    canCreatePatients: hasPermission('patients.create'),
    
    // Verificar se pode editar pacientes
    canEditPatients: hasPermission('patients.update'),
    
    // Verificar se pode deletar pacientes
    canDeletePatients: hasPermission('patients.delete'),
    
    // Verificar se pode acessar agenda/consultas
    canAccessAppointments: hasRole('owner', 'admin', 'dentist', 'secretary'),
    
    // Verificar se pode criar consultas
    canCreateAppointments: hasPermission('appointments.create'),
    
    // Verificar se pode editar consultas
    canEditAppointments: hasPermission('appointments.update'),
    
    // Verificar se pode deletar consultas
    canDeleteAppointments: hasPermission('appointments.delete'),
    
    // Verificar se pode acessar financeiro
    canAccessFinancial: hasRole('owner', 'admin', 'dentist', 'secretary'),
    
    // Verificar se pode criar registros financeiros
    canCreateFinancial: hasPermission('financial.create'),
    
    // Verificar se pode editar registros financeiros
    canEditFinancial: hasPermission('financial.update'),
    
    // Verificar se pode deletar registros financeiros
    canDeleteFinancial: hasPermission('financial.delete'),
    
    // Verificar se pode ver relatórios
    canViewReports: hasPermission('reports.read'),
    
    // Verificar se pode ver configurações
    canViewSettings: hasRole('owner', 'admin'),
    
    // Verificar se é proprietário
    isOwner: hasRole('owner'),
    
    // Verificar se é admin
    isAdmin: hasRole('admin'),
    
    // Verificar se é dentista
    isDentist: hasRole('dentist'),
    
    // Verificar se é secretária
    isSecretary: hasRole('secretary'),
    
    // Verificar se tem acesso operacional (todos exceto roles inexistentes)
    hasOperationalAccess: hasRole('owner', 'admin', 'dentist', 'secretary'),
    
    // Verificar se tem acesso administrativo
    hasAdminAccess: hasRole('owner', 'admin')
  };

  return {
    user,
    hasPermission,
    hasRole,
    ...permissions
  };
};

export default usePermissions;




