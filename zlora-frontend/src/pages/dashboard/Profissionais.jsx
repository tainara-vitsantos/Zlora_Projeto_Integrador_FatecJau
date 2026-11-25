import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiSearch, FiTrash2, FiPlus, FiX, FiEdit2, FiPhone, 
  FiAward, FiKey, FiLoader, FiCheckCircle, FiAlertCircle, 
  FiUser, FiUsers, FiMail, FiPercent, FiRefreshCw, 
  FiFilter, FiCheck, FiUserCheck, FiUserX
} from 'react-icons/fi';

import { api } from '../../services/api';
import './Profissionais.css';

const obter = (obj, ...chaves) => {
  for (const chave of chaves) {
    if (obj?.[chave] !== undefined && obj?.[chave] !== null) return obj[chave];
  }
  return '';
};

const normalizar = (valor) =>
  String(valor ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAcessoModalOpen, setIsAcessoModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState('');

  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const [formData, setFormData] = useState({
    id: '', nome: '', especialidade: '', telefone: '', comissaoPorcentagem: 40, status: 'ativo'
  });

  const [acessoData, setAcessoData] = useState({ email: '', senha: '' });

  // ==========================================
  // CARREGAR DADOS
  // ==========================================
  const carregarProfissionais = useCallback(async (silencioso = false) => {
    if (silencioso) setAtualizando(true);
    else setCarregando(true);

    setMensagem({ tipo: '', texto: '' });

    try {
      const data = await api.request('/api/profissionais');
      setProfissionais(Array.isArray(data) ? data : []);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível carregar os profissionais.' });
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => { carregarProfissionais(); }, [carregarProfissionais]);

  // ==========================================
  // RESUMO E FILTROS
  // ==========================================
  const resumo = useMemo(() => {
    const ativos = profissionais.filter((p) => normalizar(obter(p, 'status', 'Status') || 'ativo') === 'ativo');
    return {
      total: profissionais.length,
      ativos: ativos.length,
      inativos: profissionais.length - ativos.length
    };
  }, [profissionais]);

  const profissionaisFiltrados = useMemo(() => {
    const termo = normalizar(busca);
    return profissionais.filter((p) => {
      const nome = obter(p, 'nome', 'Nome');
      const especialidade = obter(p, 'especialidade', 'Especialidade');
      const status = normalizar(obter(p, 'status', 'Status') || 'ativo');

      const correspondeBusca = normalizar([nome, especialidade].join(' ')).includes(termo);
      const correspondeStatus = filtroStatus === 'todos' || status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [profissionais, busca, filtroStatus]);

  // ==========================================
  // AÇÕES E MODAIS
  // ==========================================
  function limparMensagem() { setMensagem({ tipo: '', texto: '' }); }

  function abrirNovoProfissional() {
    setFormData({ id: '', nome: '', especialidade: '', telefone: '', comissaoPorcentagem: 40, status: 'ativo' });
    setIsEditing(false);
    limparMensagem();
    setIsModalOpen(true);
  }

  function abrirEdicao(profissional) {
    setFormData({
      id: obter(profissional, 'id', 'Id'),
      nome: obter(profissional, 'nome', 'Nome'),
      especialidade: obter(profissional, 'especialidade', 'Especialidade'),
      telefone: obter(profissional, 'telefone', 'Telefone'),
      comissaoPorcentagem: obter(profissional, 'comissaoPorcentagem', 'ComissaoPorcentagem', 40),
      status: obter(profissional, 'status', 'Status', 'ativo')
    });
    setIsEditing(true);
    limparMensagem();
    setIsModalOpen(true);
  }

  function abrirModalAcesso(profissional) {
    setProfissionalSelecionado(profissional);
    setAcessoData({ email: '', senha: '' });
    limparMensagem();
    setIsAcessoModalOpen(true);
  }

  function fecharModais() {
    if (salvando) return;
    setIsModalOpen(false);
    setIsAcessoModalOpen(false);
    setProfissionalSelecionado(null);
    limparMensagem();
  }

  async function handleSalvar(event) {
    event.preventDefault();
    try {
      setSalvando(true);
      limparMensagem();

      const payload = {
        nome: formData.nome.trim(),
        especialidade: formData.especialidade.trim(),
        telefone: formData.telefone.trim(),
        comissaoPorcentagem: Number(formData.comissaoPorcentagem),
        status: formData.status
      };

      if (isEditing) {
        await api.request(`/api/profissionais/${formData.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api.request('/api/profissionais', { method: 'POST', body: JSON.stringify(payload) });
      }

      setIsModalOpen(false);
      setMensagem({ tipo: 'sucesso', texto: isEditing ? 'Profissional atualizado com sucesso!' : 'Profissional cadastrado com sucesso!' });
      await carregarProfissionais(true);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível salvar o profissional.' });
    } finally {
      setSalvando(false);
    }
  }

  async function handleCriarAcesso(event) {
    event.preventDefault();
    if (!profissionalSelecionado) return;

    try {
      setSalvando(true);
      limparMensagem();

      const id = obter(profissionalSelecionado, 'id', 'Id');
      await api.request(`/api/profissionais/${id}/acesso`, {
        method: 'POST',
        body: JSON.stringify({ email: acessoData.email.trim(), senha: acessoData.senha })
      });

      setIsAcessoModalOpen(false);
      setMensagem({ tipo: 'sucesso', texto: 'Acesso criado com sucesso!' });
      setAcessoData({ email: '', senha: '' });
      await carregarProfissionais(true);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível criar o acesso.' });
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(profissional) {
    const nome = obter(profissional, 'nome', 'Nome');
    const id = obter(profissional, 'id', 'Id');

    if (!window.confirm(`Deseja realmente excluir o profissional ${nome}?`)) return;

    try {
      setExcluindo(String(id));
      limparMensagem();
      await api.request(`/api/profissionais/${id}`, { method: 'DELETE' });
      setMensagem({ tipo: 'sucesso', texto: 'Profissional excluído com sucesso!' });
      await carregarProfissionais(true);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível excluir o profissional.' });
    } finally {
      setExcluindo('');
    }
  }

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  if (carregando) {
    return (
      <div className="profissionais-page">
        <div className="profissionais-loading">
          <span className="profissionais-loader" />
          <p>Carregando equipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profissionais-page">
      
      {/* CABEÇALHO PADRÃO */}
      <header className="profissionais-page-header">
        <div>
          <span className="profissionais-eyebrow">GESTÃO DE EQUIPE</span>
          <h1>Minha Equipe</h1>
          <p>Gerencie os profissionais, especialidades e acessos do seu estabelecimento.</p>
        </div>

        <div className="profissionais-header-actions">
          <button type="button" className="profissionais-btn profissionais-btn--secondary" onClick={() => carregarProfissionais(true)} disabled={atualizando}>
            <FiRefreshCw className={atualizando ? 'profissionais-spin' : ''} />
            {atualizando ? 'Atualizando' : 'Atualizar'}
          </button>
          <button type="button" className="profissionais-btn profissionais-btn--primary" onClick={abrirNovoProfissional}>
            <FiPlus /> Novo profissional
          </button>
        </div>
      </header>

      {/* ALERTAS PADRÃO */}
      {mensagem.texto && (
        <div className={`profissionais-alert ${mensagem.tipo === 'sucesso' ? 'profissionais-alert--success' : 'profissionais-alert--error'}`}>
          {mensagem.tipo === 'sucesso' ? <FiCheck /> : <FiAlertCircle />}
          <span>{mensagem.texto}</span>
          <button type="button" className="profissionais-alert-close" onClick={limparMensagem}>
            <FiX />
          </button>
        </div>
      )}

      {/* CARDS DE RESUMO PADRÃO */}
      <section className="profissionais-summary">
        <article className="profissionais-summary-card">
          <span className="profissionais-summary-icon"><FiUsers /></span>
          <div><small>Total de profissionais</small><strong>{resumo.total}</strong></div>
        </article>
        <article className="profissionais-summary-card">
          <span className="profissionais-summary-icon profissionais-summary-icon--green"><FiUserCheck /></span>
          <div><small>Profissionais ativos</small><strong>{resumo.ativos}</strong></div>
        </article>
        <article className="profissionais-summary-card">
          <span className="profissionais-summary-icon profissionais-summary-icon--red"><FiUserX /></span>
          <div><small>Profissionais inativos</small><strong>{resumo.inativos}</strong></div>
        </article>
      </section>

      {/* PAINEL PADRÃO */}
      <section className="profissionais-panel">
        <div className="profissionais-panel-header">
          <div>
            <h2>Base da equipe</h2>
            <p>{profissionaisFiltrados.length} resultado(s) encontrado(s)</p>
          </div>
        </div>

        <div className="profissionais-toolbar">
          <label className="profissionais-search">
            <FiSearch />
            <input
              type="search"
              placeholder="Buscar por nome ou especialidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>

          <label className="profissionais-filter">
            <FiFilter />
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </label>
        </div>

        {profissionaisFiltrados.length === 0 ? (
          <div className="profissionais-empty">
            <span className="profissionais-empty-icon"><FiUsers /></span>
            <h3>{busca || filtroStatus !== 'todos' ? 'Nenhum profissional encontrado' : 'Sua equipe ainda está vazia'}</h3>
            <p>
              {busca || filtroStatus !== 'todos'
                ? 'Tente alterar os termos da busca ou o filtro selecionado.'
                : 'Cadastre seu primeiro profissional para começar a organizar sua equipe.'}
            </p>
            {!busca && filtroStatus === 'todos' && (
              <button type="button" className="profissionais-btn profissionais-btn--primary" onClick={abrirNovoProfissional}>
                <FiPlus /> Cadastrar profissional
              </button>
            )}
          </div>
        ) : (
          <div className="profissionais-table-wrapper">
            <table className="profissionais-table">
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Especialidade</th>
                  <th>Telefone</th>
                  <th>Comissão</th>
                  <th>Status</th>
                  <th className="profissionais-actions-heading">Ações</th>
                </tr>
              </thead>
              <tbody>
                {profissionaisFiltrados.map((profissional) => {
                  const id = obter(profissional, 'id', 'Id');
                  const nome = obter(profissional, 'nome', 'Nome');
                  const especialidade = obter(profissional, 'especialidade', 'Especialidade');
                  const telefone = obter(profissional, 'telefone', 'Telefone');
                  const comissao = obter(profissional, 'comissaoPorcentagem', 'ComissaoPorcentagem', 0);
                  const status = normalizar(obter(profissional, 'status', 'Status', 'ativo'));
                  const usuarioId = obter(profissional, 'usuarioId', 'UsuarioId', null);
                  const isExcluindo = excluindo === String(id);

                  return (
                    <tr key={id}>
                      <td>
                        <div className="profissionais-name">
                          <span className="profissionais-avatar">{nome?.charAt(0)?.toUpperCase() || <FiUser />}</span>
                          <div>
                            <strong>{nome}</strong>
                            <small>{usuarioId ? 'Acesso cadastrado' : 'Sem acesso'}</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="profissionais-contact"><FiAward /> {especialidade || '-'}</span></td>
                      <td><span className="profissionais-contact"><FiPhone /> {telefone || '-'}</span></td>
                      <td><span className="profissionais-contact"><FiPercent /> {Number(comissao).toLocaleString('pt-BR')}%</span></td>
                      <td>
                        <span className={`profissionais-status profissionais-status--${status === 'ativo' ? 'ativo' : 'inativo'}`}>
                          <span className="profissionais-status-dot" />
                          {status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="profissionais-row-actions">
                          {!usuarioId && (
                            <button type="button" className="profissionais-icon-btn profissionais-icon-btn--access" onClick={() => abrirModalAcesso(profissional)} title="Criar acesso">
                              <FiKey />
                            </button>
                          )}
                          <button type="button" className="profissionais-icon-btn profissionais-icon-btn--edit" onClick={() => abrirEdicao(profissional)} title="Editar">
                            <FiEdit2 />
                          </button>
                          <button type="button" className="profissionais-icon-btn profissionais-icon-btn--delete" onClick={() => handleExcluir(profissional)} disabled={isExcluindo} title="Excluir">
                            {isExcluindo ? <FiLoader className="profissionais-spin" /> : <FiTrash2 />}
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

      {/* MODAL DE CADASTRO/EDIÇÃO PADRÃO */}
      {isModalOpen && (
        <div className="profissionais-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !salvando) fecharModais(); }}>
          <section className="profissionais-modal">
            <header className="profissionais-modal-header">
              <div>
                <span className="profissionais-eyebrow">GESTÃO DE EQUIPE</span>
                <h2>{isEditing ? 'Editar profissional' : 'Novo profissional'}</h2>
                <p>{isEditing ? 'Atualize as informações.' : 'Preencha os dados para cadastrar.'}</p>
              </div>
              <button type="button" className="profissionais-modal-close" onClick={fecharModais} disabled={salvando}><FiX /></button>
            </header>

            <form className="profissionais-form" onSubmit={handleSalvar}>
              <label className="profissionais-form-field">
                <span>Nome do profissional *</span>
                <input type="text" required maxLength={120} placeholder="Nome completo" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
              </label>
              
              <label className="profissionais-form-field">
                <span>Especialidade</span>
                <input type="text" maxLength={100} placeholder="Ex.: Barbeiro, Manicure..." value={formData.especialidade} onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })} />
              </label>

              <label className="profissionais-form-field">
                <span>Telefone</span>
                <input type="tel" maxLength={20} placeholder="(00) 00000-0000" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
              </label>

              <label className="profissionais-form-field">
                <span>Comissão (%) *</span>
                <input type="number" required min="0" max="100" step="0.01" value={formData.comissaoPorcentagem} onChange={(e) => setFormData({ ...formData, comissaoPorcentagem: e.target.value })} />
              </label>

              <label className="profissionais-form-field">
                <span>Status</span>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>

              <footer className="profissionais-modal-footer">
                <button type="button" className="profissionais-btn profissionais-btn--secondary" onClick={fecharModais} disabled={salvando}>Cancelar</button>
                <button type="submit" className="profissionais-btn profissionais-btn--primary" disabled={salvando}>
                  {salvando ? <><FiRefreshCw className="profissionais-spin" /> Salvando...</> : <><FiCheck /> Salvar</>}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* MODAL DE ACESSO PADRÃO */}
      {isAcessoModalOpen && (
        <div className="profissionais-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !salvando) fecharModais(); }}>
          <section className="profissionais-modal">
            <header className="profissionais-modal-header">
              <div>
                <span className="profissionais-eyebrow">SEGURANÇA</span>
                <h2>Criar acesso</h2>
                <p>Configure o login de <strong>{obter(profissionalSelecionado, 'nome', 'Nome')}</strong>.</p>
              </div>
              <button type="button" className="profissionais-modal-close" onClick={fecharModais} disabled={salvando}><FiX /></button>
            </header>

            <form className="profissionais-form" onSubmit={handleCriarAcesso}>
              <label className="profissionais-form-field">
                <span>E-mail de login *</span>
                <input type="email" required placeholder="profissional@email.com" value={acessoData.email} onChange={(e) => setAcessoData({ ...acessoData, email: e.target.value })} />
              </label>

              <label className="profissionais-form-field">
                <span>Senha *</span>
                <input type="password" required minLength={8} placeholder="Mínimo 8 caracteres" value={acessoData.senha} onChange={(e) => setAcessoData({ ...acessoData, senha: e.target.value })} />
              </label>

              <footer className="profissionais-modal-footer">
                <button type="button" className="profissionais-btn profissionais-btn--secondary" onClick={fecharModais} disabled={salvando}>Cancelar</button>
                <button type="submit" className="profissionais-btn profissionais-btn--primary" disabled={salvando}>
                  {salvando ? <><FiRefreshCw className="profissionais-spin" /> Criando...</> : <><FiKey /> Criar acesso</>}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}