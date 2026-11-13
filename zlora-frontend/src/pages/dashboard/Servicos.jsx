import { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiPlus, FiX, FiEdit2, FiClock } from 'react-icons/fi';
import { api } from '../../services/api';

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    duracaoMinutos: 30,
    preco: 0,
    status: 'ativo'
  });

  const carregarServicos = async () => {
    try {
      setCarregando(true);
      const data = await api.request('/api/servicos');
      setServicos(data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  // Filtro de pesquisa
  const servicosFiltrados = servicos.filter(s => 
    (s.nome || s.Nome || '').toLowerCase().includes(busca.toLowerCase())
  );

  const handleNovoServico = () => {
    setFormData({ id: '', nome: '', descricao: '', duracaoMinutos: 30, preco: 0, status: 'ativo' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditarServico = (servico) => {
    setFormData({
      id: servico.id || servico.Id,
      nome: servico.nome || servico.Nome,
      descricao: servico.descricao || servico.Descricao || '',
      duracaoMinutos: servico.duracaoMinutos || servico.DuracaoMinutos,
      preco: servico.preco || servico.Preco,
      status: servico.status || servico.Status || 'ativo'
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      
      // Monta o JSON exatamente como o Model do C# espera
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        duracaoMinutos: Number(formData.duracaoMinutos),
        preco: Number(formData.preco),
        status: formData.status
      };

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
      carregarServicos(); 
    } catch (error) {
      alert("Erro ao salvar serviço: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      await api.request(`/api/servicos/${id}`, { method: 'DELETE' });
      carregarServicos(); 
    } catch (error) {
      alert("Erro ao excluir serviço: " + error.message);
    }
  };

  const formatarDinheiro = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const formatarDuracao = (minutos) => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const minRestantes = minutos % 60;
    return minRestantes > 0 ? `${horas}h ${minRestantes}min` : `${horas}h`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Meus Serviços</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>Gerencie os serviços, preços e durações do seu estabelecimento.</p>
        </div>
        <button className="btn btn-primary" onClick={handleNovoServico}>
          <FiPlus /> Novo Serviço
        </button>
      </div>

      <div className="dash-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--zlora-text-soft)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Buscar serviço pelo nome..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>
      </div>

      <div className="table-container">
        {carregando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
            Buscando serviços no servidor...
          </div>
        ) : servicosFiltrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
            Nenhum serviço encontrado.
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Duração</th>
                <th>Preço</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicosFiltrados.map(servico => {
                const id = servico.id || servico.Id;
                const nome = servico.nome || servico.Nome;
                const desc = servico.descricao || servico.Descricao;
                const duracao = servico.duracaoMinutos || servico.DuracaoMinutos;
                const preco = servico.preco || servico.Preco;
                const status = servico.status || servico.Status;

                return (
                  <tr key={id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{nome}</div>
                      {desc && <div style={{ fontSize: '12px', color: 'var(--zlora-text-soft)' }}>{desc}</div>}
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--zlora-text-soft)' }}>
                        <FiClock size={14} /> {formatarDuracao(duracao)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatarDinheiro(preco)}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                        background: status === 'ativo' ? '#DCFCE7' : '#FEE2E2',
                        color: status === 'ativo' ? '#166534' : '#991B1B'
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleEditarServico(servico)}
                          title="Editar"
                          style={{ color: 'var(--zlora-primary)' }}
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            
            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label>Nome do Serviço *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  placeholder="Ex: Corte Degradê"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Descrição (Opcional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ex: Corte na tesoura e máquina"
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Duração (min) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required
                    min="5"
                    max="1440"
                    value={formData.duracaoMinutos}
                    onChange={e => setFormData({...formData, duracaoMinutos: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Preço (R$) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status do Serviço</label>
                <select 
                  className="form-control"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ativo">Ativo (Aparece no agendamento)</option>
                  <option value="inativo">Inativo (Oculto para clientes)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}