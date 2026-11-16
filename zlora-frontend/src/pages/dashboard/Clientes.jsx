
import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiPlus, FiX, FiEdit2 } from 'react-icons/fi';
import { api } from '../../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [novoCliente, setNovoCliente] = useState({ Nome: '', Email: '', Telefone: '', Cpf: '', Status: 'ativo' });
  const [salvando, setSalvando] = useState(false);

  const carregarClientes = async () => {
    try {
      setCarregando(true);
      const data = await api.request('/api/clientes');
      // Garante que é uma lista
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => 
    (c.Nome && c.Nome.toLowerCase().includes(busca.toLowerCase())) || 
    (c.nome && c.nome.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      console.log("Enviando para o C#:", novoCliente);

      if (clienteEditando) {
        const id = clienteEditando.Id || clienteEditando.id;

        await api.request(`/api/clientes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(novoCliente)
        });
      } else {
        await api.request('/api/clientes', {
          method: 'POST',
          body: JSON.stringify(novoCliente)
        });
      }
      
      setIsModalOpen(false);
      setClienteEditando(null);
      setNovoCliente({ Nome: '', Email: '', Telefone: '', Cpf: '', Status: 'ativo' });
      carregarClientes(); 
    } catch (error) {
      alert("Erro ao salvar cliente: \n" + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = (cliente) => {
    setClienteEditando(cliente);

    setNovoCliente({
      Nome: cliente.Nome || cliente.nome || '',
      Email: cliente.Email || cliente.email || '',
      Telefone: cliente.Telefone || cliente.telefone || '',
      Cpf: cliente.Cpf || cliente.cpf || '',
      Status: cliente.Status || cliente.status || 'ativo'
    });

    setIsModalOpen(true);
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
        <button className="btn btn-primary" onClick={() => {
          setClienteEditando(null);
          setNovoCliente({ Nome: '', Email: '', Telefone: '', Cpf: '', Status: 'ativo' });
          setIsModalOpen(true);
        }}>
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
              {clientesFiltrados.map(cliente => {
                const id = cliente.Id || cliente.id;
                const nome = cliente.Nome || cliente.nome;
                const email = cliente.Email || cliente.email;
                const telefone = cliente.Telefone || cliente.telefone;

                return (
                  <tr key={id}>
                    <td style={{ fontWeight: 600 }}>{nome}</td>
                    <td>{email || '-'}</td>
                    <td>{telefone || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleEditar(cliente)}
                        title="Editar"
                      >
                        <FiEdit2 />
                      </button>

                      <button 
                        className="btn-icon" 
                        onClick={() => handleExcluir(id)}
                        title="Excluir"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {clienteEditando ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </h3>
              <button className="btn-close" onClick={() => {
                setIsModalOpen(false);
                setClienteEditando(null);
                setNovoCliente({ Nome: '', Email: '', Telefone: '', Cpf: '', Status: 'ativo' });
              }}><FiX /></button>
            </div>
            
            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input 
                  type="text" className="form-control" required
                  value={novoCliente.Nome}
                  onChange={e => setNovoCliente({...novoCliente, Nome: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>CPF</label>
                <input 
                  type="text" className="form-control" 
                  value={novoCliente.Cpf}
                  onChange={e => setNovoCliente({...novoCliente, Cpf: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input 
                  type="email" className="form-control" 
                  value={novoCliente.Email}
                  onChange={e => setNovoCliente({...novoCliente, Email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Telefone / Celular</label>
                <input 
                  type="text" className="form-control" 
                  value={novoCliente.Telefone}
                  onChange={e => setNovoCliente({...novoCliente, Telefone: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => {
                  setIsModalOpen(false);
                  setClienteEditando(null);
                  setNovoCliente({ Nome: '', Email: '', Telefone: '', Cpf: '', Status: 'ativo' });
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={salvando}>
                  {salvando ? 'Salvando...' : clienteEditando ? 'Salvar Alterações' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
