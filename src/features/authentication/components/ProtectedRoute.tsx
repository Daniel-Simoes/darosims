import { Navigate, useLocation } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isEntryLoading } = useAuth();
  const location = useLocation();
  if (isLoading && !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#f4f7fb',
        }}
        aria-busy="true"
        aria-label="Loading session"
      >
        <div style={{ width: 'min(320px, 100%)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={40} borderRadius={10} />
          <Skeleton height={16} width="70%" borderRadius={6} />
          <Skeleton height={200} borderRadius={12} />
        </div>
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
