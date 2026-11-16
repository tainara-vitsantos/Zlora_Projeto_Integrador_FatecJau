import { useEffect, useState } from 'react';
import { FiUser, FiScissors, FiCalendar, FiBriefcase, FiClock, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { api } from '../../services/api';

// Dias da semana padrão do sistema
const DIAS_SEMANA = [
  { id: 'segunda', label: 'Segunda-feira' },
  { id: 'terca', label: 'Terça-feira' },
  { id: 'quarta', label: 'Quarta-feira' },
  { id: 'quinta', label: 'Quinta-feira' },
  { id: 'sexta', label: 'Sexta-feira' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
];

export default function MinhaAgenda() {
  const [abaAtiva, setAbaAtiva] = useState('agendamentos'); // 'agendamentos' ou 'horarios'
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  // Estado para os horários (inicializa com um padrão, mas será sobrescrito pelo banco)
  const [horarios, setHorarios] = useState({
    segunda: { ativo: true, inicio: '09:00', fim: '18:00' },
    terca:   { ativo: true, inicio: '09:00', fim: '18:00' },
    quarta:  { ativo: true, inicio: '09:00', fim: '18:00' },
    quinta:  { ativo: true, inicio: '09:00', fim: '18:00' },
    sexta:   { ativo: true, inicio: '09:00', fim: '18:00' },
    sabado:  { ativo: false, inicio: '09:00', fim: '13:00' },
    domingo: { ativo: false, inicio: '09:00', fim: '13:00' },
  });
  const [salvandoHorarios, setSalvandoHorarios] = useState(false);
  const [sucessoHorarios, setSucessoHorarios] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        // Busca a agenda e os horários ao mesmo tempo do C#
        const [agendaData, horariosData] = await Promise.all([
          api.request('/api/agendamentos/minha'),
          api.request('/api/profissional/perfil/horarios')
        ]);
        
        setAgendamentos(agendaData);
        
        if (horariosData && Object.keys(horariosData).length > 0) {
          setHorarios(horariosData);
        }
      } catch (error) {
        setErro(error.message || 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const formatarHora = (data) => {
    if (!data) return '--:--';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Funções para manipular os horários
  const toggleDia = (diaId) => {
    setHorarios(prev => ({
      ...prev,
      [diaId]: { ...prev[diaId], ativo: !prev[diaId].ativo }
    }));
  };

  const atualizarHorario = (diaId, campo, valor) => {
    setHorarios(prev => ({
      ...prev,
      [diaId]: { ...prev[diaId], [campo]: valor }
    }));
  };

  const salvarHorarios = async (e) => {
    e.preventDefault();
    setSalvandoHorarios(true);
    setSucessoHorarios(false);
    
    try {
      // Salva no C# de verdade
      await api.request('/api/profissional/perfil/horarios', { 
        method: 'PUT', 
        body: JSON.stringify(horarios) 
      });
      
      setSucessoHorarios(true);
      setTimeout(() => setSucessoHorarios(false), 3000);
    } catch (error) {
      alert('Erro ao salvar horários: ' + error.message);
    } finally {
      setSalvandoHorarios(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Minha Agenda</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>
            Gerencie seus atendimentos e horários de trabalho.
          </p>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--zlora-border)' }}>
        <button 
          onClick={() => setAbaAtiva('agendamentos')}
          style={{
            padding: '12px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: '15px',
            color: abaAtiva === 'agendamentos' ? 'var(--zlora-primary)' : 'var(--zlora-text-soft)',
            borderBottom: abaAtiva === 'agendamentos' ? '3px solid var(--zlora-primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <FiCalendar style={{ marginBottom: '-2px', marginRight: '6px' }} /> 
          Meus Agendamentos ({agendamentos.length})
        </button>
        <button 
          onClick={() => setAbaAtiva('horarios')}
          style={{
            padding: '12px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontWeight: '600', fontSize: '15px',
            color: abaAtiva === 'horarios' ? 'var(--zlora-primary)' : 'var(--zlora-text-soft)',
            borderBottom: abaAtiva === 'horarios' ? '3px solid var(--zlora-primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          <FiClock style={{ marginBottom: '-2px', marginRight: '6px' }} /> 
          Horários de Atendimento
        </button>
      </div>

      {/* CONTEÚDO DA ABA */}
      {abaAtiva === 'agendamentos' ? (
        <div className="dash-card" style={{ padding: '24px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--zlora-text-soft)', padding: '30px 0' }}>Carregando sua agenda...</p>
          ) : erro ? (
            <p style={{ textAlign: 'center', color: '#dc3545', padding: '30px 0' }}>{erro}</p>
          ) : agendamentos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '45px 0', color: 'var(--zlora-text-soft)' }}>
              <FiCalendar size={35} />
              <h3 style={{ marginTop: '15px' }}>Agenda vazia</h3>
              <p>Você ainda não possui atendimentos agendados.</p>
            </div>
          ) : (
            <div className="agenda-list">
              {agendamentos.map((item) => {
                const status = (item.status || 'agendado').toLowerCase();
                return (
                  <div key={item.id} className="agenda-card" style={{ opacity: status === 'cancelado' ? 0.55 : 1 }}>
                    <div className="agenda-time">
                      {formatarHora(item.dataHoraInicio)}
                      <div style={{ fontSize: '11px', color: 'var(--zlora-text-soft)', marginTop: '4px', fontWeight: 'normal' }}>
                        {formatarData(item.dataHoraInicio)}
                      </div>
                    </div>
                    <div className="agenda-info">
                      <h3 className="agenda-client">
                        <FiUser style={{ fontSize: '14px', marginRight: '6px' }} /> {item.clienteNome || 'Cliente não informado'}
                      </h3>
                      <p className="agenda-service" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiScissors /> {item.servicoNome || 'Serviço não informado'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--zlora-primary)' }}>
                          <FiBriefcase /> Seu atendimento
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className={`agenda-status status-${status}`}>{status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="dash-card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Defina sua Jornada de Trabalho</h3>
            <p style={{ color: 'var(--zlora-text-soft)', fontSize: '14px', margin: 0 }}>
              Esses horários serão usados para calcular os horários livres no momento do agendamento.
            </p>
          </div>

          {sucessoHorarios && (
            <div className="alert alert-info" style={{ background: '#DCFCE7', color: '#166534', borderLeftColor: '#22C55E', marginBottom: '24px' }}>
              Horários salvos com sucesso!
            </div>
          )}

          <form onSubmit={salvarHorarios}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {DIAS_SEMANA.map((dia) => {
                const config = horarios[dia.id];
                return (
                  <div 
                    key={dia.id} 
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                      padding: '16px', borderRadius: '12px',
                      background: config.ativo ? '#fff' : '#F3F4F6',
                      border: `1px solid ${config.ativo ? 'var(--zlora-border-strong)' : 'var(--zlora-border)'}`,
                      opacity: config.ativo ? 1 : 0.7
                    }}
                  >
                    {/* Nome do dia e Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                      <button 
                        type="button" 
                        onClick={() => toggleDia(dia.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', fontSize: '24px', color: config.ativo ? 'var(--zlora-primary)' : '#9CA3AF' }}
                      >
                        {config.ativo ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                      <span style={{ fontWeight: '600', color: config.ativo ? 'var(--zlora-dark)' : 'var(--zlora-text-soft)' }}>
                        {dia.label}
                      </span>
                    </div>

                    {/* Inputs de Hora */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--zlora-text-soft)' }}>Início</span>
                        <input 
                          type="time" 
                          className="form-control" 
                          disabled={!config.ativo}
                          value={config.inicio}
                          onChange={(e) => atualizarHorario(dia.id, 'inicio', e.target.value)}
                          style={{ width: '110px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--zlora-text-soft)' }}>Fim</span>
                        <input 
                          type="time" 
                          className="form-control" 
                          disabled={!config.ativo}
                          value={config.fim}
                          onChange={(e) => atualizarHorario(dia.id, 'fim', e.target.value)}
                          style={{ width: '110px' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--zlora-border)' }}>
              <button type="submit" className="btn btn-primary" disabled={salvandoHorarios}>
                <FiSave style={{ marginRight: '8px', marginBottom: '-2px' }} />
                {salvandoHorarios ? 'Salvando...' : 'Salvar Horários'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}