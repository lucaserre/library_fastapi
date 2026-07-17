import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

// Protege rotas como /login e /register. Se já estiver logado, joga pro /dashboard.
export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando sistema...</div>;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}