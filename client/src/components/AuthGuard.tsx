import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.token);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
