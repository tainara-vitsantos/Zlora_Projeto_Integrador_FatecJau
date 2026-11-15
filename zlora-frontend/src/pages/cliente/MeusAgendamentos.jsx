import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiScissors, FiBriefcase, FiMapPin } from 'react-icons/fi';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await api.request('/api/agendamentos/meus');
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar meus agendamentos:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatarHora = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (carregando) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando seus agendamentos...</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Meus Agendamentos</h2>
        <p style={{ color: 'var(--zlora-text-soft)' }}>Acompanhe os horários que você marcou.</p>
      </div>

      {agendamentos.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FiCalendar size={48} color="var(--zlora-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Nenhum agendamento ainda</h3>
          <p style={{ color: 'var(--zlora-text-soft)', marginBottom: '24px' }}>Você ainda não marcou nenhum horário.</p>
          <Link to="/" className="btn btn-primary">Encontrar um Salão</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {agendamentos.map(ag => (
            <div key={ag.id} className="dash-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
              
              {/* Data e Hora em Destaque */}
              <div style={{ 
                background: 'var(--zlora-primary-soft)', padding: '16px', borderRadius: '12px', 
                textAlign: 'center', minWidth: '120px' 
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--zlora-primary)' }}>
                  {formatarHora(ag.dataHoraInicio)}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--zlora-text-soft)', fontWeight: '600' }}>
                  {formatarData(ag.dataHoraInicio)}
                </div>
              </div>

              {/* Informações do Agendamento */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px', color: 'var(--zlora-dark)' }}>
                  {ag.servicoNome}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: 'var(--zlora-text-soft)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiBriefcase /> {ag.profissionalNome}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiMapPin /> {ag.empresaNome}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <span style={{ 
                  padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase',
                  background: ag.status === 'cancelado' ? '#FEE2E2' : ag.status === 'concluido' ? '#DCFCE7' : '#DBEAFE',
                  color: ag.status === 'cancelado' ? '#991B1B' : ag.status === 'concluido' ? '#166534' : '#1E40AF'
                }}>
                  {ag.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}