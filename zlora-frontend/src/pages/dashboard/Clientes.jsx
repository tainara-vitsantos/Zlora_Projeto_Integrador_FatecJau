import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiPlus,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiMail,
  FiPhone,
  FiUser,
} from 'react-icons/fi';

import { api } from '../../services/api';
import './Clientes.css';

const CLIENTE_VAZIO = {
  Nome: '',
  Email: '',
  Telefone: '',
  Cpf: '',
  Status: 'ativo',
};

const obter = (obj, ...chaves) => {
  for (const chave of chaves) {
    if (obj?.[chave] !== undefined && obj?.[chave] !== null) {
      return obj[chave];
    }
  }

  return '';
};

const normalizar = (valor) =>
  String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const obterLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values)) return data.$values;

  return [];
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState('');

  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [formData, setFormData] = useState(CLIENTE_VAZIO);

  // ==========================================
  // CARREGAR CLIENTES
  // ==========================================

  const carregarClientes = useCallback(async (silencioso = false) => {
    if (silencioso) setAtualizando(true);
    else setCarregando(true);

    setErro('');
    
    try {
      const data = await api.request('/api/clientes');

      setClientes(obterLista(data));
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);

      setErro(
        error?.message ||
        'Não foi possível carregar os clientes.'
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  // ==========================================
  // RESUMO
  // ==========================================

  const resumo = useMemo(() => {
    const ativos = clientes.filter(
      (cliente) =>
        normalizar(obter(cliente, 'status', 'Status') || 'ativo') === 'ativo'
    );

    const inativos = clientes.filter(
      (cliente) =>
        normalizar(obter(cliente, 'status', 'Status')) === 'inativo'
    );

    return {
      total: clientes.length,
      ativos: ativos.length,
      inativos: inativos.length,
    };
  }, [clientes]);

  // ==========================================
  // PESQUISA E FILTROS
  // ==========================================

  const clientesFiltrados = useMemo(() => {
    const termo = normalizar(busca);

    return clientes.filter((cliente) => {
      const nome = obter(cliente, 'nome', 'Nome');
      const email = obter(cliente, 'email', 'Email');
      const telefone = obter(cliente, 'telefone', 'Telefone');
      const cpf = obter(cliente, 'cpf', 'Cpf');
      const status = normalizar(
        obter(cliente, 'status', 'Status') || 'ativo'
      );

      const correspondeBusca = normalizar(
        [nome, email, telefone, cpf].join(' ')
      ).includes(termo);

      const correspondeStatus =
        filtroStatus === 'todos' || status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [clientes, busca, filtroStatus]);

  // ==========================================
  // MODAL
  // ==========================================

  const abrirCadastro = () => {
    setClienteEditando(null);
    setFormData({ ...CLIENTE_VAZIO });
    setMensagem('');
    setIsModalOpen(true);
  };

  const abrirEdicao = (cliente) => {
    setClienteEditando(cliente);

    setFormData({
      Nome: obter(cliente, 'nome', 'Nome'),
      Email: obter(cliente, 'email', 'Email'),
      Telefone: obter(cliente, 'telefone', 'Telefone'),
      Cpf: obter(cliente, 'cpf', 'Cpf'),
      Status: obter(cliente, 'status', 'Status') || 'ativo',
    });

    setMensagem('');
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    if (salvando) return;

    setIsModalOpen(false);
    setClienteEditando(null);
    setFormData({ ...CLIENTE_VAZIO });
    setMensagem('');
  };

  const atualizarCampo = (campo, valor) => {
    setFormData((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  // ==========================================
  // SALVAR CLIENTE
  // ==========================================

  const handleSalvar = async (e) => {
    e.preventDefault();

    if (!formData.Nome.trim()) {
      setMensagem('Informe o nome do cliente.');
      return;
    }

    try {
      setSalvando(true);
      setMensagem('');

      const dados = {
        Nome: formData.Nome.trim(),
        Email: formData.Email.trim(),
        Telefone: formData.Telefone.trim(),
        Cpf: formData.Cpf.trim(),
        Status: formData.Status,
      };

      if (clienteEditando) {
        const id = obter(clienteEditando, 'id', 'Id', '_id');

        if (!id) {
          throw new Error('Não foi possível identificar o cliente.');
        }

        await api.request(`/api/clientes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(dados),
        });
      } else {
        await api.request('/api/clientes', {
          method: 'POST',
          body: JSON.stringify(dados),
        });
      }

      setIsModalOpen(false);
      setClienteEditando(null);
      setFormData({ ...CLIENTE_VAZIO });

      await carregarClientes(true);

      setMensagem(
        clienteEditando
          ? 'Cliente atualizado com sucesso.'
          : 'Cliente cadastrado com sucesso.'
      );
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);

      setMensagem(
        error?.message || 'Não foi possível salvar o cliente.'
      );
    } finally {
      setSalvando(false);
    }
  };

  // ==========================================
  // EXCLUIR CLIENTE
  // ==========================================

  const handleExcluir = async (cliente) => {
    const id = obter(cliente, 'id', 'Id', '_id');

    const nome = obter(cliente, 'nome', 'Nome');

    if (!id) {
      setMensagem('Não foi possível identificar o cliente.');
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir o cliente ${nome}?`
    );

    if (!confirmar) return;

    try {
      setExcluindo(String(id));
      setMensagem('');

      await api.request(`/api/clientes/${id}`, {
        method: 'DELETE',
      });

      setClientes((anterior) =>
        anterior.filter(
          (item) =>
            String(obter(item, 'id', 'Id', '_id')) !== String(id)
        )
      );

      setMensagem('Cliente excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);

      setMensagem(
        error?.message || 'Não foi possível excluir o cliente.'
      );
    } finally {
      setExcluindo('');
    }
  };

  // ==========================================
  // CARREGAMENTO
  // ==========================================

  if (carregando) {
    return (
      <div className="clientes-page">
        <div className="clientes-loading">
          <span className="clientes-loader" />
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  return (
    <div className="clientes-page">

      {/* CABEÇALHO */}

      <header className="clientes-page-header">
        <div>
          <span className="clientes-eyebrow">
            GESTÃO DE CLIENTES
          </span>

          <h1>Meus Clientes</h1>

          <p>
            Gerencie as informações e acompanhe a base de clientes
            do seu estabelecimento.
          </p>
        </div>

        <div className="clientes-header-actions">
          <button
            type="button"
            className="clientes-btn clientes-btn--secondary"
            onClick={() => carregarClientes(true)}
            disabled={atualizando}
          >
            <FiRefreshCw
              className={atualizando ? 'clientes-spin' : ''}
            />

            {atualizando ? 'Atualizando' : 'Atualizar'}
          </button>

          <button
            type="button"
            className="clientes-btn clientes-btn--primary"
            onClick={abrirCadastro}
          >
            <FiPlus />
            Novo cliente
          </button>
        </div>
      </header>

      {/* ERRO */}

      {erro && (
        <div className="clientes-alert clientes-alert--error">
          <FiAlertCircle />
          <span>{erro}</span>

          <button
            type="button"
            onClick={() => carregarClientes()}
            className="clientes-alert-action"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* MENSAGEM */}

      {mensagem && (
        <div
          className={`clientes-alert ${
            mensagem.toLowerCase().includes('sucesso')
              ? 'clientes-alert--success'
              : 'clientes-alert--error'
          }`}
        >
          {mensagem.toLowerCase().includes('sucesso')
            ? <FiCheck />
            : <FiAlertCircle />}

          <span>{mensagem}</span>

          <button
            type="button"
            className="clientes-alert-close"
            onClick={() => setMensagem('')}
            aria-label="Fechar aviso"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* INDICADORES */}

      <section className="clientes-summary">

        <article className="clientes-summary-card">
          <span className="clientes-summary-icon">
            <FiUsers />
          </span>

          <div>
            <small>Total de clientes</small>
            <strong>{resumo.total}</strong>
          </div>
        </article>

        <article className="clientes-summary-card">
          <span className="clientes-summary-icon clientes-summary-icon--green">
            <FiUserCheck />
          </span>

          <div>
            <small>Clientes ativos</small>
            <strong>{resumo.ativos}</strong>
          </div>
        </article>

        <article className="clientes-summary-card">
          <span className="clientes-summary-icon clientes-summary-icon--red">
            <FiUserX />
          </span>

          <div>
            <small>Clientes inativos</small>
            <strong>{resumo.inativos}</strong>
          </div>
        </article>

      </section>

      {/* LISTAGEM */}

      <section className="clientes-panel">

        <div className="clientes-panel-header">
          <div>
            <h2>Base de clientes</h2>

            <p>
              {clientesFiltrados.length}
              {' '}
              {clientesFiltrados.length === 1
                ? 'cliente encontrado'
                : 'clientes encontrados'}
            </p>
          </div>
        </div>

        {/* PESQUISA E FILTROS */}

        <div className="clientes-toolbar">

          <label className="clientes-search">
            <FiSearch />

            <input
              type="search"
              placeholder="Buscar por nome, e-mail, telefone ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar clientes"
            />
          </label>

          <label className="clientes-filter">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              aria-label="Filtrar clientes por status"
            >
              <option value="todos">Todos os clientes</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </label>

        </div>

        {/* LISTA VAZIA */}

        {clientesFiltrados.length === 0 ? (

          <div className="clientes-empty">

            <span className="clientes-empty-icon">
              <FiUsers />
            </span>

            <h3>
              {clientes.length === 0
                ? 'Sua base de clientes está vazia'
                : 'Nenhum cliente encontrado'}
            </h3>

            <p>
              {clientes.length === 0
                ? 'Cadastre seu primeiro cliente para começar a organizar sua base.'
                : 'Experimente alterar os termos da busca ou o filtro selecionado.'}
            </p>

            {clientes.length === 0 && (
              <button
                type="button"
                className="clientes-btn clientes-btn--primary"
                onClick={abrirCadastro}
              >
                <FiPlus />
                Cadastrar primeiro cliente
              </button>
            )}

          </div>

        ) : (

          /* TABELA */

          <div className="clientes-table-wrapper">
            <table className="clientes-table">

              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Status</th>
                  <th className="clientes-actions-heading">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => {

                  const id = obter(cliente, 'id', 'Id', '_id');

                  const nome = obter(cliente, 'nome', 'Nome');

                  const email = obter(cliente, 'email', 'Email');

                  const telefone = obter(cliente, 'telefone', 'Telefone');

                  const cpf = obter(cliente, 'cpf', 'Cpf');

                  const status = normalizar(
                    obter(cliente, 'status', 'Status') || 'ativo'
                  );

                  return (
                    <tr key={id}>

                      <td>
                        <div className="clientes-name">
                          <span className="clientes-avatar">
                            <FiUser />
                          </span>

                          <strong>{nome || 'Sem nome'}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="clientes-contact">
                          <FiMail />
                          {email || 'Não informado'}
                        </span>
                      </td>

                      <td>
                        <span className="clientes-contact">
                          <FiPhone />
                          {telefone || 'Não informado'}
                        </span>
                      </td>

                      <td>{cpf || '—'}</td>

                      <td>
                        <span
                          className={`clientes-status clientes-status--${
                            status === 'ativo' ? 'ativo' : 'inativo'
                          }`}
                        >
                          <span className="clientes-status-dot" />

                          {status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td>
                        <div className="clientes-row-actions">

                          <button
                            type="button"
                            className="clientes-icon-btn clientes-icon-btn--edit"
                            title="Editar cliente"
                            aria-label={`Editar ${nome}`}
                            onClick={() => abrirEdicao(cliente)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="clientes-icon-btn clientes-icon-btn--delete"
                            title="Excluir cliente"
                            aria-label={`Excluir ${nome}`}
                            disabled={excluindo === String(id)}
                            onClick={() => handleExcluir(cliente)}
                          >
                            <FiTrash2 />
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

      </section>

      {/* MODAL */}

      {isModalOpen && (

        <div
          className="clientes-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !salvando) {
              fecharModal();
            }
          }}
        >

          <section
            className="clientes-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clientes-modal-title"
          >

            <header className="clientes-modal-header">

              <div>
                <span className="clientes-eyebrow">
                  GESTÃO DE CLIENTES
                </span>

                <h2 id="clientes-modal-title">
                  {clienteEditando
                    ? 'Editar cliente'
                    : 'Novo cliente'}
                </h2>

                <p>
                  {clienteEditando
                    ? 'Atualize as informações cadastrais.'
                    : 'Preencha os dados para cadastrar um novo cliente.'}
                </p>
              </div>

              <button
                type="button"
                className="clientes-modal-close"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar modal"
              >
                <FiX />
              </button>

            </header>

            <form
              className="clientes-form"
              onSubmit={handleSalvar}
            >

              <label className="clientes-form-field">
                <span>Nome completo <b>*</b></span>

                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Nome do cliente"
                  value={formData.Nome}
                  onChange={(e) =>
                    atualizarCampo('Nome', e.target.value)
                  }
                />
              </label>

              <label className="clientes-form-field">
                <span>CPF</span>

                <input
                  type="text"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={formData.Cpf}
                  onChange={(e) =>
                    atualizarCampo('Cpf', e.target.value)
                  }
                />
              </label>

              <label className="clientes-form-field">
                <span>E-mail</span>

                <input
                  type="email"
                  maxLength={150}
                  placeholder="cliente@email.com"
                  value={formData.Email}
                  onChange={(e) =>
                    atualizarCampo('Email', e.target.value)
                  }
                />
              </label>

              <label className="clientes-form-field">
                <span>Telefone / Celular</span>

                <input
                  type="tel"
                  maxLength={20}
                  placeholder="(00) 00000-0000"
                  value={formData.Telefone}
                  onChange={(e) =>
                    atualizarCampo('Telefone', e.target.value)
                  }
                />
              </label>

              <label className="clientes-form-field">
                <span>Status</span>

                <select
                  value={formData.Status}
                  onChange={(e) =>
                    atualizarCampo('Status', e.target.value)
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>

              {mensagem && (
                <p className="clientes-form-error">
                  {mensagem}
                </p>
              )}

              <footer className="clientes-modal-footer">

                <button
                  type="button"
                  className="clientes-btn clientes-btn--secondary"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="clientes-btn clientes-btn--primary"
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <FiRefreshCw className="clientes-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      {clienteEditando
                        ? 'Salvar alterações'
                        : 'Cadastrar cliente'}
                    </>
                  )}
                </button>

              </footer>

            </form>

          </section>

        </div>

      )}

    </div>
  );
}