import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoggingOut } = useAuth();
  const location = useLocation();

  // If user is currently logging out, redirect directly to sign-in portal ("/signin")
  if (isLoggingOut) {
    return <Navigate to="/signin" replace />;
  }

  // Not authenticated → send to the appropriate role-specific sign-in page (never /portals)
  if (!isAuthenticated || !user) {
    const targetSignIn =
      allowedRole === 'ADMIN'
        ? '/signin/admin'
        : allowedRole === 'WAREHOUSE_MANAGER'
        ? '/signin/warehouse'
        : allowedRole === 'DRIVER'
        ? '/signin/driver'
        : allowedRole === 'CUSTOMER'
        ? '/signin/customer'
        : '/signin/customer';

    return <Navigate to={targetSignIn} replace state={{ from: location }} />;
  }

  // Wrong role → send to the appropriate role-specific sign in page with an informative message
  if (allowedRole && user.role !== allowedRole) {
    const targetSignIn =
      allowedRole === 'ADMIN'
        ? '/signin/admin'
        : allowedRole === 'WAREHOUSE_MANAGER'
        ? '/signin/warehouse'
        : allowedRole === 'DRIVER'
        ? '/signin/driver'
        : '/signin/customer';

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
          errorMessage: `This account does not have ${portalName} Portal access.`,
        }}
      />
    );
  }

  return <>{children}</>;
}
