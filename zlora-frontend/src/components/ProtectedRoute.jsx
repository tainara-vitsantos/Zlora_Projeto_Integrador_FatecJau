
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Aguarda a verificacao da autenticacao
  if (loading) return <div>Carregando...</div>;

  // Se nao estiver autenticado, volta para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o perfil possui permissao para acessar a rota
  if (role && user.papel !== role) {
    if (user.papel === 'cliente') {
      return <Navigate to="/cliente/dashboard" replace />;
    }

    if (user.papel === 'profissional') {
  return <Navigate to="/profissional/agenda" replace />;
}

    if (user.papel === 'administrador') {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}
