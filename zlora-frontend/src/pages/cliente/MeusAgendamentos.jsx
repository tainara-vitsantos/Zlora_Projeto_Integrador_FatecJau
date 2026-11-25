import { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiClock, FiBriefcase, FiMapPin, FiXCircle, FiAlertCircle, FiScissors } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

// IMPORTANDO O CSS DA AGENDA PARA REAPROVEITAR O VISUAL DA LISTA
import '../dashboard/Agenda.css'; 
import './MeusAgendamentos.css';

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('proximos'); // 'proximos' ou 'historico'
  const [cancelando, setCancelando] = useState('');

  const carregarAgendamentos = async () => {
    try {
      const data = await api.request('/api/agendamentos/meus');
      setAgendamentos(data);
    } catch (error) {
      console.error("Erro ao buscar meus agendamentos:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const cancelarAgendamento = async (id) => {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;
    
    try {
      setCancelando(id);
      await api.request(`/api/agendamentos/${id}/cancelar`, { method: 'PATCH' });
      await carregarAgendamentos();
    } catch (error) {
      alert("Erro ao cancelar agendamento.");
    } finally {
      setCancelando('');
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const formatarHora = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const agendamentosFiltrados = useMemo(() => {
    const agora = new Date();
    
    return agendamentos.filter(ag => {
      const dataAgendamento = new Date(ag.dataHoraInicio);
      const isFuturo = dataAgendamento >= agora && ag.status !== 'cancelado' && ag.status !== 'concluido';
      
      if (abaAtiva === 'proximos') return isFuturo;
      return !isFuturo;
    }).sort((a, b) => {
      const dataA = new Date(a.dataHoraInicio).getTime();
      const dataB = new Date(b.dataHoraInicio).getTime();
      return abaAtiva === 'proximos' ? dataA - dataB : dataB - dataA;
    });
  }, [agendamentos, abaAtiva]);

  if (carregando) {
    return (
      <div className="agenda-page">
        <div className="agenda-loading">
          <span className="agenda-loader" />
          <p>Carregando seus agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agenda-page meus-agendamentos-page">
      
      <header className="agenda-page-header">
        <div>
          <span className="agenda-eyebrow">ÁREA DO CLIENTE</span>
          <h1>Meus Agendamentos</h1>
          <p>Acompanhe os horários que você marcou.</p>
        </div>
        <Link to="/" className="agenda-btn agenda-btn--primary">
          <FiCalendar /> Novo Agendamento
        </Link>
      </header>

      {/* ABAS CUSTOMIZADAS */}
      <div className="meus-agendamentos-tabs">
        <button 
          className={abaAtiva === 'proximos' ? 'active' : ''} 
          onClick={() => setAbaAtiva('proximos')}
        >
          Próximos
        </button>
        <button 
          className={abaAtiva === 'historico' ? 'active' : ''} 
          onClick={() => setAbaAtiva('historico')}
        >
          Histórico
        </button>
      </div>

      <section className="agenda-panel">
        {agendamentosFiltrados.length === 0 ? (
          <div className="agenda-empty">
            <span className="agenda-empty-icon"><FiCalendar /></span>
            <h3>Nenhum agendamento {abaAtiva === 'proximos' ? 'futuro' : 'no histórico'}</h3>
            <p>Você não tem horários marcados nesta categoria.</p>
            {abaAtiva === 'proximos' && (
              <Link to="/" className="agenda-btn agenda-btn--primary" style={{ marginTop: '16px' }}>
                Encontrar um Salão
              </Link>
            )}
          </div>
        ) : (
          <div className="agenda-list">
            {agendamentosFiltrados.map(ag => {
              const isCancelado = ag.status === 'cancelado';
              const isConcluido = ag.status === 'concluido';
              const bloqueado = cancelando === ag.id;
              
              return (
                <article className={`agenda-appointment ${isCancelado ? 'is-cancelled' : ''}`} key={ag.id}>
                  
                  {/* HORÁRIO EM DESTAQUE NA ESQUERDA */}
                  <div className="agenda-appointment-time">
                    <strong>{formatarHora(ag.dataHoraInicio)}</strong>
                    <span>{formatarData(ag.dataHoraInicio)}</span>
                  </div>

                  {/* INFORMAÇÕES DO AGENDAMENTO */}
                  <div className="agenda-appointment-main">
                    <h3><FiScissors /> {ag.servicoNome}</h3>
                    <div className="agenda-appointment-details">
                      <span><FiBriefcase /> {ag.profissionalNome}</span>
                      <span><FiMapPin /> {ag.empresaNome}</span>
                    </div>
                  </div>

                  {/* STATUS E AÇÕES */}
                  <div className="agenda-appointment-actions">
                    <span className={`agenda-status agenda-status--${ag.status.toLowerCase()}`}>
                      <span className="agenda-status-dot" />
                      {ag.status}
                    </span>
                    
                    {/* Botão de cancelar */}
                    {!isCancelado && !isConcluido && new Date(ag.dataHoraInicio) > new Date() && (
                      <button 
                        onClick={() => cancelarAgendamento(ag.id)}
                        disabled={bloqueado}
                        className="agenda-icon-btn agenda-icon-btn--cancel"
                        title="Cancelar agendamento"
                      >
                        <FiXCircle />
                      </button>
                    )}
                  </div>

                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}