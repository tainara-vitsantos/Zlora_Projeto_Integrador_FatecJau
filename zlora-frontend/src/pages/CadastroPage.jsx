import { Link } from 'react-router-dom';
import Cadastro from '../components/sections/Cadastro';

export default function CadastroPage() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--zlora-bg)' }}>
      <Cadastro />
      <div className="text-center" style={{ paddingBottom: '60px' }}>
        <Link to="/" className="btn btn-ghost">Voltar para a Home</Link>
      </div>
    </div>
  );
}