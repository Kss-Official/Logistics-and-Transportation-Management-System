import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const { user, isAuthenticated, isLoggingOut } = useAuth();
  const location = useLocation();

  if (isLoggingOut) {
    return <Navigate to="/signin" replace />;
  }

  const targetSignIn =
    allowedRole === 'ADMIN'
      ? '/signin/admin'
      : allowedRole === 'WAREHOUSE_MANAGER'
      ? '/signin/warehouse'
      : allowedRole === 'DRIVER'
      ? '/signin/driver'
      : '/signin/customer';

  if (!isAuthenticated || !user) {
    return <Navigate to={targetSignIn} replace state={{ from: location }} />;
  }

  if (user.role !== allowedRole) {
    const portalName =
      allowedRole === 'ADMIN'
        ? 'Admin'
        : allowedRole === 'WAREHOUSE_MANAGER'
        ? 'Warehouse Manager'
        : allowedRole === 'DRIVER'
        ? 'Driver'
        : 'Customer';

    return (
      <Navigate
        to={targetSignIn}
        replace
        state={{
          from: location,
          errorMessage: `You do not have permission to access the ${portalName} Portal.`,
        }}
      />
    );
  }

  return <>{children}</>;
}
