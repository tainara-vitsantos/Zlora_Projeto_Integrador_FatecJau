import { useAuth } from '../../contexts/AuthContext';

export default function Perfil() {
  const { user } = useAuth();
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Meu Perfil</h2>
      <div className="dash-card" style={{ marginTop: '24px' }}>
        <p><strong>Nome:</strong> {user?.nome}</p>
        <p><strong>E-mail:</strong> {user?.email}</p>
      </div>
    </div>
  );
}