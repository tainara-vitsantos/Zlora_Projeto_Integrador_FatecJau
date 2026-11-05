import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiClock, FiInstagram, FiMapPin, FiCalendar } from 'react-icons/fi';

export default function PublicSalon() {
  const { slug } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarDados() {
      try {
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

  // Aqui está a mágica: Pega a cor escolhida pela empresa. Se não tiver, usa o Roxo da Zlora.
  const corMarca = dados.empresa.corPrimaria || '#6F3CE7';

  return (
    // Aplicamos a variável global de cor nesta div, afetando todos os filhos
    <div style={{ minHeight: '100vh', background: '#F9FAFB', '--cor-marca': corMarca }}>
      
      {/* 1. BANNER E LOGO DA EMPRESA */}
      <header style={{ position: 'relative', marginBottom: '60px' }}>
        {/* Foto de Capa */}
        <div style={{ 
          height: '240px', 
          background: dados.empresa.fotoCapaUrl 
            ? `url(${dados.empresa.fotoCapaUrl}) center/cover` 
            : `linear-gradient(135deg, ${corMarca} 0%, #24173C 100%)` // Se não tiver foto, faz um degradê com a cor da marca
        }} />
        
        {/* Logo Redonda (Sobreposta) */}
        <div style={{ 
          position: 'absolute', left: '50%', bottom: '-50px', transform: 'translateX(-50%)',
          width: '110px', height: '110px', borderRadius: '50%', background: '#fff', 
          border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {dados.empresa.logoUrl ? (
            <img src={dados.empresa.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: corMarca, fontFamily: 'Outfit' }}>
              {dados.empresa.nome.charAt(0)}
            </span>
          )}
        </div>
      </header>

      {/* 2. INFORMAÇÕES DA EMPRESA */}
      <div style={{ textAlign: 'center', padding: '0 20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', color: '#111', margin: '0 0 10px', fontFamily: 'Outfit' }}>
          {dados.empresa.nome}
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {dados.empresa.endereco && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '14px' }}>
              <FiMapPin /> {dados.empresa.endereco}
            </span>
          )}
          {dados.empresa.instagram && (
            <a 
              href={`https://instagram.com/${dados.empresa.instagram}`} 
              target="_blank" rel="noreferrer" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                color: corMarca, fontSize: '14px', fontWeight: '600', textDecoration: 'none' 
              }}
            >
              <FiInstagram /> @{dados.empresa.instagram}
            </a>
          )}
        </div>
      </div>

      {/* 3. LISTA DE SERVIÇOS */}
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 60px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#111', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar /> Agende seu horário
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dados.servicos.map(servico => (
            <div 
              key={servico.id} 
              style={{ 
                background: '#fff', borderRadius: '16px', padding: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#111' }}>{servico.nome}</h3>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '13px' }}>{servico.descricao}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  {/* Preço usa a cor da marca */}
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: corMarca }}>
                    R$ {servico.preco.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <FiClock /> {servico.duracaoMinutos} min
                  </div>
                </div>
                
                <button 
                  style={{ 
                    background: corMarca, color: '#fff', border: 'none', 
                    padding: '12px 24px', borderRadius: '999px', fontWeight: '600',
                    cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: `0 4px 12px ${corMarca}40` 
                  }}
                  onClick={() => alert(`Abrir tela de agendamento para: ${servico.nome}`)}
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
          
          {dados.servicos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', background: '#fff', borderRadius: '16px' }}>
              Nenhum serviço disponível no momento.
            </div>
          )}
        </div>
      </main>
      
      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF', fontSize: '13px' }}>
        Powered by <strong style={{ color: '#111' }}>Zlora</strong>
      </footer>
    </div>
  );
}