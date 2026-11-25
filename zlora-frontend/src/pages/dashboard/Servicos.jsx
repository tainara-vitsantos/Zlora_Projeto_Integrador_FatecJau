import { useState, useEffect } from 'react';
import {
  FiSearch,
  FiTrash2,
  FiPlus,
  FiX,
  FiEdit2,
  FiClock,
  FiDollarSign,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiScissors
} from 'react-icons/fi';

import { api } from '../../services/api';
import './Servicos.css';

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  const [mensagem, setMensagem] = useState({
    tipo: '',
    texto: ''
  });

  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    duracaoMinutos: 30,
    preco: 0,
    status: 'ativo'
  });

  function obterCampo(objeto, campo) {
    const campoCapitalizado =
      campo.charAt(0).toUpperCase() + campo.slice(1);

    return objeto[campo] ?? objeto[campoCapitalizado];
  }

  async function carregarServicos() {
    try {
      setCarregando(true);

      const data = await api.request('/api/servicos');

      setServicos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);

      setMensagem({
        tipo: 'erro',
        texto: 'Não foi possível carregar os serviços.'
      });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, []);

  const servicosFiltrados = servicos.filter(servico => {
    const nome = obterCampo(servico, 'nome') || '';
    const status = obterCampo(servico, 'status') || 'ativo';

    const correspondeBusca = nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeStatus =
      filtroStatus === 'todos' || status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  const totalServicos = servicos.length;

  const servicosAtivos = servicos.filter(
    servico => obterCampo(servico, 'status') === 'ativo'
  ).length;

  const servicosInativos = totalServicos - servicosAtivos;

  function abrirNovoServico() {
    setFormData({
      id: '',
      nome: '',
      descricao: '',
      duracaoMinutos: 30,
      preco: 0,
      status: 'ativo'
    });

    setIsEditing(false);
    setMensagem({ tipo: '', texto: '' });
    setIsModalOpen(true);
  }

  function abrirEdicao(servico) {
    setFormData({
      id: obterCampo(servico, 'id'),
      nome: obterCampo(servico, 'nome') || '',
      descricao: obterCampo(servico, 'descricao') || '',
      duracaoMinutos: obterCampo(servico, 'duracaoMinutos') ?? 30,
      preco: obterCampo(servico, 'preco') ?? 0,
      status: obterCampo(servico, 'status') || 'ativo'
    });

    setIsEditing(true);
    setMensagem({ tipo: '', texto: '' });
    setIsModalOpen(true);
  }

  function fecharModal() {
    if (salvando) return;

    setIsModalOpen(false);
    setMensagem({ tipo: '', texto: '' });
  }

  function atualizarCampo(campo, valor) {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  }

  async function handleSalvar(event) {
    event.preventDefault();

    if (!formData.nome.trim()) {
      setMensagem({
        tipo: 'erro',
        texto: 'Informe o nome do serviço.'
      });
      return;
    }

    if (Number(formData.duracaoMinutos) < 5) {
      setMensagem({
        tipo: 'erro',
        texto: 'A duração mínima do serviço é de 5 minutos.'
      });
      return;
    }

    if (Number(formData.preco) < 0) {
      setMensagem({
        tipo: 'erro',
        texto: 'O preço não pode ser negativo.'
      });
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
      duracaoMinutos: Number(formData.duracaoMinutos),
      preco: Number(formData.preco),
      status: formData.status
    };

    try {
      setSalvando(true);
      setMensagem({ tipo: '', texto: '' });

      if (isEditing) {
        await api.request(`/api/servicos/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await api.request('/api/servicos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setIsModalOpen(false);

      setMensagem({
        tipo: 'sucesso',
        texto: isEditing
          ? 'Serviço atualizado com sucesso!'
          : 'Serviço cadastrado com sucesso!'
      });

      await carregarServicos();

    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível salvar o serviço.'
      });
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(servico) {
    const id = obterCampo(servico, 'id');
    const nome = obterCampo(servico, 'nome');

    if (!window.confirm(`Deseja realmente excluir o serviço "${nome}"?`)) {
      return;
    }

    try {
      setExcluindo(id);

      await api.request(`/api/servicos/${id}`, {
        method: 'DELETE'
      });

      setMensagem({
        tipo: 'sucesso',
        texto: 'Serviço excluído com sucesso!'
      });

      await carregarServicos();

    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível excluir o serviço.'
      });
    } finally {
      setExcluindo(null);
    }
  }

  function formatarDinheiro(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(valor) || 0);
  }

  function formatarDuracao(minutos) {
    const valor = Number(minutos) || 0;

    if (valor < 60) {
      return `${valor} min`;
    }

    const horas = Math.floor(valor / 60);
    const minutosRestantes = valor % 60;

    return minutosRestantes > 0
      ? `${horas}h ${minutosRestantes}min`
      : `${horas}h`;
  }

  return (
    <div className="servicos-page">

      <div className="servicos-page-header">
        <div>
          <span className="servicos-eyebrow">
            GESTÃO DO ESTABELECIMENTO
          </span>

          <h1>Meus Serviços</h1>

          <p>
            Gerencie os serviços, preços e durações do seu estabelecimento.
          </p>
        </div>

        <div className="servicos-header-actions">
          <button
            className="servicos-btn servicos-btn--primary"
            onClick={abrirNovoServico}
          >
            <FiPlus size={17} />
            Novo serviço
          </button>
        </div>
      </div>

      {mensagem.texto && (
        <div className={`servicos-alert servicos-alert--${mensagem.tipo}`}>
          {mensagem.tipo === 'sucesso'
            ? <FiCheckCircle size={18} />
            : <FiAlertCircle size={18} />
          }

          <span>{mensagem.texto}</span>

          <button
            className="servicos-alert-close"
            type="button"
            onClick={() => setMensagem({ tipo: '', texto: '' })}
          >
            <FiX size={17} />
          </button>
        </div>
      )}

      <div className="servicos-summary">

        <div className="servicos-summary-card">
          <div className="servicos-summary-icon">
            <FiBriefcase />
          </div>

          <div>
            <small>Total de serviços</small>
            <strong>{totalServicos}</strong>
          </div>
        </div>

        <div className="servicos-summary-card">
          <div className="servicos-summary-icon servicos-summary-icon--green">
            <FiCheckCircle />
          </div>

          <div>
            <small>Serviços ativos</small>
            <strong>{servicosAtivos}</strong>
          </div>
        </div>

        <div className="servicos-summary-card">
          <div className="servicos-summary-icon servicos-summary-icon--red">
            <FiScissors />
          </div>

          <div>
            <small>Serviços inativos</small>
            <strong>{servicosInativos}</strong>
          </div>
        </div>

      </div>

      <div className="servicos-panel">

        <div className="servicos-panel-header">
          <div>
            <h2>Lista de serviços</h2>
            <p>Consulte e gerencie os serviços cadastrados.</p>
          </div>
        </div>

        <div className="servicos-toolbar">

          <div className="servicos-search">
            <FiSearch size={17} />

            <input
              type="text"
              placeholder="Buscar serviço pelo nome..."
              value={busca}
              onChange={event => setBusca(event.target.value)}
            />
          </div>

          <div className="servicos-filter">
            <select
              value={filtroStatus}
              onChange={event => setFiltroStatus(event.target.value)}
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

        </div>

        {carregando ? (
          <div className="servicos-loading">
            <div className="servicos-loader" />
            <p>Carregando serviços...</p>
          </div>
        ) : servicosFiltrados.length === 0 ? (
          <div className="servicos-empty">

            <div className="servicos-empty-icon">
              <FiScissors />
            </div>

            <h3>
              {busca || filtroStatus !== 'todos'
                ? 'Nenhum serviço encontrado'
                : 'Nenhum serviço cadastrado'
              }
            </h3>

            <p>
              {busca || filtroStatus !== 'todos'
                ? 'Tente alterar os filtros ou o termo pesquisado.'
                : 'Cadastre seu primeiro serviço para começar a organizar seus agendamentos.'
              }
            </p>

            {!busca && filtroStatus === 'todos' && (
              <button
                className="servicos-btn servicos-btn--primary"
                onClick={abrirNovoServico}
              >
                <FiPlus size={16} />
                Cadastrar serviço
              </button>
            )}

          </div>
        ) : (
          <div className="servicos-table-wrapper">

            <table className="servicos-table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Duração</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th className="servicos-actions-heading">Ações</th>
                </tr>
              </thead>

              <tbody>
                {servicosFiltrados.map(servico => {
                  const id = obterCampo(servico, 'id');
                  const nome = obterCampo(servico, 'nome');
                  const descricao = obterCampo(servico, 'descricao');
                  const duracao = obterCampo(servico, 'duracaoMinutos');
                  const preco = obterCampo(servico, 'preco');
                  const status = obterCampo(servico, 'status') || 'ativo';

                  return (
                    <tr key={id}>

                      <td>
                        <div className="servicos-name">
                          <div className="servicos-avatar">
                            <FiScissors />
                          </div>

                          <div>
                            <strong>{nome}</strong>

                            {descricao && (
                              <small>{descricao}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="servicos-contact">
                          <FiClock />
                          {formatarDuracao(duracao)}
                        </span>
                      </td>

                      <td className="servicos-price">
                        {formatarDinheiro(preco)}
                      </td>

                      <td>
                        <span className={`servicos-status servicos-status--${status}`}>
                          <span className="servicos-status-dot" />
                          {status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td>
                        <div className="servicos-row-actions">

                          <button
                            className="servicos-icon-btn servicos-icon-btn--edit"
                            onClick={() => abrirEdicao(servico)}
                            title="Editar serviço"
                            type="button"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            className="servicos-icon-btn servicos-icon-btn--delete"
                            onClick={() => handleExcluir(servico)}
                            title="Excluir serviço"
                            type="button"
                            disabled={excluindo === id}
                          >
                            {excluindo === id
                              ? <FiLoader className="servicos-spin" />
                              : <FiTrash2 />
                            }
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>
        )}

      </div>

      {isModalOpen && (
        <div
          className="servicos-modal-overlay"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <div className="servicos-modal">

            <div className="servicos-modal-header">
              <div>
                <h2>
                  {isEditing ? 'Editar serviço' : 'Novo serviço'}
                </h2>

                <p>
                  Preencha as informações do serviço.
                </p>
              </div>

              <button
                className="servicos-modal-close"
                type="button"
                onClick={fecharModal}
                disabled={salvando}
              >
                <FiX />
              </button>
            </div>

            <form className="servicos-form" onSubmit={handleSalvar}>

              {mensagem.texto && (
                <div className={`servicos-alert servicos-alert--${mensagem.tipo}`}>
                  {mensagem.tipo === 'sucesso'
                    ? <FiCheckCircle size={18} />
                    : <FiAlertCircle size={18} />
                  }

                  <span>{mensagem.texto}</span>
                </div>
              )}

              <label className="servicos-form-field">
                Nome do serviço <b>*</b>

                <input
                  type="text"
                  placeholder="Ex.: Corte de cabelo"
                  value={formData.nome}
                  onChange={event => atualizarCampo('nome', event.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              <label className="servicos-form-field">
                Descrição

                <input
                  type="text"
                  placeholder="Descreva brevemente o serviço"
                  value={formData.descricao}
                  onChange={event => atualizarCampo('descricao', event.target.value)}
                  maxLength={250}
                />
              </label>

              <div className="servicos-form-grid">

                <label className="servicos-form-field">
                  Duração (minutos) <b>*</b>

                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={formData.duracaoMinutos}
                    onChange={event => atualizarCampo('duracaoMinutos', event.target.value)}
                    required
                  />
                </label>

                <label className="servicos-form-field">
                  Preço (R$) <b>*</b>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.preco}
                    onChange={event => atualizarCampo('preco', event.target.value)}
                    required
                  />
                </label>

              </div>

              <label className="servicos-form-field">
                Status do serviço

                <select
                  value={formData.status}
                  onChange={event => atualizarCampo('status', event.target.value)}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>

                <small>
                  Serviços inativos não aparecem para os clientes na página de agendamento.
                </small>
              </label>

              <div className="servicos-modal-footer">

                <button
                  type="button"
                  className="servicos-btn servicos-btn--secondary"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="servicos-btn servicos-btn--primary"
                  disabled={salvando}
                >
                  {salvando
                    ? <FiLoader className="servicos-spin" />
                    : <FiCheckCircle />
                  }

                  {salvando ? 'Salvando...' : 'Salvar serviço'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}