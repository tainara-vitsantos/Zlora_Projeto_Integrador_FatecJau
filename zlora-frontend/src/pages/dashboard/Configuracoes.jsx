import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function Configuracoes() {
  const [formData, setFormData] = useState({
    corPrimaria: '#6F3CE7',
    logoUrl: '',
    fotoCapaUrl: '',
    instagram: '',
    endereco: ''
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Busca as configurações no C# quando a tela abre
  useEffect(() => {
    async function carregarConfiguracoes() {
      try {
        const data = await api.request('/api/empresas/configuracoes');
        setFormData({
          corPrimaria: data.corPrimaria || '#6F3CE7',
          logoUrl: data.logoUrl || '',
          fotoCapaUrl: data.fotoCapaUrl || '',
          instagram: data.instagram || '',
          endereco: data.endereco || ''
        });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarConfiguracoes();
  }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.request('/api/empresas/configuracoes', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>Carregando configurações...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Minha Marca</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>Personalize a página de agendamento para os seus clientes.</p>
        </div>
      </div>

      <div className="dash-card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSalvar}>
          <div className="form-group">
            <label>Cor Principal do Salão</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="color" 
                value={formData.corPrimaria}
                onChange={e => setFormData({...formData, corPrimaria: e.target.value})}
                style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
              />
              <input 
                type="text" 
                className="form-control" 
                value={formData.corPrimaria}
                onChange={e => setFormData({...formData, corPrimaria: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL da Logo (Link da imagem)</label>
            <input 
              type="url" 
              className="form-control" 
              placeholder="https://..."
              value={formData.logoUrl}
              onChange={e => setFormData({...formData, logoUrl: e.target.value})}
            />
            <small className="form-hint">Cole o link de uma imagem quadrada de preferência.</small>
          </div>

          <div className="form-group">
            <label>URL da Foto de Capa</label>
            <input 
              type="url" 
              className="form-control" 
              placeholder="https://..."
              value={formData.fotoCapaUrl}
              onChange={e => setFormData({...formData, fotoCapaUrl: e.target.value})}
            />
            <small className="form-hint">Cole o link de uma imagem horizontal (banner).</small>
          </div>

          <div className="form-group">
            <label>Instagram (sem o @)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="studio.da.josie"
              value={formData.instagram}
              onChange={e => setFormData({...formData, instagram: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rua Exemplo, 123 - São Paulo/SP"
              value={formData.endereco}
              onChange={e => setFormData({...formData, endereco: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </div>
  );
}