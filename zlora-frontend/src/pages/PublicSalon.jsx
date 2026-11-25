import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiInstagram, FiMapPin, FiCalendar, FiX, FiUser, FiCheckCircle, FiBriefcase, FiChevronRight, FiAlertCircle, FiArrowUpRight, FiPhone } from 'react-icons/fi';

import SeletorHorarios from '../components/SeletorHorarios/SeletorHorarios';
import SeletorData from '../components/SeletorData/SeletorData'; 
import './PublicSalon.css';

// Error Boundary (Mantido para evitar tela branca)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'monospace' }}>
          <h1 style={{ color: 'red' }}>Ops, ocorreu um erro na tela!</h1>
          <pre style={{ background: '#f4f4f4', padding: '20px', textAlign: 'left', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const hojeLocal = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
};

const formatarPreco = (valor) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(Number(valor) || 0);

function PublicSalonContent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [clienteLogado, setClienteLogado] = useState(null);

  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [etapaAgendamento, setEtapaAgendamento] = useState('');
  
  const [formCliente, setFormCliente] = useState({ nome: '', telefone: '', profissionalId: '' });
  
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  useEffect(() => {
    async function buscarDados() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/publico/${slug}`);
        if (!response.ok) throw new Error('Salão não encontrado');
        const data = await response.json();
        setDados(data);

        const telefoneSalvo = localStorage.getItem(`@Zilora:cli_${slug}`);
        if (telefoneSalvo) {
          const resPerfil = await fetch(`${API_URL}/api/publico/${slug}/cliente/${telefoneSalvo}`);
          if (resPerfil.ok) {
            const perfilData = await resPerfil.json();
            setClienteLogado(perfilData);
          } else {
            localStorage.removeItem(`@Zilora:cli_${slug}`);
          }
        }
      } catch (error) {
        console.error("Erro na API:", error);
      } finally {
        setCarregando(false);
      }
    }
    buscarDados();
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    async function buscarDisponibilidade() {
      if (!formCliente.profissionalId || !servicoSelecionado) {
        setDisponibilidade(null);
        return;
      }
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const servicoId = servicoSelecionado.id || servicoSelecionado.Id;
        const query = new URLSearchParams({
          servicoId,
          inicio: hojeLocal(),
          dias: '14',
          fusoMinutos: String(new Date().getTimezoneOffset()),
        });
        const response = await fetch(
          `${API_URL}/api/publico/${slug}/profissional/${formCliente.profissionalId}/disponibilidade?${query}`,
          { signal: controller.signal }
        );
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.mensagem || 'Não foi possível carregar a disponibilidade.');
        setDisponibilidade(resultado);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Erro ao buscar disponibilidade:', error);
        setDisponibilidade([]);
        setErroForm(error.message);
      }
    }
    buscarDisponibilidade();
    return () => controller.abort();
  }, [formCliente.profissionalId, servicoSelecionado, slug]);

  const disponibilidadeDoDia = useMemo(
    () => disponibilidade?.find((dia) => dia.data === dataSelecionada)?.horarios || [],
    [disponibilidade, dataSelecionada]
  );
  const datasDisponiveis = useMemo(
    () => disponibilidade === null
      ? null
      : disponibilidade.filter((dia) => dia.horarios.length > 0).map((dia) => dia.data),
    [disponibilidade]
  );

  if (carregando) {
    return <div className="public-salon-state"><span className="public-salon-state__spinner" />Carregando o salão...</div>;
  }
  if (!dados) {
    return <div className="public-salon-state public-salon-state--error">Estabelecimento não encontrado.</div>;
  }

  const empresa = dados.empresa || { nome: 'Salão', corPrimaria: '#6F3CE7' };
  const servicos = dados.servicos || [];
  const profissionais = dados.profissionais || [];
  const corMarca = empresa.corPrimaria || '#6F3CE7';
  
  const estiloCapa = empresa.fotoCapaUrl 
    ? { backgroundImage: `url(${empresa.fotoCapaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${corMarca} 0%, #1B1130 100%)` };

  const abrirAgendamento = (servico) => {
    setServicoSelecionado(servico);
    setEtapaAgendamento('form');
    setErroForm('');
    setDataSelecionada('');
    setHorarioSelecionado('');
    setFormCliente({ nome: clienteLogado?.nome || '', telefone: clienteLogado?.telefone || '', profissionalId: '' });
  };

  const confirmarAgendamento = async (e) => {
    e.preventDefault();
    setErroForm('');

    if (!dataSelecionada || !horarioSelecionado) {
      setErroForm('Por favor, selecione a data e o horário desejados.');
      return;
    }

    setEnviando(true);
    
    try {
      const dataHoraCompleta = new Date(`${dataSelecionada}T${horarioSelecionado}:00`);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/publico/${slug}/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formCliente.nome.trim(),
          telefone: formCliente.telefone.trim(),
          servicoId: servicoSelecionado.id || servicoSelecionado.Id,
          profissionalId: formCliente.profissionalId,
          dataHoraInicio: dataHoraCompleta.toISOString(),
          fusoMinutos: new Date().getTimezoneOffset()
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.mensagem || 'Erro ao agendar.');

      setEtapaAgendamento('sucesso');
    } catch (error) {
      setErroForm(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="public-salon-page" style={{ '--brand-color': corMarca }}>
      <header className="public-salon-header">
        <div className="public-salon-cover" style={estiloCapa} aria-hidden="true">
          <div className="public-salon-cover__overlay" />
        </div>

        <section className="public-salon-profile" aria-label={`Informações de ${empresa.nome}`}>
          <div className="public-salon-profile__main">
            <div className="public-salon-logo">
              {empresa.logoUrl
                ? <img src={empresa.logoUrl} alt={`Logo de ${empresa.nome}`} />
                : <span>{empresa.nome?.charAt(0) || 'S'}</span>}
            </div>
            <div className="public-salon-identity">
              <span className="public-salon-eyebrow">Bem-vindo ao</span>
              <h1>{empresa.nome}</h1>
              <p>Encontre seu próximo momento de cuidado.</p>
            </div>
            <button type="button" onClick={() => navigate(`/${slug}/cliente`)} className="public-salon-client-button">
              <FiUser aria-hidden="true" />
              <span>
                <small>Área do cliente</small>
                <strong>
                  {clienteLogado
                    ? `Olá, ${clienteLogado.nome.split(' ')[0]} · Meus agendamentos`
                    : 'Acessar Área do Cliente'}
                </strong>
              </span>
              <FiArrowUpRight className="public-salon-client-button__arrow" aria-hidden="true" />
            </button>
          </div>

          {(empresa.endereco || empresa.instagram || empresa.telefone) && (
            <div className="public-salon-contact-list">
              {empresa.endereco && (
                <div className="public-salon-contact">
                  <span className="public-salon-contact__icon"><FiMapPin aria-hidden="true" /></span>
                  <span className="public-salon-contact__copy">
                    <small>Endereço</small>
                    <strong>{empresa.endereco}</strong>
                  </span>
                </div>
              )}
              {empresa.instagram && (
                <a
                  className="public-salon-contact public-salon-contact--link"
                  href={`https://instagram.com/${empresa.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="public-salon-contact__icon"><FiInstagram aria-hidden="true" /></span>
                  <span className="public-salon-contact__copy">
                    <small>Instagram · Contato</small>
                    <strong>@{empresa.instagram.replace(/^@/, '')}</strong>
                  </span>
                  <FiArrowUpRight className="public-salon-contact__arrow" aria-hidden="true" />
                </a>
              )}
              {empresa.telefone && (
                <a className="public-salon-contact public-salon-contact--link" href={`tel:${empresa.telefone}`}>
                  <span className="public-salon-contact__icon"><FiPhone aria-hidden="true" /></span>
                  <span className="public-salon-contact__copy">
                    <small>Telefone</small>
                    <strong>{empresa.telefone}</strong>
                  </span>
                  <FiArrowUpRight className="public-salon-contact__arrow" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </section>
      </header>

      <main className="public-salon-main">
        <div className="public-salon-services-heading">
          <div>
            <span className="public-salon-eyebrow">Feito para você</span>
            <h2>Nossos serviços</h2>
            <p>Escolha um serviço e encontre o melhor horário para você.</p>
          </div>
          <span className="public-salon-service-count">
            {servicos.length} {servicos.length === 1 ? 'serviço' : 'serviços'}
          </span>
        </div>

        {servicos.length > 0 ? (
          <div className="public-salon-services">
            {servicos.map((servico) => {
              const nomeServico = servico.nome || servico.Nome;
              const duracao = servico.duracaoMinutos || servico.DuracaoMinutos || 30;
              const preco = servico.preco ?? servico.Preco;

              return (
                <article key={servico.id || servico.Id} className="public-service-card">
                  <div className="public-service-card__content">
                    <span className="public-service-card__icon"><FiBriefcase aria-hidden="true" /></span>
                    <div className="public-service-card__description">
                      <h3>{nomeServico}</h3>
                      <p>{servico.descricao || servico.Descricao || 'Um cuidado especial pensado para você.'}</p>
                    </div>
                  </div>

                  <div className="public-service-card__details">
                    <div className="public-service-card__price">
                      <small>Valor</small>
                      <strong>{formatarPreco(preco)}</strong>
                    </div>
                    <span className="public-service-card__duration">
                      <FiClock aria-hidden="true" /> {duracao} min
                    </span>
                  </div>

                  <button type="button" onClick={() => abrirAgendamento(servico)} className="public-service-card__book">
                    Agendar serviço <FiChevronRight aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="public-salon-empty">
            <span><FiCalendar aria-hidden="true" /></span>
            <h3>Nenhum serviço disponível no momento</h3>
            <p>Volte em breve para conferir as novidades deste estabelecimento.</p>
          </div>
        )}
      </main>

      <footer className="public-salon-footer">
        <span>Agendamento online feito com <strong>Zilora</strong></span>
        {empresa.instagram && (
          <a href={`https://instagram.com/${empresa.instagram}`} target="_blank" rel="noreferrer">
            <FiInstagram aria-hidden="true" /> @{empresa.instagram.replace(/^@/, '')}
          </a>
        )}
      </footer>

      {servicoSelecionado && (
        <div className="public-booking-overlay">
          <section className="public-booking-modal" role="dialog" aria-modal="true" aria-labelledby="public-booking-title">
            <header className="public-booking-header">
              <div>
                <span>Agendamento online</span>
                <h2 id="public-booking-title">{servicoSelecionado.nome || servicoSelecionado.Nome}</h2>
              </div>
              <button type="button" onClick={() => setServicoSelecionado(null)} className="public-booking-close" aria-label="Fechar agendamento">
                <FiX aria-hidden="true" />
              </button>
            </header>

            <div className="public-booking-body">
              {etapaAgendamento === 'form' ? (
                <form onSubmit={confirmarAgendamento} className="public-booking-form">
                  {erroForm && (
                    <div className="public-booking-error" role="alert">
                      <FiAlertCircle aria-hidden="true" /> {erroForm}
                    </div>
                  )}

                  {clienteLogado ? (
                    <div className="public-booking-client">
                      <span>Agendando como</span>
                      <strong>{clienteLogado.nome}</strong>
                      <small>{clienteLogado.telefone}</small>
                    </div>
                  ) : (
                    <>
                      <div className="public-booking-field">
                        <label htmlFor="public-booking-name">Seu nome completo</label>
                        <input
                          id="public-booking-name"
                          type="text"
                          required
                          placeholder="Ex: Maria Silva"
                          value={formCliente.nome}
                          onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
                        />
                      </div>
                      <div className="public-booking-field">
                        <label htmlFor="public-booking-phone">Seu WhatsApp</label>
                        <input
                          id="public-booking-phone"
                          type="tel"
                          required
                          placeholder="(00) 00000-0000"
                          value={formCliente.telefone}
                          onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="public-booking-field">
                    <label htmlFor="public-booking-professional">Profissional</label>
                    <select
                      id="public-booking-professional"
                      required
                      value={formCliente.profissionalId}
                      onChange={(e) => {
                        setFormCliente({ ...formCliente, profissionalId: e.target.value });
                        setDataSelecionada('');
                        setHorarioSelecionado('');
                      }}
                    >
                      <option value="">Escolha um profissional...</option>
                      {profissionais.map((p) => (
                        <option key={p.id || p.Id} value={p.id || p.Id}>{p.nome || p.Nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="public-booking-field">
                    <label>Escolha o dia</label>
                    <SeletorData
                      horariosProfissional={disponibilidade === null ? null : { carregado: true }}
                      datasDisponiveis={datasDisponiveis}
                      dataSelecionada={dataSelecionada}
                      onChangeData={(data) => {
                        setDataSelecionada(data);
                        setHorarioSelecionado('');
                      }}
                      corMarca={corMarca}
                    />
                  </div>

                  <div className="public-booking-field public-booking-field--slots">
                    <SeletorHorarios
                      dataSelecionada={dataSelecionada}
                      duracaoMinutos={servicoSelecionado.duracaoMinutos || servicoSelecionado.DuracaoMinutos || 30}
                      horariosDisponiveis={disponibilidadeDoDia}
                      horarioSelecionado={horarioSelecionado}
                      onChangeHorario={setHorarioSelecionado}
                      corMarca={corMarca}
                    />
                  </div>

                  <button type="submit" disabled={enviando} className="public-booking-submit">
                    {enviando ? 'Confirmando...' : 'Confirmar agendamento'}
                  </button>
                </form>
              ) : (
                <div className="public-booking-success">
                  <span><FiCheckCircle aria-hidden="true" /></span>
                  <h3>Tudo certo!</h3>
                  <p>Seu horário foi reservado com sucesso. Te esperamos lá!</p>
                  <button type="button" onClick={() => setServicoSelecionado(null)}>Fechar</button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function PublicSalon() {
  return (
    <ErrorBoundary>
      <PublicSalonContent />
    </ErrorBoundary>
  );
}