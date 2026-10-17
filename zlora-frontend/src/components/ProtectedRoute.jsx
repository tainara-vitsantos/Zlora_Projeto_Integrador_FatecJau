import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Se estiver carregando, não faz nada (poderia ser um spinner)
  if (loading) return <div>Carregando...</div>;

  // Se não tiver usuário, chuta de volta pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se tiver, libera o acesso à página
  return children;
}