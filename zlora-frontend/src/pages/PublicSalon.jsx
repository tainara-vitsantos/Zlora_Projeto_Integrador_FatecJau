import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiInstagram, FiMapPin, FiCalendar, FiX, FiUser, FiPhone, FiCheckCircle, FiBriefcase, FiChevronRight } from 'react-icons/fi';

export default function PublicSalon() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  
  // Estados do Cliente Logado (se já tiver conta salva no navegador)
  const [clienteLogado, setClienteLogado] = useState(null);

  // Estados para o fluxo de agendamento
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

        // Verifica se o cliente já tem uma sessão salva neste salão
        const telefoneSalvo = localStorage.getItem(`@Zlora:cli_${slug}`);
        if (telefoneSalvo) {
          const resPerfil = await fetch(`${API_URL}/api/publico/${slug}/cliente/${telefoneSalvo}`);
          if (resPerfil.ok) {
            const perfilData = await resPerfil.json();
            setClienteLogado(perfilData);
          } else {
            localStorage.removeItem(`@Zlora:cli_${slug}`);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }
    buscarDados();
  }, [slug]);

  if (carregando) return <div style={{ padding: '100px', textAlign: 'center', color: '#6B7280' }}>Carregando o salão...</div>;
  if (!dados) return <div style={{ padding: '100px', textAlign: 'center', color: '#DC2626' }}>Estabelecimento não encontrado.</div>;

  const corMarca = dados.empresa.corPrimaria || '#6F3CE7';
  
  const estiloCapa = dados.empresa.fotoCapaUrl 
    ? { backgroundImage: `url(${dados.empresa.fotoCapaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${corMarca} 0%, #1B1130 100%)` };

  // Função que abre o modal e PREENCHE os dados se o cliente já estiver logado
  const abrirAgendamento = (servico) => {
    setServicoSelecionado(servico);
    setEtapaAgendamento('form');
    setFormCliente({ 
      nome: clienteLogado?.nome || '', 
      telefone: clienteLogado?.telefone || '', 
      profissionalId: '', 
      dataHora: '' 
    });
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
      
      {/* 1. CABEÇALHO (CAPA) */}
      <header style={{ position: 'relative', marginBottom: '60px' }}>
        <div style={{ height: '260px', ...estiloCapa, borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px' }} />
        
        <div style={{ 
          position: 'absolute', left: '50%', bottom: '-65px', transform: 'translateX(-50%)',
          width: '130px', height: '130px', borderRadius: '50%', background: '#fff', 
          border: '6px solid #fff', boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {dados.empresa.logoUrl ? (
            <img src={dados.empresa.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '3.5rem', fontWeight: '800', color: corMarca, fontFamily: 'Outfit' }}>
              {dados.empresa.nome.charAt(0)}
            </span>
          )}
        </div>
      </header>

      {/* 2. INFORMAÇÕES DO ESTABELECIMENTO */}
      <div style={{ textAlign: 'center', padding: '0 20px', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.4rem', color: '#111', margin: '0 0 12px', fontFamily: 'Outfit', fontWeight: '800' }}>
          {dados.empresa.nome}
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {dados.empresa.endereco && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '15px', fontWeight: '500' }}>
              <FiMapPin color={corMarca} size={18} /> {dados.empresa.endereco}
            </span>
          )}
          {dados.empresa.instagram && (
            <a href={`https://instagram.com/${dados.empresa.instagram}`} target="_blank" rel="noreferrer" 
               style={{ display: 'flex', alignItems: 'center', gap: '6px', color: corMarca, fontSize: '15px', fontWeight: '600', textDecoration: 'none' }}>
              <FiInstagram size={18} /> @{dados.empresa.instagram}
            </a>
          )}
        </div>

        {/* BOTÃO INTELIGENTE DE CLIENTE */}
        <button 
          onClick={() => navigate(`/${slug}/cliente`)}
          style={{ 
            background: clienteLogado ? '#fff' : 'transparent', 
            border: `1.5px solid ${corMarca}`, 
            color: clienteLogado ? '#111' : corMarca, 
            padding: '12px 28px', borderRadius: '30px', fontWeight: '700', cursor: 'pointer', 
            fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            boxShadow: clienteLogado ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s'
          }}
        >
          <FiUser color={corMarca} /> 
          {clienteLogado ? `Olá, ${clienteLogado.nome.split(' ')[0]}. Ver meus agendamentos` : 'Acessar Área do Cliente'}
        </button>
      </div>

      {/* 3. LISTA DE SERVIÇOS EM GRID (ESTILO MODERNO) */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 100px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#111', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
          <FiCalendar color={corMarca} /> Nossos Serviços
        </h2>
        
        {/* GRID RESPONSIVO: 2 colunas no PC, 1 no celular */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {dados.servicos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1px dashed #D1D5DB', color: '#6B7280', gridColumn: '1 / -1' }}>
              <p>Este estabelecimento ainda não cadastrou serviços.</p>
            </div>
          ) : (
            dados.servicos.map(servico => (
              <div key={servico.id || servico.Id} style={{ 
                background: '#fff', borderRadius: '20px', padding: '24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s, boxShadow 0.2s'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                    {(servico.imagemUrl || servico.ImagemUrl) ? (
                      <img src={servico.imagemUrl || servico.ImagemUrl} alt={servico.nome} style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '14px', background: `${corMarca}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FiBriefcase color={corMarca} size={32} />
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#111', fontWeight: '700' }}>
                        {servico.nome || servico.Nome}
                      </h3>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {servico.descricao || servico.Descricao || 'Sem descrição.'}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9CA3AF', fontWeight: '600', marginBottom: '24px' }}>
                    <FiClock /> {servico.duracaoMinutos || servico.DuracaoMinutos} minutos
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111', fontFamily: 'Outfit' }}>
                    R$ {(servico.preco || servico.Preco || 0).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => abrirAgendamento(servico)}
                    style={{ 
                      background: corMarca, color: '#fff', border: 'none', 
                      padding: '12px 24px', borderRadius: '30px', fontWeight: '700', fontSize: '15px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: `0 4px 16px ${corMarca}40`, transition: 'transform 0.1s'
                    }}
                  >
                    Agendar <FiChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF', fontSize: '14px', borderTop: '1px solid #E5E7EB', background: '#fff' }}>
        Agendamento online feito com <strong style={{ color: corMarca, fontFamily: 'Outfit', fontSize: '16px' }}>Zlora</strong>
      </footer>

      {/* ========================================= */}
      {/* MODAL DE AGENDAMENTO PREMIUM */}
      {/* ========================================= */}
      {servicoSelecionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '28px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease-out' }}>
            
            <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: corMarca, letterSpacing: '1px' }}>Agendamento</p>
                <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#111', fontFamily: 'Outfit' }}>{servicoSelecionado.nome || servicoSelecionado.Nome}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '15px', color: '#6B7280' }}>R$ {(servicoSelecionado.preco || servicoSelecionado.Preco || 0).toFixed(2)} • {servicoSelecionado.duracaoMinutos || servicoSelecionado.DuracaoMinutos} min</p>
              </div>
              <button onClick={() => setServicoSelecionado(null)} style={{ background: '#F3F4F6', border: 0, color: '#6B7280', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px 32px 32px' }}>
              {etapaAgendamento === 'form' ? (
                <form onSubmit={confirmarAgendamento}>
                  
                  {/* Se o cliente já estiver logado, esconde os campos de nome e telefone e mostra só um resumo */}
                  {clienteLogado ? (
                    <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6B7280' }}>Agendando como:</p>
                      <p style={{ margin: 0, fontWeight: '700', color: '#111' }}>{clienteLogado.nome}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#6B7280' }}>{clienteLogado.telefone}</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>Seu Nome Completo</label>
                        <div style={{ position: 'relative' }}>
                          <FiUser style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} />
                          <input type="text" required placeholder="Ex: Maria Silva" value={formCliente.nome} onChange={e => setFormCliente({...formCliente, nome: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '15px', outline: 'none', transition: 'border 0.2s' }} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>Seu WhatsApp</label>
                        <div style={{ position: 'relative' }}>
                          <FiPhone style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} />
                          <input type="tel" required placeholder="(00) 00000-0000" value={formCliente.telefone} onChange={e => setFormCliente({...formCliente, telefone: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '15px', outline: 'none', transition: 'border 0.2s' }} />
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>Profissional</label>
                    <div style={{ position: 'relative' }}>
                      <FiBriefcase style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} />
                      <select required value={formCliente.profissionalId} onChange={e => setFormCliente({...formCliente, profissionalId: e.target.value})} style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '15px', outline: 'none', appearance: 'none', background: '#fff', cursor: 'pointer' }}>
                        <option value="">Escolha um profissional...</option>
                        {dados.profissionais?.map(p => (
                          <option key={p.id || p.Id} value={p.id || p.Id}>{p.nome || p.Nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>Data e Hora</label>
                    <input type="datetime-local" required value={formCliente.dataHora} onChange={e => setFormCliente({...formCliente, dataHora: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '15px', outline: 'none', cursor: 'pointer', color: '#374151' }} />
                  </div>

                  <button type="submit" disabled={enviando} style={{ width: '100%', background: corMarca, color: '#fff', padding: '18px', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: `0 8px 24px ${corMarca}40`, opacity: enviando ? 0.7 : 1, transition: 'transform 0.1s' }}>
                    {enviando ? 'Confirmando...' : 'Confirmar Agendamento'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <FiCheckCircle size={40} color="#16A34A" />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: '#111', marginBottom: '12px', fontFamily: 'Outfit', fontWeight: '800' }}>Tudo Certo!</h3>
                  <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '15px', lineHeight: '1.6' }}>Seu horário foi reservado com sucesso. Enviamos os detalhes para o WhatsApp do salão. Te esperamos lá!</p>
                  <button onClick={() => setServicoSelecionado(null)} style={{ background: '#F3F4F6', color: '#111', padding: '16px 32px', border: 'none', borderRadius: '16px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', width: '100%' }}>
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}