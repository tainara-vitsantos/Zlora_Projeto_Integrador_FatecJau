import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';

export default function PublicSalon() {
  const { slug } = useParams(); // Pega o "studio-bella" da URL
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarDados() {
      try {
        // Chama a rota pública que criamos no C#
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/publico/${slug}`);
        
        if (!response.ok) throw new Error('Salão não encontrado');
        const data = await response.json();
        setDados(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }
    buscarDados();
  }, [slug]);

  if (carregando) return <div style={{ padding: '100px', textAlign: 'center' }}>Carregando...</div>;
  if (!dados) return <div style={{ padding: '100px', textAlign: 'center' }}>Estabelecimento não encontrado.</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--zlora-bg)' }}>
      {/* HEADER DO SALÃO */}
      <header style={{ background: 'var(--zlora-primary)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{dados.empresa.nome}</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Bem-vindo(a)! Escolha um serviço para agendar.</p>
      </header>

      {/* LISTA DE SERVIÇOS */}
      <main className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '24px' }}>Nossos Serviços</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dados.servicos.map(servico => (
            <div key={servico.id} className="dash-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--zlora-dark)' }}>{servico.nome}</h3>
                <p style={{ margin: 0, color: 'var(--zlora-text-soft)', fontSize: '14px' }}>{servico.descricao}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--zlora-primary)' }}>
                    R$ {servico.preco.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--zlora-text-soft)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <FiClock /> {servico.duracaoMinutos} min
                  </div>
                </div>
                
                <button className="btn btn-primary" style={{ padding: '10px 20px' }} onClick={() => alert(`Abrir tela de agendamento para: ${servico.nome}`)}>
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}