import { useState, useEffect } from 'react';
import { FiPlus, FiUser, FiScissors, FiX, FiXCircle, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import { api } from '../../services/api';

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]); // <-- NOVO ESTADO
  const [carregando, setCarregando] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // O form agora tem o profissionalId
  const [formData, setFormData] = useState({
    clienteId: '',
    servicoId: '',
    profissionalId: '', // <-- NOVO CAMPO
    dataHoraInicio: ''
  });

  const carregarDados = async () => {
    try {
      setCarregando(true);
      // Adicionamos a busca de profissionais aqui
      const [agendamentosData, clientesData, servicosData, profissionaisData] = await Promise.all([
        api.request('/api/agendamentos'),
        api.request('/api/clientes'),
        api.request('/api/servicos'),
        api.request('/api/profissionais')
      ]);

      setAgendamentos(agendamentosData);
      setClientes(clientesData);
      setServicos(servicosData);
      setProfissionais(profissionaisData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);

      // 1. Descobre a duração do serviço escolhido
      const servicoSelecionado = servicos.find(s => (s.id || s.Id) === formData.servicoId);
      if (!servicoSelecionado) throw new Error("Serviço não encontrado");

      // 2. Calcula a DataHoraFim
      const dataInicio = new Date(formData.dataHoraInicio);
      const duracao = servicoSelecionado.duracaoMinutos || servicoSelecionado.DuracaoMinutos;
      const dataFim = new Date(dataInicio.getTime() + duracao * 60000); // 60000ms = 1 minuto

      // 3. Monta o JSON igual ao Model Agendamento do C#
      const payload = {
        clienteId: formData.clienteId,
        servicoId: formData.servicoId,
        profissionalId: formData.profissionalId, // <-- ENVIANDO O PROFISSIONAL
        dataHoraInicio: dataInicio.toISOString(),
        dataHoraFim: dataFim.toISOString()
      };

      await api.request('/api/agendamentos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setIsModalOpen(false);
      setFormData({ clienteId: '', servicoId: '', profissionalId: '', dataHoraInicio: '' });
      carregarDados();
    } catch (error) {
      alert("Aviso: " + (error.message || "Erro ao agendar. Verifique o horário."));
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      await api.request(`/api/agendamentos/${id}/cancelar`, { method: 'PATCH' });
      carregarDados();
    } catch (error) {
      alert("Erro ao cancelar: " + error.message);
    }
  };

  const handleConcluir = async (id) => {
    if (!window.confirm('Deseja marcar este atendimento como concluído?')) return;

    try {
      await api.request(`/api/agendamentos/${id}/concluir`, {
        method: 'PATCH'
      });

      await carregarDados();

    } catch (error) {
      alert('Erro ao concluir atendimento: ' + error.message);
    }
  };

  // Funções auxiliares
  const formatarHora = (dataString) => {
    if (!dataString) return '--:--';
    return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getClienteNome = (id) => clientes.find(c => (c.id || c.Id) === id)?.nome || clientes.find(c => (c.id || c.Id) === id)?.Nome || 'Desconhecido';
  const getServicoNome = (id) => servicos.find(s => (s.id || s.Id) === id)?.nome || servicos.find(s => (s.id || s.Id) === id)?.Nome || 'Desconhecido';

  // NOVA FUNÇÃO AUXILIAR
  const getProfissionalNome = (id) => profissionais.find(p => (p.id || p.Id) === id)?.nome || profissionais.find(p => (p.id || p.Id) === id)?.Nome || 'Não definido';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Minha Agenda</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>Acompanhe os horários marcados.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Novo Agendamento
        </button>
      </div>

      <div className="dash-card" style={{ padding: '24px' }}>
        {carregando ? (
          <p style={{ textAlign: 'center', color: 'var(--zlora-text-soft)' }}>Carregando agenda...</p>
        ) : agendamentos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--zlora-text-soft)', padding: '40px 0' }}>
            Nenhum agendamento marcado.
          </p>
        ) : (
          <div className="agenda-list">
            {agendamentos.map(agendamento => {
              const id = agendamento.id || agendamento.Id;
              const idCli = agendamento.clienteId || agendamento.ClienteId;
              const idServ = agendamento.servicoId || agendamento.ServicoId;
              const idProf = agendamento.profissionalId || agendamento.ProfissionalId; // <-- LENDO PROFISSIONAL
              const dataInicio = agendamento.dataHoraInicio || agendamento.DataHoraInicio;
              const status = (agendamento.status || agendamento.Status || 'agendado').toLowerCase();

              return (
                <div key={id} className="agenda-card" style={{ opacity: status === 'cancelado' ? 0.5 : 1 }}>
                  <div className="agenda-time">
                    {formatarHora(dataInicio)}
                    <div style={{ fontSize: '11px', color: 'var(--zlora-text-soft)', marginTop: '4px', fontWeight: 'normal' }}>
                      {formatarData(dataInicio)}
                    </div>
                  </div>

                  <div className="agenda-info">
                    <h3 className="agenda-client">
                      <FiUser style={{ fontSize: '14px', marginRight: '6px' }} />
                      {getClienteNome(idCli)}
                    </h3>
                    <p className="agenda-service" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiScissors /> {getServicoNome(idServ)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--zlora-primary)', fontWeight: '500' }}>
                        <FiBriefcase /> {getProfissionalNome(idProf)}
                      </span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={`agenda-status status-${status}`}>
                      {status}
                    </span>

                    {status === 'agendado' && (
                      <>
                        <button
                          onClick={() => handleConcluir(id)}
                          className="btn-icon"
                          title="Concluir atendimento"
                          style={{ color: '#16a34a' }}
                        >
                          <FiCheckCircle style={{ fontSize: '20px' }} />
                        </button>

                        <button
                          onClick={() => handleCancelar(id)}
                          className="btn-icon"
                          title="Cancelar agendamento"
                        >
                          <FiXCircle style={{ fontSize: '20px' }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE NOVO AGENDAMENTO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Novo Agendamento</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  className="form-control" required
                  value={formData.clienteId}
                  onChange={e => setFormData({ ...formData, clienteId: e.target.value })}
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id || c.Id} value={c.id || c.Id}>{c.nome || c.Nome}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Serviço *</label>
                <select
                  className="form-control" required
                  value={formData.servicoId}
                  onChange={e => setFormData({ ...formData, servicoId: e.target.value })}
                >
                  <option value="">Selecione um serviço...</option>
                  {servicos.map(s => (
                    <option key={s.id || s.Id} value={s.id || s.Id}>
                      {s.nome || s.Nome} ({s.duracaoMinutos || s.DuracaoMinutos} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* NOVO CAMPO: PROFISSIONAL */}
              <div className="form-group">
                <label>Profissional *</label>
                <select
                  className="form-control" required
                  value={formData.profissionalId}
                  onChange={e => setFormData({ ...formData, profissionalId: e.target.value })}
                >
                  <option value="">Selecione o profissional...</option>
                  {profissionais
                    .filter(p => (p.status || p.Status) === 'ativo') // Só mostra os ativos
                    .map(p => (
                      <option key={p.id || p.Id} value={p.id || p.Id}>{p.nome || p.Nome}</option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Início do Atendimento *</label>
                <input
                  type="datetime-local"
                  className="form-control" required
                  value={formData.dataHoraInicio}
                  onChange={e => setFormData({ ...formData, dataHoraInicio: e.target.value })}
                />
                <small className="form-hint">O fim será calculado automaticamente com base no serviço.</small>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={salvando}>
                  {salvando ? 'Agendando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}