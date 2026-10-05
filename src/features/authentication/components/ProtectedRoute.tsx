import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isEntryLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontFamily: 'Inter, sans-serif',
      }}>
        Loading...
      </div>
    );
  }

  if (!user && !isEntryLoading) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (!user) {
    return null;
  }

  return children;
}
