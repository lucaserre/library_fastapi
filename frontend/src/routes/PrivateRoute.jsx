import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

// Protege rotas como /dashboard. Se não tiver logado, chuta pro /login.
export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando sistema...</div>;

  // Outlet renderiza as rotas filhas caso a condição seja verdadeira
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}