import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { api } from '../../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Adicionei os campos exatos do seu Model C#
  const [novoCliente, setNovoCliente] = useState({ Nome: '', Email: '', Telefone: '', Cpf: '' });
  const [salvando, setSalvando] = useState(false);

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      const data = await api.request('/api/clientes');
      setClientes(data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // Filtro ajustado para ler 'Nome' e 'Email' maiúsculos
  const clientesFiltrados = clientes.filter(c => 
    (c.Nome && c.Nome.toLowerCase().includes(busca.toLowerCase())) || 
    (c.Email && c.Email.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      // Envia os dados com as iniciais maiúsculas que o C# espera
      await api.request('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(novoCliente)
      });
      setIsModalOpen(false);
      setNovoCliente({ Nome: '', Email: '', Telefone: '', Cpf: '' });
      carregarClientes(); 
    } catch (error) {
      alert("Erro ao cadastrar cliente: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;
    try {
      await api.request(`/api/clientes/${id}`, { method: 'DELETE' });
      carregarClientes(); 
    } catch (error) {
      alert("Erro ao excluir cliente: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Meus Clientes</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>Gerencie a base de clientes do seu estabelecimento.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Novo Cliente
        </button>
      </div>

      <div className="dash-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--zlora-text-soft)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar por nome ou e-mail..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>
      </div>

      <div className="table-container">
        {carregando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
            Buscando clientes no servidor...
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
            Nenhum cliente encontrado.
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.Id || cliente.id}>
                  <td style={{ fontWeight: 600 }}>{cliente.Nome || cliente.nome}</td>
                  <td>{cliente.Email || cliente.email || '-'}</td>
                  <td>{cliente.Telefone || cliente.telefone || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleExcluir(cliente.Id || cliente.id)}
                      title="Excluir"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Cadastrar Novo Cliente</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            
            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={novoCliente.Nome}
                  onChange={e => setNovoCliente({...novoCliente, Nome: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>CPF</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={novoCliente.Cpf}
                  onChange={e => setNovoCliente({...novoCliente, Cpf: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={novoCliente.Email}
                  onChange={e => setNovoCliente({...novoCliente, Email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Telefone / Celular</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={novoCliente.Telefone}
                  onChange={e => setNovoCliente({...novoCliente, Telefone: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}