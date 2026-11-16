
import { useEffect, useState } from 'react';
import { FiUser, FiScissors, FiCalendar, FiBriefcase } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MinhaAgenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarAgenda() {
      try {
        const token = localStorage.getItem('@Zlora:token');

        const resposta = await fetch(`${API_URL}/api/agendamentos/minha`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar sua agenda.');
        }

        const dados = await resposta.json();
        setAgendamentos(dados);
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    }

    carregarAgenda();
  }, []);

  const formatarHora = (data) => {
    if (!data) return '--:--';

    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatarData = (data) => {
    if (!data) return '';

    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
            Minha Agenda
          </h2>

          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>
            Acompanhe seus atendimentos e horários marcados.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--zlora-primary)',
          fontWeight: '500'
        }}>
          <FiCalendar />
          {agendamentos.length} {agendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
        </div>
      </div>

      <div className="dash-card" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{
            textAlign: 'center',
            color: 'var(--zlora-text-soft)',
            padding: '30px 0'
          }}>
            Carregando sua agenda...
          </p>
        ) : erro ? (
          <p style={{
            textAlign: 'center',
            color: '#dc3545',
            padding: '30px 0'
          }}>
            {erro}
          </p>
        ) : agendamentos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '45px 0',
            color: 'var(--zlora-text-soft)'
          }}>
            <FiCalendar size={35} />
            <h3 style={{ marginTop: '15px' }}>Agenda vazia</h3>
            <p>Você ainda não possui atendimentos agendados.</p>
          </div>
        ) : (
          <div className="agenda-list">
            {agendamentos.map((item) => {
              const status = (item.status || 'agendado').toLowerCase();

              return (
                <div
                  key={item.id}
                  className="agenda-card"
                  style={{
                    opacity: status === 'cancelado' ? 0.55 : 1
                  }}
                >
                  <div className="agenda-time">
                    {formatarHora(item.dataHoraInicio)}

                    <div style={{
                      fontSize: '11px',
                      color: 'var(--zlora-text-soft)',
                      marginTop: '4px',
                      fontWeight: 'normal'
                    }}>
                      {formatarData(item.dataHoraInicio)}
                    </div>
                  </div>

                  <div className="agenda-info">
                    <h3 className="agenda-client">
                      <FiUser style={{
                        fontSize: '14px',
                        marginRight: '6px'
                      }} />
                      {item.clienteNome || 'Cliente não informado'}
                    </h3>

                    <p className="agenda-service" style={{
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap',
                      marginTop: '6px'
                    }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <FiScissors />
                        {item.servicoNome || 'Serviço não informado'}
                      </span>

                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--zlora-primary)'
                      }}>
                        <FiBriefcase />
                        Seu atendimento
                      </span>
                    </p>
                  </div>

                  <div>
                    <span className={`agenda-status status-${status}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
