import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/src/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // If user is logged in but doesn't have the required role, redirect to their default dashboard
    return <Navigate to={`/dashboard/${profile.role}`} replace />;
  }

  return <>{children}</>;
};
