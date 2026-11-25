import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiUser, FiPhone, FiMail, FiCalendar, FiClock, 
  FiXCircle, FiChevronLeft, FiLogOut, FiAlertCircle, 
  FiCheckCircle, FiLoader, FiScissors, FiX, FiArrowUpRight
} from 'react-icons/fi';

import './PublicClientArea.css';

// Função para formatar o telefone
const formatarTelefone = (valor) => {
  let v = valor.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 10) {
    return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    return v;
  }
};

const obterIniciais = (nome = '') =>
  nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase() || 'CL';

const formatarDataAgendamento = (dataString) => {
  const data = new Date(dataString);
  if (Number.isNaN(data.getTime())) return { dia: '--', mes: '', semana: '' };
  return {
    dia: data.toLocaleDateString('pt-BR', { day: '2-digit' }),
    mes: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    semana: data.toLocaleDateString('pt-BR', { weekday: 'long' })
  };
};

const formatarHora = (dataString) => {
  const data = new Date(dataString);
  return Number.isNaN(data.getTime())
    ? '--:--'
    : data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const rotuloStatus = (status) => ({
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
}[String(status || '').toLowerCase()] || status || 'Status não informado');

export default function PublicClientArea() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [etapa, setEtapa] = useState(localStorage.getItem(`@Zilora:cli_${slug}`) ? 'painel' : 'login');
  const [abaAuth, setAbaAuth] = useState('login'); 
  const [abaPainel, setAbaPainel] = useState('proximos');
  
  const [perfil, setPerfil] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [feedback, setFeedback] = useState({ tipo: '', texto: '' });
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salonInfo, setSalonInfo] = useState({ nome: 'Carregando...', corMarca: '#6F3CE7', logoUrl: '' });
  
  const [loginTelefone, setLoginTelefone] = useState('');
  const [formCadastro, setFormCadastro] = useState({ nome: '', telefone: '', email: '' });

  // 1. BUSCAR INFO DO SALÃO
  useEffect(() => {
    async function getSalon() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/publico/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setSalonInfo({
            nome: data.empresa.nome,
            corMarca: data.empresa.corPrimaria || '#6F3CE7',
            logoUrl: data.empresa.logoUrl || ''
          });
        }
      } catch (error) {
        console.error("Erro ao buscar salão", error);
      }
    }
    getSalon();
  }, [slug]);

  // 2. CARREGAR DADOS DO CLIENTE
  const carregarDados = useCallback(async (telefone) => {
    setLoading(true);
    setErro('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      const [resPerfil, resAgendamentos] = await Promise.all([
        fetch(`${API_URL}/api/publico/${slug}/cliente/${encodeURIComponent(telefone)}`),
        fetch(`${API_URL}/api/publico/${slug}/meus-agendamentos?telefone=${encodeURIComponent(telefone)}`)
      ]);

      if (!resPerfil.ok) {
        localStorage.removeItem(`@Zilora:cli_${slug}`);
        setEtapa('login');
        setAbaAuth('login');
        throw new Error('Cadastro não encontrado. Faça login ou crie uma conta.');
      }
      if (!resAgendamentos.ok) {
        throw new Error('Não foi possível carregar seus agendamentos. Tente novamente.');
      }
      
      const perfilData = await resPerfil.json();
      const agendamentosData = await resAgendamentos.json();

      setPerfil(perfilData);
      setAgendamentos(agendamentosData);
      localStorage.setItem(`@Zilora:cli_${slug}`, telefone);
      setEtapa('painel');
      return true;
    } catch (error) {
      setErro(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Verifica se o cliente já tem sessão salva ao montar
  useEffect(() => {
    const salvo = localStorage.getItem(`@Zilora:cli_${slug}`);
    if (salvo) {
      setLoginTelefone(salvo);
      carregarDados(salvo);
    }
  }, [slug, carregarDados]);

  useEffect(() => {
    if (!agendamentoParaCancelar) return undefined;
    const fecharComEsc = (event) => {
      if (event.key === 'Escape' && !cancelando) {
        setAgendamentoParaCancelar(null);
        setFeedback({ tipo: '', texto: '' });
      }
    };
    window.addEventListener('keydown', fecharComEsc);
    return () => window.removeEventListener('keydown', fecharComEsc);
  }, [agendamentoParaCancelar, cancelando]);

  // 3. AÇÕES DE AUTENTICAÇÃO
  const handleLogin = (e) => {
    e.preventDefault();
    if (loading) return;
    const numeros = loginTelefone.replace(/\D/g, '');
    setSucesso('');
    if (numeros.length < 10) return setErro('Informe um telefone válido com DDD.');
    carregarDados(numeros);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (loading) return;
    const nome = formCadastro.nome.trim();
    const numeros = formCadastro.telefone.replace(/\D/g, '');
    setSucesso('');
    if (!nome) return setErro('Informe seu nome completo.');
    if (numeros.length < 10) return setErro('Informe um WhatsApp válido com DDD.');
    
    setLoading(true);
    setErro('');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_URL}/api/publico/${slug}/cadastrar-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formCadastro, nome, telefone: numeros, email: formCadastro.email.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || 'Erro ao criar conta.');

      setSucesso('Conta criada com sucesso! Entrando...');
      setTimeout(() => carregarDados(numeros), 1500);
      
    } catch (error) {
      setErro(error.message);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`@Zilora:cli_${slug}`);
    setPerfil(null);
    setAgendamentos([]);
    setEtapa('login');
    setLoginTelefone('');
    setErro('');
    setSucesso('');
  };

  const cancelarAgendamento = (id) => {
    setFeedback({ tipo: '', texto: '' });
    setAgendamentoParaCancelar(agendamentos.find((agendamento) => agendamento.id === id) || null);
  };

  const confirmarCancelamento = async () => {
    if (!agendamentoParaCancelar || cancelando) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    setCancelando(true);
    setFeedback({ tipo: '', texto: '' });
    try {
      const telefone = loginTelefone.replace(/\D/g, '');
      const res = await fetch(`${API_URL}/api/publico/${slug}/agendamentos/${agendamentoParaCancelar.id}/cancelar?telefone=${encodeURIComponent(telefone)}`, {
        method: 'PATCH'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.mensagem || 'Não foi possível cancelar o agendamento.');

      const atualizado = await carregarDados(telefone);
      setAgendamentoParaCancelar(null);
      setFeedback(atualizado
        ? { tipo: 'sucesso', texto: 'Agendamento cancelado com sucesso.' }
        : { tipo: 'erro', texto: 'Agendamento cancelado, mas não foi possível atualizar a lista. Recarregue a página.' });
    } catch (error) {
      setFeedback({ tipo: 'erro', texto: error.message || 'Não foi possível cancelar o agendamento.' });
    } finally {
      setCancelando(false);
    }
  };

  // 4. SEPARAÇÃO DOS AGENDAMENTOS
  const { proximos, historico } = useMemo(() => {
    const agora = new Date();
    return {
      proximos: agendamentos.filter(a => a.status !== 'cancelado' && new Date(a.dataHoraInicio) >= agora),
      historico: agendamentos.filter(a => a.status === 'cancelado' || new Date(a.dataHoraInicio) < agora)
    };
  }, [agendamentos]);

  // ==========================================
  // TELA DE CADASTRO / LOGIN
  // ==========================================
  if (etapa === 'login') {
    return (
      <div className="client-auth-page" style={{ '--brand-color': salonInfo.corMarca }}>
        <main className="client-auth-shell">
          <div className="client-auth-topbar">
            <Link to={`/${slug}`} className="client-auth-back">
              <FiChevronLeft aria-hidden="true" />
              <span>Voltar ao salão</span>
            </Link>
            <span className="client-auth-platform">Zilora <span>·</span> Portal do cliente</span>
          </div>

          <section className="client-auth-card" aria-labelledby="client-auth-title">
            <header className="client-auth-header">
              <div className="client-auth-establishment">
                {salonInfo.logoUrl ? (
                  <img src={salonInfo.logoUrl} alt={`Logo de ${salonInfo.nome}`} className="client-auth-establishment__logo" />
                ) : (
                  <span className="client-auth-establishment__mark"><FiScissors aria-hidden="true" /></span>
                )}
                <span className="client-auth-establishment__copy">
                  <span>Agendamentos em</span>
                  <strong>{salonInfo.nome}</strong>
                </span>
              </div>
              <h1 id="client-auth-title">Área do Cliente</h1>
              <p>Acesse sua conta para acompanhar seus agendamentos.</p>
            </header>

            <div className="client-auth-tabs" role="tablist" aria-label="Acesso à conta">
              <button
                type="button"
                role="tab"
                aria-selected={abaAuth === 'login'}
                onClick={() => { setAbaAuth('login'); setErro(''); setSucesso(''); }}
                className={abaAuth === 'login' ? 'is-active' : ''}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={abaAuth === 'cadastro'}
                onClick={() => { setAbaAuth('cadastro'); setErro(''); setSucesso(''); }}
                className={abaAuth === 'cadastro' ? 'is-active' : ''}
              >
                Criar conta
              </button>
            </div>

            {erro && (
              <div id="client-auth-feedback" className="client-auth-feedback client-auth-feedback--error" role="alert">
                <FiAlertCircle aria-hidden="true" />
                <span>{erro}</span>
              </div>
            )}
            {sucesso && (
              <div className="client-auth-feedback client-auth-feedback--success" role="status">
                <FiCheckCircle aria-hidden="true" />
                <span>{sucesso}</span>
              </div>
            )}

            {abaAuth === 'login' ? (
              <form key="login" onSubmit={handleLogin} className="client-auth-form">
                <div className="client-auth-field">
                  <label htmlFor="client-login-phone">WhatsApp com DDD</label>
                  <div className="client-auth-input">
                    <FiPhone aria-hidden="true" />
                    <input
                      id="client-login-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      value={loginTelefone}
                      required
                      aria-describedby="client-login-phone-help"
                      onChange={(e) => {
                        setLoginTelefone(formatarTelefone(e.target.value));
                        if (erro) setErro('');
                      }}
                    />
                  </div>
                  <span id="client-login-phone-help" className="client-auth-field-help">Use o número informado no seu cadastro.</span>
                </div>
                <button type="submit" disabled={loading} className="client-auth-submit">
                  {loading
                    ? <><FiLoader className="spin" aria-hidden="true" /> Buscando sua conta...</>
                    : <><span>Acessar meus agendamentos</span><FiArrowUpRight aria-hidden="true" /></>}
                </button>
              </form>
            ) : (
              <form key="cadastro" onSubmit={handleCadastro} className="client-auth-form">
                <div className="client-auth-field">
                  <label htmlFor="client-register-name">Nome completo</label>
                  <div className="client-auth-input">
                    <FiUser aria-hidden="true" />
                    <input
                      id="client-register-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Como podemos chamar você?"
                      value={formCadastro.nome}
                      onChange={(e) => {
                        setFormCadastro({ ...formCadastro, nome: e.target.value });
                        if (erro) setErro('');
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="client-auth-field">
                  <label htmlFor="client-register-phone">WhatsApp com DDD</label>
                  <div className="client-auth-input">
                    <FiPhone aria-hidden="true" />
                    <input
                      id="client-register-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      value={formCadastro.telefone}
                      onChange={(e) => {
                        setFormCadastro({ ...formCadastro, telefone: formatarTelefone(e.target.value) });
                        if (erro) setErro('');
                      }}
                      required
                    />
                  </div>
                  <span className="client-auth-field-help">Enviaremos a confirmação dos seus horários para este número.</span>
                </div>
                <div className="client-auth-field">
                  <label htmlFor="client-register-email">E-mail <span>(opcional)</span></label>
                  <div className="client-auth-input">
                    <FiMail aria-hidden="true" />
                    <input
                      id="client-register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@email.com"
                      value={formCadastro.email}
                      onChange={(e) => {
                        setFormCadastro({ ...formCadastro, email: e.target.value });
                        if (erro) setErro('');
                      }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="client-auth-submit">
                  {loading
                    ? <><FiLoader className="spin" aria-hidden="true" /> Criando sua conta...</>
                    : <><span>Criar minha conta</span><FiArrowUpRight aria-hidden="true" /></>}
                </button>
              </form>
            )}

            <footer className="client-auth-card-footer">
              <span>Seus próximos horários e histórico ficam disponíveis em um só lugar.</span>
            </footer>
          </section>

          <p className="client-auth-footer">Agendamento online feito com <strong>Zilora</strong></p>
        </main>
      </div>
    );
  }

  // ==========================================
  // TELA DO PAINEL (LOGADO)
  // ==========================================
  return (
    <div className="client-dashboard-page" style={{ '--brand-color': salonInfo.corMarca }}>
      <header className="client-header">
        <div className="client-header__inner">
          <div className="client-brand">
            <span className="client-brand__mark"><FiScissors aria-hidden="true" /></span>
            <div className="client-brand__copy">
              <span className="client-brand__eyebrow">Seus cuidados, em um só lugar</span>
              <strong>{salonInfo.nome}</strong>
            </div>
          </div>

          <div className="client-account">
            <span className="client-account__avatar" aria-hidden="true">{obterIniciais(perfil?.nome)}</span>
            <div className="client-account__copy">
              <span>Área do cliente</span>
              <strong>{perfil?.nome || 'Cliente'}</strong>
            </div>
            <button type="button" onClick={handleLogout} className="client-logout" aria-label="Sair da sua conta">
              <FiLogOut aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="client-dashboard-main">
        <section className="client-dashboard-intro">
          <div>
            <p className="client-dashboard-eyebrow">
              {perfil?.nome?.trim() ? `Olá, ${perfil.nome.trim().split(/\s+/)[0]}!` : 'Olá!'}
            </p>
            <h1>Meus agendamentos</h1>
            <p className="client-dashboard-description">
              Acompanhe seus próximos horários e consulte o histórico dos seus atendimentos.
            </p>
          </div>
          <button type="button" onClick={() => navigate(`/${slug}`)} className="client-new-appointment">
            <FiCalendar aria-hidden="true" />
            <span>Realizar novo agendamento</span>
            <FiArrowUpRight className="client-new-appointment__arrow" aria-hidden="true" />
          </button>
        </section>

        {feedback.texto && !agendamentoParaCancelar && (
          <div className={`client-feedback client-feedback--${feedback.tipo}`} role={feedback.tipo === 'erro' ? 'alert' : 'status'}>
            {feedback.tipo === 'erro' ? <FiAlertCircle aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}
            <span>{feedback.texto}</span>
            <button type="button" onClick={() => setFeedback({ tipo: '', texto: '' })} aria-label="Fechar mensagem">
              <FiX aria-hidden="true" />
            </button>
          </div>
        )}

        <section className="client-appointments-section" aria-label="Lista de agendamentos">
          <div className="client-tabs" role="tablist" aria-label="Filtrar agendamentos">
            <button
              type="button"
              role="tab"
              aria-selected={abaPainel === 'proximos'}
              onClick={() => setAbaPainel('proximos')}
              className={abaPainel === 'proximos' ? 'is-active' : ''}
            >
              Próximos <span>{proximos.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={abaPainel === 'historico'}
              onClick={() => setAbaPainel('historico')}
              className={abaPainel === 'historico' ? 'is-active' : ''}
            >
              Histórico <span>{historico.length}</span>
            </button>
          </div>

          {erro && etapa === 'painel' && (
            <div className="client-feedback client-feedback--erro" role="alert">
              <FiAlertCircle aria-hidden="true" />
              <span>{erro}</span>
              <button type="button" onClick={() => carregarDados(loginTelefone.replace(/\D/g, ''))} aria-label="Tentar carregar novamente">
                Tentar novamente
              </button>
            </div>
          )}

          {loading ? (
            <div className="client-loading-state" role="status">
              <FiLoader className="client-spin" size={28} aria-hidden="true" />
              <p>Carregando seus agendamentos...</p>
            </div>
          ) : (
            <div className="client-appointments-list">
              {(abaPainel === 'proximos' ? proximos : historico).map((ag) => {
                const isCancelado = String(ag.status).toLowerCase() === 'cancelado';
                const data = formatarDataAgendamento(ag.dataHoraInicio);
                const statusClass = String(ag.status || '').toLowerCase().replace(/[^a-z]/g, '');

                return (
                  <article key={ag.id} className={`client-appointment-card${isCancelado ? ' is-cancelled' : ''}`}>
                    <div className="client-appointment-card__top">
                      <div className="client-appointment-service">
                        <span className="client-appointment-service__icon"><FiScissors aria-hidden="true" /></span>
                        <div>
                          <span className="client-card-eyebrow">Serviço</span>
                          <h2>{ag.servicoNome || 'Atendimento'}</h2>
                        </div>
                      </div>
                      <span className={`client-status client-status--${statusClass}`}>
                        <span aria-hidden="true" />
                        {rotuloStatus(ag.status)}
                      </span>
                    </div>

                    <div className="client-appointment-card__details">
                      <div className="client-appointment-professional">
                        <FiUser aria-hidden="true" />
                        <div>
                          <span className="client-card-eyebrow">Profissional</span>
                          <strong>{ag.profissionalNome || 'A definir'}</strong>
                        </div>
                      </div>

                      <div className="client-appointment-date">
                        <span className="client-date-tile" aria-hidden="true">
                          <strong>{data.dia}</strong>
                          <span>{data.mes}</span>
                        </span>
                        <div>
                          <span className="client-card-eyebrow">{data.semana}</span>
                          <strong><FiClock aria-hidden="true" /> {formatarHora(ag.dataHoraInicio)}</strong>
                        </div>
                      </div>
                    </div>

                    {abaPainel === 'proximos' && !isCancelado && (
                      <div className="client-appointment-card__actions">
                        <button type="button" onClick={() => cancelarAgendamento(ag.id)} className="client-cancel-button">
                          <FiXCircle aria-hidden="true" /> Cancelar agendamento
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}

              {(abaPainel === 'proximos' ? proximos : historico).length === 0 && (
                <div className="client-empty-state">
                  <span className="client-empty-state__icon"><FiCalendar aria-hidden="true" /></span>
                  <h2>Nenhum agendamento {abaPainel === 'proximos' ? 'por enquanto' : 'no histórico'}</h2>
                  <p>
                    {abaPainel === 'proximos'
                      ? 'Quando você marcar um horário, ele aparecerá aqui.'
                      : 'Seus atendimentos anteriores e cancelamentos aparecerão aqui.'}
                  </p>
                  {abaPainel === 'proximos' && (
                    <button type="button" onClick={() => navigate(`/${slug}`)} className="client-empty-state__link">
                      Escolher um horário <FiArrowUpRight aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {agendamentoParaCancelar && (
        <div
          className="client-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !cancelando) {
              setAgendamentoParaCancelar(null);
              setFeedback({ tipo: '', texto: '' });
            }
          }}
        >
          <section className="client-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
            <button
              type="button"
              className="client-modal-close"
              onClick={() => {
                if (!cancelando) {
                  setAgendamentoParaCancelar(null);
                  setFeedback({ tipo: '', texto: '' });
                }
              }}
              aria-label="Fechar"
              disabled={cancelando}
            >
              <FiX aria-hidden="true" />
            </button>
            <span className="client-modal-icon"><FiAlertCircle aria-hidden="true" /></span>
            <h2 id="cancel-modal-title">Cancelar agendamento?</h2>
            <p>
              Você está prestes a cancelar <strong>{agendamentoParaCancelar.servicoNome || 'seu atendimento'}</strong>
              {' '}em {formatarDataAgendamento(agendamentoParaCancelar.dataHoraInicio).dia}/
              {formatarDataAgendamento(agendamentoParaCancelar.dataHoraInicio).mes}, às {formatarHora(agendamentoParaCancelar.dataHoraInicio)}.
            </p>
            <p className="client-modal-note">Essa ação não pode ser desfeita.</p>

            {feedback.tipo === 'erro' && (
              <div className="client-feedback client-feedback--erro client-modal-feedback" role="alert">
                <FiAlertCircle aria-hidden="true" /> <span>{feedback.texto}</span>
              </div>
            )}

            <div className="client-modal-actions">
              <button
                type="button"
                className="client-modal-secondary"
                onClick={() => {
                  setAgendamentoParaCancelar(null);
                  setFeedback({ tipo: '', texto: '' });
                }}
                disabled={cancelando}
              >
                Manter agendamento
              </button>
              <button type="button" className="client-modal-confirm" onClick={confirmarCancelamento} disabled={cancelando}>
                {cancelando ? <><FiLoader className="client-spin" aria-hidden="true" /> Cancelando...</> : 'Sim, cancelar'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}