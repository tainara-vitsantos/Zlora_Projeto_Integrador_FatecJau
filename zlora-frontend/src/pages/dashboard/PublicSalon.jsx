import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiClock, FiInstagram, FiMapPin, FiCalendar, FiX, FiUser, FiPhone, FiCheckCircle, FiBriefcase } from 'react-icons/fi';

export default function PublicSalon() {
  const { slug } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  
  // Estados do Modal
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [etapaAgendamento, setEtapaAgendamento] = useState('');
  const [formCliente, setFormCliente] = useState({ nome: '', telefone: '', profissionalId: '', dataHora: '' });
  const [enviando, setEnviando] = useState(false);

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

  const corMarca = dados.empresa.corPrimaria || '#6F3CE7';
  const estiloCapa = dados.empresa.fotoCapaUrl 
    ? { backgroundImage: `url(${dados.empresa.fotoCapaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${corMarca} 0%, #1B1130 100%)` };

  const abrirAgendamento = (servico) => {
    setServicoSelecionado(servico);
    setEtapaAgendamento('form');
    setFormCliente({ nome: '', telefone: '', profissionalId: '', dataHora: '' });
  };

  const confirmarAgendamento = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/publico/${slug}/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formCliente.nome,
          telefone: formCliente.telefone,
          servicoId: servicoSelecionado.id || servicoSelecionado.Id,
          profissionalId: formCliente.profissionalId,
          dataHoraInicio: new Date(formCliente.dataHora).toISOString()
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.mensagem || 'Erro ao agendar.');

      setEtapaAgendamento('sucesso');
    } catch (error) {
      alert(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ position: 'relative', marginBottom: '50px' }}>
        <div style={{ height: '240px', ...estiloCapa, borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px' }} />
        <div style={{ position: 'absolute', left: '50%', bottom: '-60px', transform: 'translateX(-50%)', width: '120px', height: '120px', borderRadius: '50%', background: '#fff', border: '5px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {dados.empresa.logoUrl ? (
            <img src={dados.empresa.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '3rem', fontWeight: '800', color: corMarca, fontFamily: 'Outfit' }}>{dados.empresa.nome.charAt(0)}</span>
          )}
        </div>
      </header>

      <div style={{ textAlign: 'center', padding: '0 20px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#111', margin: '0 0 12px', fontFamily: 'Outfit', fontWeight: '800' }}>{dados.empresa.nome}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {dados.empresa.endereco && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '14px' }}><FiMapPin color={corMarca} /> {dados.empresa.endereco}</span>}
          {dados.empresa.instagram && <a href={`https://instagram.com/${dados.empresa.instagram}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: corMarca, fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}><FiInstagram /> @{dados.empresa.instagram}</a>}
        </div>
      </div>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px 80px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#111', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}><FiCalendar color={corMarca} /> Serviços Disponíveis</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dados.servicos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #D1D5DB', color: '#6B7280' }}>Nenhum serviço disponível.</div>
          ) : (
            dados.servicos.map(servico => (
              <div key={servico.id || servico.Id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {(servico.imagemUrl || servico.ImagemUrl) && (
                    <img src={servico.imagemUrl || servico.ImagemUrl} alt={servico.nome} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#111', fontWeight: '700' }}>{servico.nome || servico.Nome}</h3>
                    <p style={{ margin: '0 0 12px', color: '#6B7280', fontSize: '13px' }}>{servico.descricao || servico.Descricao || 'Sem descrição.'}</p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#9CA3AF', fontWeight: '500' }}><FiClock /> {servico.duracaoMinutos || servico.DuracaoMinutos} min</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111', fontFamily: 'Outfit' }}>R$ {(servico.preco || servico.Preco || 0).toFixed(2)}</div>
                  <button onClick={() => abrirAgendamento(servico)} style={{ background: corMarca, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '999px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: `0 4px 12px ${corMarca}40` }}>Agendar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      <footer style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF', fontSize: '13px', borderTop: '1px solid #E5E7EB' }}>Agendamento online feito com <strong style={{ color: corMarca }}>Zlora</strong></footer>

      {/* MODAL DE AGENDAMENTO */}
      {servicoSelecionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            
            <div style={{ background: corMarca, padding: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Confirmar Agendamento</h3>
                <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.9 }}>{servicoSelecionado.nome || servicoSelecionado.Nome}</p>
              </div>
              <button onClick={() => setServicoSelecionado(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 0, color: '#fff', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={20} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              {etapaAgendamento === 'form' ? (
                <form onSubmit={confirmarAgendamento}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Seu Nome Completo *</label>
                    <div style={{ position: 'relative' }}>
                      <FiUser style={{ position: 'absolute', left: '14px', top: '14px', color: '#9CA3AF' }} />
                      <input type="text" required placeholder="Ex: Maria Silva" value={formCliente.nome} onChange={e => setFormCliente({...formCliente, nome: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #D1D5DB', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Seu WhatsApp *</label>
                    <div style={{ position: 'relative' }}>
                      <FiPhone style={{ position: 'absolute', left: '14px', top: '14px', color: '#9CA3AF' }} />
                      <input type="tel" required placeholder="(00) 00000-0000" value={formCliente.telefone} onChange={e => setFormCliente({...formCliente, telefone: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #D1D5DB', outline: 'none' }} />
                    </div>
                  </div>

                  {/* NOVO CAMPO: PROFISSIONAL */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Profissional *</label>
                    <div style={{ position: 'relative' }}>
                      <FiBriefcase style={{ position: 'absolute', left: '14px', top: '14px', color: '#9CA3AF' }} />
                      <select required value={formCliente.profissionalId} onChange={e => setFormCliente({...formCliente, profissionalId: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #D1D5DB', outline: 'none', appearance: 'none', background: '#fff' }}>
                        <option value="">Selecione...</option>
                        {dados.profissionais?.map(p => (
                          <option key={p.id || p.Id} value={p.id || p.Id}>{p.nome || p.Nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Data e Hora *</label>
                    <input type="datetime-local" required value={formCliente.dataHora} onChange={e => setFormCliente({...formCliente, dataHora: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #D1D5DB', outline: 'none' }} />
                  </div>

                  <div style={{ background: '#F3F4F6', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>Total a pagar</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111' }}>R$ {(servicoSelecionado.preco || servicoSelecionado.Preco || 0).toFixed(2)}</span>
                  </div>

                  <button type="submit" disabled={enviando} style={{ width: '100%', background: corMarca, color: '#fff', padding: '16px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', opacity: enviando ? 0.7 : 1 }}>
                    {enviando ? 'Confirmando...' : 'Confirmar Agendamento'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <FiCheckCircle size={64} color="#10B981" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.4rem', color: '#111', marginBottom: '8px' }}>Agendamento Confirmado!</h3>
                  <p style={{ color: '#6B7280', marginBottom: '24px' }}>Enviamos os detalhes para o WhatsApp do salão. Te esperamos lá!</p>
                  <button onClick={() => setServicoSelecionado(null)} style={{ background: '#F3F4F6', color: '#374151', padding: '12px 24px', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Fechar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}