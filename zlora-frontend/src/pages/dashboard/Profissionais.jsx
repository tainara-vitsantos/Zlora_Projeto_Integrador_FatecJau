import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiPlus, FiX, FiEdit2, FiPhone, FiAward, FiKey } from 'react-icons/fi';
import { api } from '../../services/api';

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Novos estados para a criação de acesso (A funcionalidade da sua amiga)
  const [isAcessoModalOpen, setIsAcessoModalOpen] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [acessoData, setAcessoData] = useState({ email: '', senha: '' });
  
  const [salvando, setSalvando] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '', nome: '', especialidade: '', telefone: '', comissaoPorcentagem: 40, status: 'ativo'
  });

  const carregarProfissionais = async () => {
    try {
      setCarregando(true);
      const data = await api.request('/api/profissionais');
      setProfissionais(data);
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarProfissionais(); }, []);

  const profissionaisFiltrados = profissionais.filter(p => 
    (p.nome || p.Nome || '').toLowerCase().includes(busca.toLowerCase())
  );

  const handleNovo = () => {
    setFormData({ id: '', nome: '', especialidade: '', telefone: '', comissaoPorcentagem: 40, status: 'ativo' });
    setIsEditing(false); setIsModalOpen(true);
  };

  const handleEditar = (p) => {
    setFormData({
      id: p.id || p.Id,
      nome: p.nome || p.Nome,
      especialidade: p.especialidade || p.Especialidade || '',
      telefone: p.telefone || p.Telefone || '',
      comissaoPorcentagem: p.comissaoPorcentagem || p.ComissaoPorcentagem || 40,
      status: p.status || p.Status || 'ativo'
    });
    setIsEditing(true); setIsModalOpen(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      const payload = { ...formData, comissaoPorcentagem: Number(formData.comissaoPorcentagem) };

      if (isEditing) {
        await api.request(`/api/profissionais/${formData.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api.request('/api/profissionais', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false); carregarProfissionais(); 
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  // Função que chama a rota da sua amiga no C#
  const handleCriarAcesso = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      await api.request(`/api/profissionais/${profissionalSelecionado.id || profissionalSelecionado.Id}/acesso`, {
        method: 'POST',
        body: JSON.stringify(acessoData)
      });
      alert('Acesso criado com sucesso! O profissional já pode logar no sistema.');
      setIsAcessoModalOpen(false);
      setAcessoData({ email: '', senha: '' });
      carregarProfissionais();
    } catch (error) {
      alert("Erro ao criar acesso: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Excluir este profissional?")) return;
    try {
      await api.request(`/api/profissionais/${id}`, { method: 'DELETE' });
      carregarProfissionais(); 
    } catch (error) { alert("Erro: " + error.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Minha Equipe</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>Gerencie os profissionais do seu estabelecimento.</p>
        </div>
        <button className="btn btn-primary" onClick={handleNovo}><FiPlus /> Novo Profissional</button>
      </div>

      <div className="dash-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--zlora-text-soft)' }} />
          <input type="text" className="form-control" placeholder="Buscar pelo nome..." value={busca} onChange={e => setBusca(e.target.value)} style={{ paddingLeft: '44px' }} />
        </div>
      </div>

      <div className="table-container">
        {carregando ? <div style={{ padding: '40px', textAlign: 'center' }}>Buscando equipe...</div> : 
         profissionaisFiltrados.length === 0 ? <div style={{ padding: '40px', textAlign: 'center' }}>Nenhum profissional cadastrado.</div> : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Especialidade</th>
                <th>Telefone</th>
                <th>Comissão</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {profissionaisFiltrados.map(p => (
                <tr key={p.id || p.Id}>
                  <td style={{ fontWeight: 600 }}>{p.nome || p.Nome}</td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiAward /> {p.especialidade || p.Especialidade || '-'}</span></td>
                  <td><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone /> {p.telefone || p.Telefone || '-'}</span></td>
                  <td>{p.comissaoPorcentagem || p.ComissaoPorcentagem}%</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: (p.status || p.Status) === 'ativo' ? '#DCFCE7' : '#FEE2E2', color: (p.status || p.Status) === 'ativo' ? '#166534' : '#991B1B' }}>
                      {p.status || p.Status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      
                      {/* BOTÃO DE CRIAR ACESSO (Só aparece se ainda não tiver login criado) */}
                      {!p.usuarioId && !p.UsuarioId && (
                        <button 
                          className="btn-icon" 
                          onClick={() => { setProfissionalSelecionado(p); setIsAcessoModalOpen(true); }} 
                          title="Criar Login de Acesso" 
                          style={{ color: '#F59E0B' }}
                        >
                          <FiKey />
                        </button>
                      )}
                      
                      <button className="btn-icon" onClick={() => handleEditar(p)} style={{ color: 'var(--zlora-primary)' }}><FiEdit2 /></button>
                      <button className="btn-icon" onClick={() => handleExcluir(p.id || p.Id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CRIAR / EDITAR PROFISSIONAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{isEditing ? 'Editar Profissional' : 'Novo Profissional'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label>Nome do Profissional *</label>
                <input type="text" className="form-control" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Especialidade</label>
                <input type="text" className="form-control" placeholder="Ex: Barbeiro, Manicure..." value={formData.especialidade} onChange={e => setFormData({...formData, especialidade: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Telefone</label>
                  <input type="text" className="form-control" placeholder="(00) 00000-0000" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Comissão (%)</label>
                  <input type="number" className="form-control" required min="0" max="100" value={formData.comissaoPorcentagem} onChange={e => setFormData({...formData, comissaoPorcentagem: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAR ACESSO (O código da sua amiga integrado) */}
      {isAcessoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Criar Acesso para {profissionalSelecionado?.nome || profissionalSelecionado?.Nome}</h3>
              <button className="btn-close" onClick={() => setIsAcessoModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCriarAcesso}>
              <div className="form-group">
                <label>E-mail de Login *</label>
                <input type="email" className="form-control" required value={acessoData.email} onChange={e => setAcessoData({...acessoData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Senha (Mín. 8 caracteres) *</label>
                <input type="password" className="form-control" required minLength="8" value={acessoData.senha} onChange={e => setAcessoData({...acessoData, senha: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsAcessoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={salvando}>{salvando ? 'Criando...' : 'Criar Acesso'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}