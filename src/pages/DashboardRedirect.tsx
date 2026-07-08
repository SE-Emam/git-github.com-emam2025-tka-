import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';

export default function DashboardRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  switch (profile.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'supervisor':
      return <Navigate to="/dashboard/supervisor" replace />;
    case 'trainer':
      return <Navigate to="/dashboard/trainer" replace />;
    case 'student':
    case 'trial':
      return <Navigate to="/dashboard/student" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}
