import { useEffect, useState } from 'react';
import { 
  FiUser, FiScissors, FiCalendar, FiBriefcase, FiClock, 
  FiSave, FiToggleLeft, FiToggleRight, FiPlus, FiTrash2 
} from 'react-icons/fi';
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

const formatarDataBloqueio = (data) =>
  new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');

const hojeLocal = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
};

export default function MinhaAgenda() {
  const [abaAtiva, setAbaAtiva] = useState('agendamentos'); // 'agendamentos' ou 'horarios'
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [erroBloqueio, setErroBloqueio] = useState('');
  const [salvandoBloqueio, setSalvandoBloqueio] = useState(false);
  const [bloqueioDiaTodo, setBloqueioDiaTodo] = useState(true);
  const [novoBloqueio, setNovoBloqueio] = useState({
    data: '',
    inicio: '09:00',
    fim: '10:00',
    motivo: ''
  });
  
  // ESTADO ATUALIZADO: Agora cada dia tem um array de 'turnos'
  const [horarios, setHorarios] = useState({
    segunda: { ativo: true, turnos: [{ inicio: '09:00', fim: '18:00' }] },
    terca:   { ativo: true, turnos: [{ inicio: '09:00', fim: '18:00' }] },
    quarta:  { ativo: true, turnos: [{ inicio: '09:00', fim: '18:00' }] },
    quinta:  { ativo: true, turnos: [{ inicio: '09:00', fim: '18:00' }] },
    sexta:   { ativo: true, turnos: [{ inicio: '09:00', fim: '18:00' }] },
    sabado:  { ativo: false, turnos: [{ inicio: '09:00', fim: '13:00' }] },
    domingo: { ativo: false, turnos: [{ inicio: '09:00', fim: '13:00' }] },
  });
  
  const [salvandoHorarios, setSalvandoHorarios] = useState(false);
  const [sucessoHorarios, setSucessoHorarios] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const [agendaData, horariosData, bloqueiosData] = await Promise.all([
          api.request('/api/agendamentos/minha'),
          api.request('/api/profissional/perfil/horarios'),
          api.request('/api/profissional/perfil/bloqueios')
        ]);
        
        setAgendamentos(agendaData);
        setBloqueios(bloqueiosData);
        
        if (horariosData && Object.keys(horariosData).length > 0) {
          // Se o backend ainda retornar o formato antigo (inicio/fim direto),
          // a gente converte para o novo formato (array de turnos) para não quebrar a tela.
          const horariosFormatados = {};
          Object.keys(horariosData).forEach(diaId => {
            const dia = horariosData[diaId];
            if (dia.turnos) {
              horariosFormatados[diaId] = dia; // Já está no formato novo
            } else {
              horariosFormatados[diaId] = {
                ativo: dia.ativo,
                turnos: [{ inicio: dia.inicio || '09:00', fim: dia.fim || '18:00' }]
              };
            }
          });
          setHorarios(horariosFormatados);
        }
      } catch (error) {
        setErro(error.message || 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        const agendaAtualizada = await api.request('/api/agendamentos/minha');
        setAgendamentos(agendaAtualizada);
      } catch (error) {
        console.error('Erro ao sincronizar agenda profissional:', error);
        setErro(error.message || 'Não foi possível sincronizar sua agenda.');
      }
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const formatarHora = (data) => {
    if (!data) return '--:--';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // ==========================================
  // FUNÇÕES DE MANIPULAÇÃO DE HORÁRIOS
  // ==========================================

  const toggleDia = (diaId) => {
    setHorarios(prev => ({
      ...prev,
      [diaId]: { ...prev[diaId], ativo: !prev[diaId].ativo }
    }));
  };

  const atualizarTurno = (diaId, index, campo, valor) => {
    setHorarios(prev => {
      const novosTurnos = [...prev[diaId].turnos];
      novosTurnos[index] = { ...novosTurnos[index], [campo]: valor };
      return { ...prev, [diaId]: { ...prev[diaId], turnos: novosTurnos } };
    });
  };

  const adicionarTurno = (diaId) => {
    setHorarios(prev => {
      const turnosAtuais = prev[diaId].turnos;
      const ultimoFim = Math.max(
        0,
        ...turnosAtuais.map((turno) => {
          const [hora, minuto] = turno.fim.split(':').map(Number);
          return hora * 60 + minuto;
        })
      );
      let inicioMinutos = 14 * 60;
      let fimMinutos = 18 * 60;
      if (turnosAtuais.some((turno) => {
        const [horaInicio, minutoInicio] = turno.inicio.split(':').map(Number);
        const [horaFim, minutoFim] = turno.fim.split(':').map(Number);
        return inicioMinutos < horaFim * 60 + minutoFim &&
          fimMinutos > horaInicio * 60 + minutoInicio;
      })) {
        inicioMinutos = ultimoFim;
        fimMinutos = Math.min(inicioMinutos + 4 * 60, 23 * 60);
      }
      if (fimMinutos <= inicioMinutos) return prev;
      const formatarMinutos = (minutos) =>
        `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
      const novoTurno = {
        inicio: formatarMinutos(inicioMinutos),
        fim: formatarMinutos(fimMinutos)
      };
      return {
        ...prev,
        [diaId]: { ...prev[diaId], turnos: [...turnosAtuais, novoTurno] }
      };
    });
  };

  const removerTurno = (diaId, index) => {
    setHorarios(prev => {
      const novosTurnos = prev[diaId].turnos.filter((_, i) => i !== index);
      return {
        ...prev,
        [diaId]: { ...prev[diaId], turnos: novosTurnos }
      };
    });
  };

  const salvarHorarios = async (e) => {
    e.preventDefault();
    setSalvandoHorarios(true);
    setSucessoHorarios(false);
    
    try {
      // Envia a nova estrutura com 'turnos' para a API
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

  const salvarBloqueio = async (e) => {
    e.preventDefault();
    setErroBloqueio('');
    setSalvandoBloqueio(true);
    try {
      const bloqueio = await api.request('/api/profissional/perfil/bloqueios', {
        method: 'POST',
        body: JSON.stringify({
          ...novoBloqueio,
          inicio: bloqueioDiaTodo ? null : novoBloqueio.inicio,
          fim: bloqueioDiaTodo ? null : novoBloqueio.fim
        })
      });
      setBloqueios((atuais) => [...atuais, bloqueio].sort((a, b) => a.data.localeCompare(b.data)));
      setNovoBloqueio((atual) => ({ ...atual, data: '', motivo: '' }));
    } catch (error) {
      setErroBloqueio(error.message || 'Não foi possível bloquear o horário.');
    } finally {
      setSalvandoBloqueio(false);
    }
  };

  const removerBloqueio = async (id) => {
    try {
      await api.request(`/api/profissional/perfil/bloqueios/${id}`, { method: 'DELETE' });
      setBloqueios((atuais) => atuais.filter((bloqueio) => bloqueio.id !== id));
    } catch (error) {
      setErroBloqueio(error.message || 'Não foi possível remover o bloqueio.');
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
                      {item.alteradoEm && item.criadoEm &&
                        new Date(item.alteradoEm).getTime() > new Date(item.criadoEm).getTime() && (
                          <small style={{ display: 'block', marginTop: '6px', color: 'var(--zlora-text-soft)' }}>
                            Atualizado em {new Date(item.alteradoEm).toLocaleString('pt-BR')}
                          </small>
                        )}
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
              Adicione múltiplos turnos por dia se você faz pausa para o almoço, por exemplo.
            </p>
          </div>

          {sucessoHorarios && (
            <div className="alert alert-info" style={{ background: '#DCFCE7', color: '#166534', borderLeftColor: '#22C55E', marginBottom: '24px', padding: '12px', borderRadius: '8px' }}>
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
                      display: 'flex', flexDirection: 'column', gap: '16px',
                      padding: '20px', borderRadius: '16px',
                      background: config.ativo ? '#fff' : '#F9FAFB',
                      border: `1.5px solid ${config.ativo ? 'var(--zlora-primary-soft)' : 'var(--zlora-border)'}`,
                      opacity: config.ativo ? 1 : 0.7
                    }}
                  >
                    {/* Cabeçalho do Dia */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
                        <button 
                          type="button" 
                          onClick={() => toggleDia(dia.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', fontSize: '26px', color: config.ativo ? 'var(--zlora-primary)' : '#9CA3AF' }}
                        >
                          {config.ativo ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: config.ativo ? 'var(--zlora-dark)' : 'var(--zlora-text-soft)' }}>
                          {dia.label}
                        </span>
                      </div>

                      {/* Botão Adicionar Turno */}
                      {config.ativo && (
                        <button
                          type="button"
                          onClick={() => adicionarTurno(dia.id)}
                          style={{
                            background: 'var(--zlora-primary-soft)', color: 'var(--zlora-primary)',
                            border: 'none', padding: '8px 14px', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <FiPlus /> Adicionar Turno
                        </button>
                      )}
                    </div>

                    {/* Lista de Turnos */}
                    {config.ativo && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '38px' }}>
                        {config.turnos.map((turno, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zlora-text-soft)' }}>Início</span>
                              <input 
                                type="time" 
                                className="form-control" 
                                value={turno.inicio}
                                onChange={(e) => atualizarTurno(dia.id, index, 'inicio', e.target.value)}
                                style={{ width: '110px', padding: '8px' }}
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zlora-text-soft)' }}>Fim</span>
                              <input 
                                type="time" 
                                className="form-control" 
                                value={turno.fim}
                                onChange={(e) => atualizarTurno(dia.id, index, 'fim', e.target.value)}
                                style={{ width: '110px', padding: '8px' }}
                              />
                            </div>

                            {/* Botão de Lixeira (só aparece se tiver mais de 1 turno) */}
                            {config.turnos.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removerTurno(dia.id, index)}
                                title="Remover turno"
                                style={{
                                  background: '#FEE2E2', color: '#DC2626', border: 'none',
                                  width: '36px', height: '36px', borderRadius: '8px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', marginLeft: '8px'
                                }}
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--zlora-border)' }}>
              <button type="submit" className="btn btn-primary" disabled={salvandoHorarios} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSave />
                {salvandoHorarios ? 'Salvando...' : 'Salvar Horários'}
              </button>
            </div>
          </form>

          <section style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1px solid var(--zlora-border)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Folgas e bloqueios pontuais</h3>
            <p style={{ color: 'var(--zlora-text-soft)', fontSize: '14px' }}>
              Bloqueie uma data inteira ou somente um intervalo. Os clientes deixarão de ver esses horários.
            </p>
            {erroBloqueio && (
              <p role="alert" style={{ color: '#dc3545' }}>{erroBloqueio}</p>
            )}
            <form onSubmit={salvarBloqueio} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'end', margin: '18px 0 24px' }}>
              <label>
                Data
                <input
                  type="date"
                  required
                  min={hojeLocal()}
                  value={novoBloqueio.data}
                  onChange={(e) => setNovoBloqueio({ ...novoBloqueio, data: e.target.value })}
                  className="form-control"
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={bloqueioDiaTodo}
                  onChange={(e) => setBloqueioDiaTodo(e.target.checked)}
                />
                Dia todo
              </label>
              {!bloqueioDiaTodo && (
                <>
                  <label>Início<input type="time" required value={novoBloqueio.inicio} onChange={(e) => setNovoBloqueio({ ...novoBloqueio, inicio: e.target.value })} className="form-control" /></label>
                  <label>Fim<input type="time" required value={novoBloqueio.fim} onChange={(e) => setNovoBloqueio({ ...novoBloqueio, fim: e.target.value })} className="form-control" /></label>
                </>
              )}
              <label style={{ flex: '1 1 180px' }}>
                Motivo (opcional)
                <input type="text" maxLength="160" value={novoBloqueio.motivo} onChange={(e) => setNovoBloqueio({ ...novoBloqueio, motivo: e.target.value })} className="form-control" />
              </label>
              <button type="submit" className="btn btn-primary" disabled={salvandoBloqueio}>
                {salvandoBloqueio ? 'Salvando...' : 'Adicionar bloqueio'}
              </button>
            </form>
            {bloqueios.length === 0 ? (
              <p style={{ color: 'var(--zlora-text-soft)' }}>Nenhum bloqueio cadastrado.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {bloqueios.map((bloqueio) => (
                  <div key={bloqueio.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '12px 16px', border: '1px solid var(--zlora-border)', borderRadius: '10px' }}>
                    <span>
                      <strong>{formatarDataBloqueio(bloqueio.data)}</strong>
                      {' · '}
                      {bloqueio.inicio && bloqueio.fim ? `${bloqueio.inicio}–${bloqueio.fim}` : 'Dia todo'}
                      {bloqueio.motivo ? ` · ${bloqueio.motivo}` : ''}
                    </span>
                    <button type="button" onClick={() => removerBloqueio(bloqueio.id)} title="Remover bloqueio" aria-label="Remover bloqueio">
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}