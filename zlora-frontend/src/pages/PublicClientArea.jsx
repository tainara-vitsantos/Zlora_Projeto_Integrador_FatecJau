import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiCalendar, FiClock, FiXCircle, FiArrowLeft, FiLogOut } from 'react-icons/fi';

export default function PublicClientArea() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [etapa, setEtapa] = useState(localStorage.getItem(`@Zlora:cli_${slug}`) ? 'painel' : 'login');
  const [abaAuth, setAbaAuth] = useState('login'); // 'login' ou 'cadastro'
  const [abaPainel, setAbaPainel] = useState('proximos');
  
  const [perfil, setPerfil] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [salonInfo, setSalonInfo] = useState({ nome: '', corMarca: '#6F3CE7' });
  
  // Estados dos formulários
  const [loginTelefone, setLoginTelefone] = useState('');
  const [formCadastro, setFormCadastro] = useState({ nome: '', telefone: '', email: '' });

  useEffect(() => {
    async function getSalon() {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/publico/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setSalonInfo({ nome: data.empresa.nome, corMarca: data.empresa.corPrimaria || '#6F3CE7' });
      }
    }
    getSalon();
  }, [slug]);

  useEffect(() => {
    const salvo = localStorage.getItem(`@Zlora:cli_${slug}`);
    if (salvo) {
      setLoginTelefone(salvo);
      carregarDados(salvo);
    }
  }, [slug]);

  const carregarDados = async (telefone) => {
    setLoading(true);
    setErro('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      const [resPerfil, resAgendamentos] = await Promise.all([
        fetch(`${API_URL}/api/publico/${slug}/cliente/${telefone}`),
        fetch(`${API_URL}/api/publico/${slug}/meus-agendamentos?telefone=${telefone}`)
      ]);

      if (!resPerfil.ok) {
        localStorage.removeItem(`@Zlora:cli_${slug}`);
        setEtapa('login');
        setAbaAuth('login');
        throw new Error('Cadastro não encontrado. Faça login ou crie uma conta.');
      }
      
      const perfilData = await resPerfil.json();
      const agendamentosData = await resAgendamentos.json();

      setPerfil(perfilData);
      setAgendamentos(agendamentosData);
      localStorage.setItem(`@Zlora:cli_${slug}`, telefone);
      setEtapa('painel');
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginTelefone.length < 10) return setErro('Informe um telefone válido.');
    carregarDados(loginTelefone);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (formCadastro.telefone.length < 10) return setErro('Informe um WhatsApp válido.');
    
    setLoading(true);
    setErro('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_URL}/api/publico/${slug}/cadastrar-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCadastro)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || 'Erro ao criar conta.');

      // Se cadastrou com sucesso, faz login automático
      setSucesso('Conta criada com sucesso! Entrando...');
      setTimeout(() => {
        carregarDados(formCadastro.telefone);
      }, 1500);
      
    } catch (error) {
      setErro(error.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`@Zlora:cli_${slug}`);
    setPerfil(null);
    setAgendamentos([]);
    setEtapa('login');
    setLoginTelefone('');
  };

  const cancelarAgendamento = async (id) => {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_URL}/api/publico/${slug}/agendamentos/${id}/cancelar?telefone=${loginTelefone}`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Erro ao cancelar.');
      carregarDados(loginTelefone); 
    } catch (error) {
      alert(error.message);
    }
  };

  const formatarData = (dataString) => new Date(dataString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  const agora = new Date();
  const proximos = agendamentos.filter(a => a.status !== 'cancelado' && new Date(a.dataHoraInicio) >= agora);
  const historico = agendamentos.filter(a => a.status === 'cancelado' || new Date(a.dataHoraInicio) < agora);

  // ==========================================
  // TELA DE CADASTRO / LOGIN
  // ==========================================
  if (etapa === 'login') {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '40px 24px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link to={`/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', textDecoration: 'none', fontSize: '14px', marginBottom: '20px' }}>
              <FiArrowLeft /> Voltar ao salão
            </Link>
            <h2 style={{ fontSize: '1.5rem', color: '#111', margin: '0 0 8px' }}>Bem-vindo(a)</h2>
            <p style={{ color: '#6B7280', margin: 0 }}>Acesse seus agendamentos em <strong>{salonInfo.nome}</strong>.</p>
          </div>

          {/* Abas Login/Cadastro */}
          <div style={{ display: 'flex', background: '#F3F4F6', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
            <button onClick={() => { setAbaAuth('login'); setErro(''); setSucesso(''); }} style={{ flex: 1, padding: '10px', border: 0, borderRadius: '8px', background: abaAuth === 'login' ? '#fff' : 'transparent', fontWeight: 'bold', color: abaAuth === 'login' ? '#111' : '#6B7280', boxShadow: abaAuth === 'login' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>Entrar</button>
            <button onClick={() => { setAbaAuth('cadastro'); setErro(''); setSucesso(''); }} style={{ flex: 1, padding: '10px', border: 0, borderRadius: '8px', background: abaAuth === 'cadastro' ? '#fff' : 'transparent', fontWeight: 'bold', color: abaAuth === 'cadastro' ? '#111' : '#6B7280', boxShadow: abaAuth === 'cadastro' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>Criar Conta</button>
          </div>

          {erro && <p style={{ color: '#DC2626', marginBottom: '16px', fontSize: '13px', textAlign: 'center', background: '#FEE2E2', padding: '10px', borderRadius: '8px' }}>{erro}</p>}
          {sucesso && <p style={{ color: '#16A34A', marginBottom: '16px', fontSize: '13px', textAlign: 'center', background: '#DCFCE7', padding: '10px', borderRadius: '8px' }}>{sucesso}</p>}

          {/* FORMULÁRIO DE LOGIN */}
          {abaAuth === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <FiPhone style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} />
                <input type="tel" placeholder="Seu WhatsApp (DDD + número)" value={loginTelefone} onChange={e => setLoginTelefone(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: salonInfo.corMarca, color: '#fff', padding: '16px', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Buscando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            /* FORMULÁRIO DE CADASTRO */
            <form onSubmit={handleCadastro}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <FiUser style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} />
                <input type="text" required placeholder="Seu nome completo" value={formCadastro.nome} onChange={e => setFormCadastro({...formCadastro, nome: e.target.value})} style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none' }} />
              </div>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <FiPhone style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} />
                <input type="tel" required placeholder="Seu WhatsApp (DDD + número)" value={formCadastro.telefone} onChange={e => setFormCadastro({...formCadastro, telefone: e.target.value})} style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none' }} />
              </div>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <FiMail style={{ position: 'absolute', left: '16px', top: '16px', color: '#9CA3AF' }} />
                <input type="email" placeholder="Seu e-mail (opcional)" value={formCadastro.email} onChange={e => setFormCadastro({...formCadastro, email: e.target.value})} style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: salonInfo.corMarca, color: '#fff', padding: '16px', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA DO PAINEL (LOGADO)
  // ==========================================
  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <header style={{ background: salonInfo.corMarca, padding: '24px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Olá, {perfil?.nome.split(' ')[0]}</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>{salonInfo.nome}</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 0, color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiLogOut /> Sair
        </button>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>
        <button onClick={() => navigate(`/${slug}`)} style={{ width: '100%', background: '#fff', border: `1px solid ${salonInfo.corMarca}`, color: salonInfo.corMarca, padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <FiCalendar /> Fazer Novo Agendamento
        </button>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#E5E7EB', padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setAbaPainel('proximos')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 0, background: abaPainel === 'proximos' ? '#fff' : 'transparent', fontWeight: 'bold', color: abaPainel === 'proximos' ? '#111' : '#6B7280', boxShadow: abaPainel === 'proximos' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>
            Próximos ({proximos.length})
          </button>
          <button onClick={() => setAbaPainel('historico')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 0, background: abaPainel === 'historico' ? '#fff' : 'transparent', fontWeight: 'bold', color: abaPainel === 'historico' ? '#111' : '#6B7280', boxShadow: abaPainel === 'historico' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>
            Histórico ({historico.length})
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6B7280' }}>Carregando...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(abaPainel === 'proximos' ? proximos : historico).map(ag => (
              <div key={ag.id} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111' }}>{ag.servicoNome}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>Com {ag.profissionalNome}</p>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', background: ag.status === 'cancelado' ? '#FEE2E2' : '#DCFCE7', color: ag.status === 'cancelado' ? '#991B1B' : '#166534' }}>
                    {ag.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: salonInfo.corMarca, fontWeight: '600', fontSize: '14px', marginTop: '8px' }}>
                  <FiClock /> {formatarData(ag.dataHoraInicio)}
                </div>
                
                {abaPainel === 'proximos' && (
                  <button onClick={() => cancelarAgendamento(ag.id)} style={{ marginTop: '12px', background: 'transparent', border: '1px solid #FCA5A5', color: '#DC2626', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FiXCircle /> Cancelar Agendamento
                  </button>
                )}
              </div>
            ))}
            
            {(abaPainel === 'proximos' ? proximos : historico).length === 0 && (
              <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px 0' }}>Nenhum agendamento encontrado.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}