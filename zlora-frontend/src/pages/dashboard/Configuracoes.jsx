import { useState, useEffect, useRef } from 'react';
import { FiImage, FiInfo, FiSave, FiMapPin, FiInstagram, FiUploadCloud, FiLoader } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Configuracoes() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    corPrimaria: '#6F3CE7',
    logoUrl: '',
    fotoCapaUrl: '',
    instagram: '',
    endereco: ''
  });
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  // Estados para controlar o carregamento das fotos
  const [uploadandoLogo, setUploadandoLogo] = useState(false);
  const [uploadandoCapa, setUploadandoCapa] = useState(false);
  
  // Referências para os inputs de arquivo ocultos
  const logoInputRef = useRef(null);
  const capaInputRef = useRef(null);

  const coresSugeridas = ['#6F3CE7', '#FF69B4', '#FFB6C1', '#D4AF37', '#2E8B57', '#1E3A8A', '#111827'];

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

  // Função para fazer o upload da imagem para o C#
  const handleUpload = async (event, tipo) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('arquivo', file);

    const setLoading = tipo === 'logo' ? setUploadandoLogo : setUploadandoCapa;
    setLoading(true);

    try {
      const token = localStorage.getItem('@Zlora:token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Requisição específica para upload (não usamos a api.request porque ela envia JSON)
      const response = await fetch(`${API_URL}/api/empresas/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload // Envia o arquivo puro
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.mensagem || 'Erro no upload');

      // Atualiza o estado com a URL que o C# devolveu
      if (tipo === 'logo') {
        setFormData(prev => ({ ...prev, logoUrl: data.url }));
      } else {
        setFormData(prev => ({ ...prev, fotoCapaUrl: data.url }));
      }
    } catch (error) {
      alert("Erro ao enviar imagem: " + error.message);
    } finally {
      setLoading(false);
      // Limpa o input para permitir subir a mesma imagem novamente se quiser
      event.target.value = null; 
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);
    try {
      await api.request('/api/empresas/configuracoes', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>;

  return (
    <div>
      {/* CSS para a animação de rodinha */}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>

      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Minha Marca</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>Personalize a página de agendamento e veja como seus clientes vão ver.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px', alignItems: 'start' }}>
        
        {/* COLUNA 1: FORMULÁRIO */}
        <div className="dash-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSalvar}>
            
            {/* 1. SEÇÃO DE CORES */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--zlora-border)', paddingBottom: '12px', marginBottom: '20px' }}>Identidade Visual</h3>
              
              <div className="form-group">
                <label>Cor Principal</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <input 
                    type="color" value={formData.corPrimaria}
                    onChange={e => setFormData({...formData, corPrimaria: e.target.value})}
                    style={{ width: '56px', height: '56px', padding: '4px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <input type="text" className="form-control" value={formData.corPrimaria} onChange={e => setFormData({...formData, corPrimaria: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {coresSugeridas.map(cor => (
                    <button key={cor} type="button" onClick={() => setFormData({...formData, corPrimaria: cor})}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: cor, border: formData.corPrimaria === cor ? '3px solid #111' : '1px solid #ccc', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* 2. SEÇÃO DE IMAGENS (UPLOAD) */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--zlora-border)', paddingBottom: '12px', marginBottom: '20px' }}>Imagens do Salão</h3>
              
              {/* Upload Logo */}
              <div className="form-group">
                <label>Logo do Salão (Foto redonda)</label>
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  style={{ border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#F9FAFB', transition: 'all 0.2s' }}
                >
                  <input type="file" ref={logoInputRef} onChange={(e) => handleUpload(e, 'logo')} accept="image/*" style={{ display: 'none' }} />
                  {uploadandoLogo ? (
                    <FiLoader className="spin" size={24} color="var(--zlora-primary)" style={{ margin: '0 auto' }} />
                  ) : formData.logoUrl ? (
                    <div>
                      <img src={formData.logoUrl} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--zlora-primary)', fontWeight: '600' }}>Clique para trocar a logo</p>
                    </div>
                  ) : (
                    <div>
                      <FiUploadCloud size={32} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
                      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Clique para enviar a logo</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9CA3AF' }}>JPG, PNG ou WEBP (Máx 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Capa */}
              <div className="form-group">
                <label>Foto de Capa (Banner)</label>
                <div 
                  onClick={() => capaInputRef.current?.click()}
                  style={{ border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#F9FAFB', transition: 'all 0.2s' }}
                >
                  <input type="file" ref={capaInputRef} onChange={(e) => handleUpload(e, 'capa')} accept="image/*" style={{ display: 'none' }} />
                  {uploadandoCapa ? (
                    <FiLoader className="spin" size={24} color="var(--zlora-primary)" style={{ margin: '0 auto' }} />
                  ) : formData.fotoCapaUrl ? (
                    <div>
                      <img src={formData.fotoCapaUrl} alt="Capa" style={{ width: '100%', height: '120px', borderRadius: '8px', objectFit: 'cover', margin: '0 auto 12px' }} />
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--zlora-primary)', fontWeight: '600' }}>Clique para trocar a capa</p>
                    </div>
                  ) : (
                    <div>
                      <FiUploadCloud size={32} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
                      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Clique para enviar a capa</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9CA3AF' }}>JPG, PNG ou WEBP (Máx 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. CONTATO */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--zlora-border)', paddingBottom: '12px', marginBottom: '20px' }}>Contato e Localização</h3>
              
              <div className="form-group">
                <label><FiInstagram style={{ marginBottom: '-2px' }}/> Instagram (sem o @)</label>
                <input type="text" className="form-control" placeholder="paulo.hair" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
              </div>

              <div className="form-group">
                <label><FiMapPin style={{ marginBottom: '-2px' }}/> Endereço Completo</label>
                <input type="text" className="form-control" placeholder="Av. Paulista, 1000 - São Paulo/SP" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
              </div>
            </div>

            {/* BOTÃO SALVAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={salvando || uploadandoLogo || uploadandoCapa} style={{ padding: '14px 28px', fontSize: '16px' }}>
                <FiSave style={{ marginRight: '8px', marginBottom: '-2px' }} />
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              {sucesso && <span style={{ color: '#16A34A', fontWeight: '600', fontSize: '14px' }}>✓ Salvo com sucesso!</span>}
            </div>
          </form>
        </div>

        {/* COLUNA 2: PREVIEW EM TEMPO REAL */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <p style={{ textAlign: 'center', fontWeight: '600', color: 'var(--zlora-text-soft)', marginBottom: '16px' }}>Como o cliente vê:</p>
          
          <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto', background: '#fff', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '8px solid #111', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '24px', background: '#111', width: '50%', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', margin: '0 auto', position: 'relative', zIndex: 10 }}></div>
            
            <div style={{ height: '550px', overflowY: 'auto', background: '#F8F9FA', position: 'relative' }}>
              <div style={{ height: '140px', background: formData.fotoCapaUrl ? `url(${formData.fotoCapaUrl}) center/cover` : formData.corPrimaria, borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }} />

              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#fff', margin: '-35px auto 0', position: 'relative', border: '4px solid #fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: formData.corPrimaria }}>{user?.estabelecimento?.charAt(0) || 'S'}</span>
                )}
              </div>

              <div style={{ textAlign: 'center', padding: '12px 16px' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#111' }}>{user?.estabelecimento || 'Seu Salão'}</h4>
                {formData.endereco && <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>{formData.endereco}</p>}
                {formData.instagram && <p style={{ margin: '4px 0 0', fontSize: '11px', color: formData.corPrimaria, fontWeight: 'bold' }}>@{formData.instagram}</p>}
              </div>

              <div style={{ padding: '0 16px 20px' }}>
                <h5 style={{ fontSize: '12px', color: '#111', margin: '0 0 10px' }}>Serviços Disponíveis</h5>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#111' }}>Corte Masculino</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>30 min</div>
                  </div>
                  <button style={{ background: formData.corPrimaria, color: '#fff', border: 0, padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>Agendar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}