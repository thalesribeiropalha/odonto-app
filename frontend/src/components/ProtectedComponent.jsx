import React from 'react';
import usePermissions from '../hooks/usePermissions';

// Componente para exibição condicional baseada em permissões
const ProtectedComponent = ({ 
  children, 
  permission, 
  role, 
  roles = [], 
  requireAll = false,
  fallback = null,
  showFallback = false 
}) => {
  const { hasPermission, hasRole } = usePermissions();

  // Verificar se o usuário tem a permissão específica
  if (permission && !hasPermission(permission)) {
    return showFallback ? fallback : null;
  }

  // Verificar se o usuário tem o role específico
  if (role && !hasRole(role)) {
    return showFallback ? fallback : null;
  }

  // Verificar se o usuário tem um dos roles especificados
  if (roles.length > 0) {
    if (requireAll) {
      // Requer todos os roles
      const hasAllRoles = roles.every(r => hasRole(r));
      if (!hasAllRoles) {
        return showFallback ? fallback : null;
      }
    } else {
      // Requer pelo menos um dos roles
      const hasAnyRole = roles.some(r => hasRole(r));
      if (!hasAnyRole) {
        return showFallback ? fallback : null;
      }
    }
  }

  return children;
};

// Componente específico para acesso administrativo
export const AdminOnly = ({ children, fallback = null, showFallback = false }) => (
  <ProtectedComponent 
    roles={['owner', 'admin']} 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </ProtectedComponent>
);

// Componente específico para proprietário apenas
export const OwnerOnly = ({ children, fallback = null, showFallback = false }) => (
  <ProtectedComponent 
    role="owner" 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </ProtectedComponent>
);

// Componente específico para acesso operacional
export const OperationalAccess = ({ children, fallback = null, showFallback = false }) => (
  <ProtectedComponent 
    roles={['owner', 'admin', 'dentist', 'secretary']} 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </ProtectedComponent>
);

// Componente para verificar permissão específica
export const WithPermission = ({ permission, children, fallback = null, showFallback = false }) => (
  <ProtectedComponent 
    permission={permission} 
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </ProtectedComponent>
);

// Hook para usar dentro de componentes funcionais
export const useProtectedAction = () => {
  const permissions = usePermissions();

  const withPermissionCheck = (permission, action, unauthorizedAction = null) => {
    return () => {
      if (permissions.hasPermission(permission)) {
        action();
      } else if (unauthorizedAction) {
        unauthorizedAction();
      } else {
        console.warn(`Ação negada: permissão '${permission}' não encontrada`);
      }
    };
  };

  const withRoleCheck = (role, action, unauthorizedAction = null) => {
    return () => {
      if (permissions.hasRole(role)) {
        action();
      } else if (unauthorizedAction) {
        unauthorizedAction();
      } else {
        console.warn(`Ação negada: role '${role}' não encontrado`);
      }
    };
  };

  return {
    withPermissionCheck,
    withRoleCheck,
    ...permissions
  };
};

export default ProtectedComponent;


