import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiPlus, FiUser, FiScissors, FiX, FiCheckCircle,
  FiXCircle, FiBriefcase, FiRefreshCw, FiSearch,
  FiCalendar, FiClock, FiAlertCircle, FiFilter, FiCheck,
} from 'react-icons/fi';

import { api } from '../../services/api';
import SeletorHorarios from '../../components/SeletorHorarios/SeletorHorarios';
import './Agenda.css';

const obter = (obj, ...chaves) => {
  for (const chave of chaves) {
    if (obj?.[chave] !== undefined && obj?.[chave] !== null) return obj[chave];
  }
  return '';
};

const normalizar = (valor) =>
  String(valor ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const STATUS = {
  agendado: { label: 'Agendado', className: 'agendado' },
  confirmado: { label: 'Confirmado', className: 'confirmado' },
  concluido: { label: 'Concluído', className: 'concluido' },
  cancelado: { label: 'Cancelado', className: 'cancelado' },
};

const formatarHora = (valor) => {
  if (!valor) return '--:--';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '--:--';
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatarDataCompleta = (valor) => {
  if (!valor) return 'Data não informada';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Data inválida';
  return data.toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
};

const mesmoId = (a, b) => String(a ?? '') === String(b ?? '');

const hojeLocal = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
};

const dataLocal = (valor) => {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
};

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [alteracoesProfissionais, setAlteracoesProfissionais] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  const [filtroData, setFiltroData] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [formData, setFormData] = useState({
    clienteId: '',
    servicoId: '',
    profissionalId: '',
  });

  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  
  const [disponibilidade, setDisponibilidade] = useState(null);

  const carregarDados = useCallback(async (silencioso = false) => {
    if (silencioso) setAtualizando(true);
    else setCarregando(true);

    setErro('');
    setMensagem('');

    try {
      const [agendamentosData, clientesData, servicosData, profissionaisData, alteracoesData] =
        await Promise.all([
          api.request('/api/agendamentos'),
          api.request('/api/clientes'),
          api.request('/api/servicos'),
          api.request('/api/profissionais'),
          api.request('/api/agendamentos/alteracoes'),
        ]);

      setAgendamentos(Array.isArray(agendamentosData) ? agendamentosData : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setServicos(Array.isArray(servicosData) ? servicosData : []);
      setProfissionais(Array.isArray(profissionaisData) ? profissionaisData : []);
      setAlteracoesProfissionais(Array.isArray(alteracoesData) ? alteracoesData : []);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      setErro(error?.message || 'Não foi possível carregar a agenda. Verifique sua conexão.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    const controller = new AbortController();
    async function buscarDisponibilidade() {
      if (!formData.profissionalId || !formData.servicoId) {
        return;
      }
      try {
        const query = new URLSearchParams({
          profissionalId: formData.profissionalId,
          servicoId: formData.servicoId,
          inicio: hojeLocal(),
          dias: '14',
          fusoMinutos: String(new Date().getTimezoneOffset()),
        });
        const resultado = await api.request(`/api/agendamentos/disponibilidade?${query}`, {
          signal: controller.signal,
        });
        setDisponibilidade(resultado);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setDisponibilidade([]);
        setMensagem(error.message || 'Não foi possível carregar a disponibilidade.');
      }
    }
    buscarDisponibilidade();
    return () => controller.abort();
  }, [formData.profissionalId, formData.servicoId]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        const [dados, alteracoes] = await Promise.all([
          api.request('/api/agendamentos'),
          api.request('/api/agendamentos/alteracoes'),
        ]);
        setAgendamentos(Array.isArray(dados) ? dados : []);
        setAlteracoesProfissionais(Array.isArray(alteracoes) ? alteracoes : []);
      } catch (error) {
        console.error('Erro ao sincronizar agenda:', error);
        setErro(error.message || 'Não foi possível sincronizar a agenda.');
      }
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const getClienteNome = useCallback((id) => {
    const cliente = clientes.find((item) => mesmoId(obter(item, 'id', 'Id'), id));
    return obter(cliente, 'nome', 'Nome') || 'Cliente não identificado';
  }, [clientes]);

  const getServicoNome = useCallback((id) => {
    const servico = servicos.find((item) => mesmoId(obter(item, 'id', 'Id'), id));
    return obter(servico, 'nome', 'Nome') || 'Serviço não identificado';
  }, [servicos]);

  const getProfissionalNome = useCallback((id) => {
    const profissional = profissionais.find((item) => mesmoId(obter(item, 'id', 'Id'), id));
    return obter(profissional, 'nome', 'Nome') || 'Profissional não definido';
  }, [profissionais]);

  const duracaoServico = useMemo(() => {
    if (!formData.servicoId) return 30;
    const servico = servicos.find((s) => mesmoId(obter(s, 'id', 'Id'), formData.servicoId));
    return Number(obter(servico, 'duracaoMinutos', 'DuracaoMinutos')) || 30;
  }, [formData.servicoId, servicos]);

  const horariosDisponiveis = useMemo(
    () => disponibilidade?.find((dia) => dia.data === dataSelecionada)?.horarios || [],
    [disponibilidade, dataSelecionada]
  );

  const agendamentosFiltrados = useMemo(() => {
    const termo = normalizar(busca);

    return [...agendamentos]
      .filter((agendamento) => {
        const status = normalizar(obter(agendamento, 'status', 'Status') || 'agendado');
        const clienteId = obter(agendamento, 'clienteId', 'ClienteId');
        const servicoId = obter(agendamento, 'servicoId', 'ServicoId');
        const profissionalId = obter(agendamento, 'profissionalId', 'ProfissionalId');
        const dataHoraInicio = obter(agendamento, 'dataHoraInicio', 'DataHoraInicio');

        const correspondeStatus = filtroStatus === 'todos' || status === filtroStatus;
        const correspondeProfissional = filtroProfissional === 'todos' ||
          mesmoId(profissionalId, filtroProfissional);
        const correspondeData = !filtroData || dataLocal(dataHoraInicio) === filtroData;
        const textoBusca = normalizar([
          getClienteNome(clienteId),
          getServicoNome(servicoId),
          getProfissionalNome(profissionalId),
        ].join(' '));

        return correspondeStatus && correspondeProfissional && correspondeData &&
          (!termo || textoBusca.includes(termo));
      })
      .sort((a, b) => {
        const dataA = new Date(obter(a, 'dataHoraInicio', 'DataHoraInicio')).getTime() || 0;
        const dataB = new Date(obter(b, 'dataHoraInicio', 'DataHoraInicio')).getTime() || 0;
        return dataA - dataB;
      });
  }, [
    agendamentos, busca, filtroStatus, filtroProfissional, filtroData,
    getClienteNome, getServicoNome, getProfissionalNome,
  ]);

  const alteracoesFiltradas = useMemo(
    () => alteracoesProfissionais.filter((alteracao) =>
      filtroProfissional === 'todos' ||
      mesmoId(obter(alteracao, 'profissionalId', 'ProfissionalId'), filtroProfissional)),
    [alteracoesProfissionais, filtroProfissional]
  );

  const resumo = useMemo(() => {
    const status = agendamentos.map((item) =>
      normalizar(obter(item, 'status', 'Status') || 'agendado')
    );

    return {
      total: agendamentos.length,
      agendados: status.filter((item) => item === 'agendado').length,
      concluidos: status.filter((item) => item === 'concluido').length,
      cancelados: status.filter((item) => item === 'cancelado').length,
    };
  }, [agendamentos]);

  const fecharModal = () => {
    if (salvando) return;
    setIsModalOpen(false);
    setMensagem('');
    setDataSelecionada('');
    setHorarioSelecionado('');
    setDisponibilidade(null);
    setFormData({ clienteId: '', servicoId: '', profissionalId: '' });
  };

  const handleSalvar = async (e) => {
    e.preventDefault();

    if (!dataSelecionada || !horarioSelecionado || !formData.servicoId || !formData.profissionalId || !formData.clienteId) {
      setMensagem('Preencha todos os campos, incluindo a data e o horário.');
      return;
    }

    try {
      setSalvando(true);
      setMensagem('');

      const dataInicio = new Date(`${dataSelecionada}T${horarioSelecionado}:00`);
      if (Number.isNaN(dataInicio.getTime())) throw new Error('Data ou horário inválidos.');

      const dataFim = new Date(dataInicio.getTime() + duracaoServico * 60000);

      const payload = {
        clienteId: formData.clienteId,
        servicoId: formData.servicoId,
        profissionalId: formData.profissionalId,
        dataHoraInicio: dataInicio.toISOString(),
        dataHoraFim: dataFim.toISOString(),
        fusoMinutos: new Date().getTimezoneOffset(),
      };

      await api.request('/api/agendamentos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      fecharModal();
      await carregarDados(true);
      setMensagem('Agendamento criado com sucesso.');
    } catch (error) {
      setMensagem(error?.message || 'Não foi possível criar o agendamento.');
    } finally {
      setSalvando(false);
    }
  };

  const executarAcao = async (id, acao, textoConfirmacao) => {
    if (!window.confirm(textoConfirmacao)) return;

    setAcaoEmAndamento(String(id));
    setMensagem('');

    try {
      await api.request(`/api/agendamentos/${id}/${acao}`, { method: 'PATCH' });
      await carregarDados(true);
      setMensagem(acao === 'concluir' ? 'Atendimento concluído.' : 'Agendamento cancelado.');
    } catch (error) {
      setMensagem(error?.message || 'Não foi possível atualizar o agendamento.');
    } finally {
      setAcaoEmAndamento('');
    }
  };

  const profissionaisAtivos = profissionais.filter(
    (profissional) => normalizar(obter(profissional, 'status', 'Status')) === 'ativo'
  );

  const hoje = hojeLocal();

  if (carregando) {
    return (
      <div className="agenda-page">
        <div className="agenda-loading">
          <span className="agenda-loader" />
          <p>Preparando sua agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agenda-page">
      <header className="agenda-page-header">
        <div>
          <span className="agenda-eyebrow">GESTÃO DE ATENDIMENTOS</span>
          <h1>Minha Agenda</h1>
          <p>Organize os horários e acompanhe os atendimentos do seu estabelecimento.</p>
        </div>

        <div className="agenda-header-actions">
          <button
            type="button"
            className="agenda-btn agenda-btn--secondary"
            onClick={() => carregarDados(true)}
            disabled={atualizando}
          >
            <FiRefreshCw className={atualizando ? 'agenda-spin' : ''} />
            {atualizando ? 'Atualizando' : 'Atualizar'}
          </button>
          <button
            type="button"
            className="agenda-btn agenda-btn--primary"
            onClick={() => {
              setMensagem('');
              setIsModalOpen(true);
            }}
          >
            <FiPlus /> Novo agendamento
          </button>
        </div>
      </header>

      {erro && (
        <div className="agenda-alert agenda-alert--error">
          <FiAlertCircle />
          <span>{erro}</span>
          <button type="button" onClick={() => carregarDados()} className="agenda-alert-action">
            Tentar novamente
          </button>
        </div>
      )}

      {mensagem && (
        <div className={`agenda-alert ${mensagem.toLowerCase().includes('sucesso') ? 'agenda-alert--success' : 'agenda-alert--error'}`}>
          {mensagem.toLowerCase().includes('sucesso') ? <FiCheck /> : <FiAlertCircle />}
          <span>{mensagem}</span>
          <button type="button" className="agenda-alert-close" onClick={() => setMensagem('')} aria-label="Fechar aviso">
            <FiX />
          </button>
        </div>
      )}

      <section className="agenda-summary" aria-label="Resumo dos agendamentos">
        <article className="agenda-summary-card">
          <span className="agenda-summary-icon"><FiCalendar /></span>
          <div><small>Total de agendamentos</small><strong>{resumo.total}</strong></div>
        </article>
        <article className="agenda-summary-card">
          <span className="agenda-summary-icon agenda-summary-icon--purple"><FiClock /></span>
          <div><small>Agendados</small><strong>{resumo.agendados}</strong></div>
        </article>
        <article className="agenda-summary-card">
          <span className="agenda-summary-icon agenda-summary-icon--green"><FiCheckCircle /></span>
          <div><small>Concluídos</small><strong>{resumo.concluidos}</strong></div>
        </article>
        <article className="agenda-summary-card">
          <span className="agenda-summary-icon agenda-summary-icon--red"><FiXCircle /></span>
          <div><small>Cancelados</small><strong>{resumo.cancelados}</strong></div>
        </article>
      </section>

      {alteracoesFiltradas.length > 0 && (
        <section className="agenda-panel" aria-label="Alterações feitas pelas profissionais">
          <div className="agenda-panel-header">
            <div>
              <h2>Alterações feitas pelas profissionais</h2>
              <p>Atualizações de jornada, folgas e bloqueios sincronizadas com a agenda.</p>
            </div>
          </div>
          <div className="agenda-list">
            {alteracoesFiltradas.map((alteracao) => (
                <article className="agenda-appointment" key={obter(alteracao, 'id', 'Id')}>
                  <div className="agenda-appointment-time">
                    <strong>{formatarDataCompleta(obter(alteracao, 'criadoEm', 'CriadoEm'))}</strong>
                    <span>{formatarHora(obter(alteracao, 'criadoEm', 'CriadoEm'))}</span>
                  </div>
                  <div className="agenda-appointment-main">
                    <h3><FiBriefcase /> {obter(alteracao, 'profissionalNome', 'ProfissionalNome')}</h3>
                    <div className="agenda-appointment-details">
                      <span>{obter(alteracao, 'descricao', 'Descricao')}</span>
                    </div>
                  </div>
                </article>
            ))}
          </div>
        </section>
      )}

      <section className="agenda-panel">
        <div className="agenda-panel-header">
          <div>
            <h2>Lista de atendimentos</h2>
            <p>{agendamentosFiltrados.length} resultado(s) encontrado(s)</p>
          </div>
        </div>

        <div className="agenda-toolbar">
          <label className="agenda-search">
            <FiSearch />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente, serviço ou profissional..."
            />
          </label>

          <label className="agenda-filter">
            <FiFilter />
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="todos">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>

          <label className="agenda-filter">
            <FiBriefcase />
            <select value={filtroProfissional} onChange={(e) => setFiltroProfissional(e.target.value)}>
              <option value="todos">Todas as profissionais</option>
              {profissionais.map((profissional) => (
                <option key={obter(profissional, 'id', 'Id')} value={obter(profissional, 'id', 'Id')}>
                  {obter(profissional, 'nome', 'Nome')}
                </option>
              ))}
            </select>
          </label>

          <label className="agenda-filter">
            <FiCalendar />
            <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
          </label>
        </div>

        {agendamentosFiltrados.length === 0 ? (
          <div className="agenda-empty">
            <span className="agenda-empty-icon"><FiCalendar /></span>
            <h3>{agendamentos.length === 0 ? 'Sua agenda está vazia' : 'Nenhum resultado encontrado'}</h3>
            <p>
              {agendamentos.length === 0
                ? 'Quando um cliente realizar um agendamento, ele aparecerá aqui.'
                : 'Tente alterar a busca ou selecionar outro status.'}
            </p>
            {agendamentos.length === 0 && (
              <button type="button" className="agenda-btn agenda-btn--primary" onClick={() => setIsModalOpen(true)}>
                <FiPlus /> Criar primeiro agendamento
              </button>
            )}
          </div>
        ) : (
          <div className="agenda-list">
            {agendamentosFiltrados.map((agendamento) => {
              const id = obter(agendamento, 'id', 'Id');
              const clienteId = obter(agendamento, 'clienteId', 'ClienteId');
              const servicoId = obter(agendamento, 'servicoId', 'ServicoId');
              const profissionalId = obter(agendamento, 'profissionalId', 'ProfissionalId');
              const dataInicio = obter(agendamento, 'dataHoraInicio', 'DataHoraInicio');
              const statusKey = normalizar(obter(agendamento, 'status', 'Status') || 'agendado');
              const criadoEm = obter(agendamento, 'criadoEm', 'CriadoEm');
              const alteradoEm = obter(agendamento, 'alteradoEm', 'AlteradoEm');
              const foiAlterado = alteradoEm && criadoEm &&
                new Date(alteradoEm).getTime() > new Date(criadoEm).getTime();
              const status = STATUS[statusKey] || { label: statusKey || 'Não informado', className: 'outro' };
              const cancelado = statusKey === 'cancelado';
              const bloqueado = acaoEmAndamento === String(id);

              return (
                <article className={`agenda-appointment ${cancelado ? 'is-cancelled' : ''}`} key={id}>
                  <div className="agenda-appointment-time">
                    <strong>{formatarHora(dataInicio)}</strong>
                    <span>{formatarDataCompleta(dataInicio)}</span>
                  </div>

                  <div className="agenda-appointment-main">
                    <h3><FiUser /> {getClienteNome(clienteId)}</h3>
                    <div className="agenda-appointment-details">
                      <span><FiScissors /> {getServicoNome(servicoId)}</span>
                      <span><FiBriefcase /> {getProfissionalNome(profissionalId)}</span>
                      {foiAlterado && (
                        <span>Atualizado em {new Date(alteradoEm).toLocaleString('pt-BR')}</span>
                      )}
                    </div>
                  </div>

                  <div className="agenda-appointment-actions">
                    <span className={`agenda-status agenda-status--${status.className}`}>
                      <span className="agenda-status-dot" />
                      {status.label}
                    </span>

                    {(statusKey === 'agendado' || statusKey === 'confirmado') && (
                      <>
                        <button
                          type="button"
                          className="agenda-icon-btn agenda-icon-btn--complete"
                          title="Marcar atendimento como concluído"
                          disabled={bloqueado}
                          onClick={() => executarAcao(id, 'concluir', 'Deseja marcar este atendimento como concluído?')}
                        >
                          <FiCheckCircle />
                        </button>
                        <button
                          type="button"
                          className="agenda-icon-btn agenda-icon-btn--cancel"
                          title="Cancelar agendamento"
                          disabled={bloqueado}
                          onClick={() => executarAcao(id, 'cancelar', 'Deseja realmente cancelar este agendamento?')}
                        >
                          <FiXCircle />
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL DE AGENDAMENTO */}
      {isModalOpen && (
        <div className="agenda-modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget && !salvando) fecharModal();
        }}>
          <section className="agenda-modal" role="dialog" aria-modal="true">
            <header className="agenda-modal-header">
              <div>
                <span className="agenda-eyebrow">NOVO ATENDIMENTO</span>
                <h2>Agendar horário</h2>
                <p>Preencha os dados para adicionar à agenda.</p>
              </div>
              <button type="button" className="agenda-modal-close" onClick={fecharModal} disabled={salvando}>
                <FiX />
              </button>
            </header>

            <form onSubmit={handleSalvar} className="agenda-form">
              <label className="agenda-form-field">
                <span>Cliente <b>*</b></span>
                <select required value={formData.clienteId} onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}>
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={obter(cliente, 'id', 'Id')} value={obter(cliente, 'id', 'Id')}>
                      {obter(cliente, 'nome', 'Nome')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="agenda-form-field">
                <span>Serviço <b>*</b></span>
                <select required value={formData.servicoId} onChange={(e) => {
                  setFormData({ ...formData, servicoId: e.target.value });
                  setDataSelecionada('');
                  setHorarioSelecionado('');
                  setDisponibilidade(null);
                }}>
                  <option value="">Selecione um serviço</option>
                  {servicos.map((servico) => (
                    <option key={obter(servico, 'id', 'Id')} value={obter(servico, 'id', 'Id')}>
                      {obter(servico, 'nome', 'Nome')} · {obter(servico, 'duracaoMinutos', 'DuracaoMinutos')} min
                    </option>
                  ))}
                </select>
              </label>

              <label className="agenda-form-field">
                <span>Profissional <b>*</b></span>
                <select required value={formData.profissionalId} onChange={(e) => {
                  setFormData({ ...formData, profissionalId: e.target.value });
                  setDataSelecionada('');
                  setHorarioSelecionado('');
                  setDisponibilidade(null);
                }}>
                  <option value="">Selecione um profissional</option>
                  {profissionaisAtivos.map((profissional) => (
                    <option key={obter(profissional, 'id', 'Id')} value={obter(profissional, 'id', 'Id')}>
                      {obter(profissional, 'nome', 'Nome')}
                    </option>
                  ))}
                </select>
              </label>

              <div className="agenda-form-field">
                <span>Data <b>*</b></span>
                <input
                  type="date"
                  required
                  min={hoje}
                  value={dataSelecionada}
                  onChange={(e) => {
                    setDataSelecionada(e.target.value);
                    setHorarioSelecionado('');
                  }}
                />
              </div>

              <div className="agenda-form-field">
                <SeletorHorarios
                  dataSelecionada={dataSelecionada}
                  duracaoMinutos={duracaoServico}
                  horariosDisponiveis={horariosDisponiveis}
                  horarioSelecionado={horarioSelecionado}
                  onChangeHorario={setHorarioSelecionado}
                />
              </div>

              {mensagem && <p className="agenda-form-error">{mensagem}</p>}

              <footer className="agenda-modal-footer">
                <button type="button" className="agenda-btn agenda-btn--secondary" onClick={fecharModal} disabled={salvando}>
                  Cancelar
                </button>
                <button type="submit" className="agenda-btn agenda-btn--primary" disabled={salvando || profissionaisAtivos.length === 0}>
                  {salvando ? <><FiRefreshCw className="agenda-spin" /> Salvando...</> : <><FiCheck /> Confirmar agendamento</>}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}