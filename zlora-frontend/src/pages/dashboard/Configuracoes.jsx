import { useState, useEffect, useRef } from 'react';
import {
  FiImage,
  FiSave,
  FiMapPin,
  FiInstagram,
  FiUploadCloud,
  FiLoader,
  FiLink,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiX
} from 'react-icons/fi';

import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

import './Configuracoes.css';

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

  const [uploadandoLogo, setUploadandoLogo] = useState(false);
  const [uploadandoCapa, setUploadandoCapa] = useState(false);

  const [modoLogo, setModoLogo] = useState('arquivo');
  const [modoCapa, setModoCapa] = useState('arquivo');

  const [erroLogo, setErroLogo] = useState(false);
  const [erroCapa, setErroCapa] = useState(false);

  const [mensagem, setMensagem] = useState({
    tipo: '',
    texto: ''
  });

  const logoInputRef = useRef(null);
  const capaInputRef = useRef(null);

  const coresSugeridas = [
    '#6F3CE7',
    '#FF69B4',
    '#FFB6C1',
    '#D4AF37',
    '#2E8B57',
    '#1E3A8A',
    '#111827'
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        console.error('Erro ao carregar configurações:', error);

        setMensagem({
          tipo: 'erro',
          texto: 'Não foi possível carregar as configurações.'
        });
      } finally {
        setCarregando(false);
      }
    }

    carregarConfiguracoes();
  }, []);

  function atualizarCampo(campo, valor) {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    if (campo === 'logoUrl') {
      setErroLogo(false);
    }

    if (campo === 'fotoCapaUrl') {
      setErroCapa(false);
    }

    setMensagem({ tipo: '', texto: '' });
  }

  function validarUrl(url) {
    if (!url.trim()) return true;

    try {
      const endereco = new URL(url);

      return (
        endereco.protocol === 'http:' ||
        endereco.protocol === 'https:'
      );
    } catch {
      return false;
    }
  }

  async function handleUpload(event, tipo) {
    const file = event.target.files?.[0];

    if (!file) return;

    const formatosPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!formatosPermitidos.includes(file.type)) {
      setMensagem({
        tipo: 'erro',
        texto: 'Formato inválido. Escolha uma imagem JPG, PNG ou WEBP.'
      });

      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMensagem({
        tipo: 'erro',
        texto: 'A imagem deve ter no máximo 5 MB.'
      });

      event.target.value = '';
      return;
    }

    const setLoading =
      tipo === 'logo' ? setUploadandoLogo : setUploadandoCapa;

    setLoading(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('@Zlora:token');

      if (!token) {
        throw new Error('Sessão não encontrada. Faça login novamente.');
      }

      const formDataUpload = new FormData();

      formDataUpload.append('arquivo', file);

      const response = await fetch(`${API_URL}/api/empresas/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.mensagem || 'Não foi possível enviar a imagem.');
      }

      if (!data.url) {
        throw new Error('A API não retornou o endereço da imagem.');
      }

      if (tipo === 'logo') {
        atualizarCampo('logoUrl', data.url);
      } else {
        atualizarCampo('fotoCapaUrl', data.url);
      }

      setMensagem({
        tipo: 'sucesso',
        texto: tipo === 'logo'
          ? 'Logo enviada com sucesso!'
          : 'Foto de capa enviada com sucesso!'
      });

    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Erro ao enviar imagem.'
      });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  function removerImagem(tipo) {
    if (tipo === 'logo') {
      atualizarCampo('logoUrl', '');
      setErroLogo(false);
    } else {
      atualizarCampo('fotoCapaUrl', '');
      setErroCapa(false);
    }

    setMensagem({
      tipo: 'sucesso',
      texto: 'Imagem removida. Salve as alterações para confirmar.'
    });
  }

  async function handleSalvar(event) {
    event.preventDefault();

    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.corPrimaria)) {
      setMensagem({
        tipo: 'erro',
        texto: 'Informe uma cor hexadecimal válida.'
      });
      return;
    }

    if (!validarUrl(formData.logoUrl)) {
      setMensagem({
        tipo: 'erro',
        texto: 'O link da logo não é válido. Utilize HTTP ou HTTPS.'
      });
      return;
    }

    if (!validarUrl(formData.fotoCapaUrl)) {
      setMensagem({
        tipo: 'erro',
        texto: 'O link da foto de capa não é válido. Utilize HTTP ou HTTPS.'
      });
      return;
    }

    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      await api.request('/api/empresas/configuracoes', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      setMensagem({
        tipo: 'sucesso',
        texto: 'Configurações salvas com sucesso!'
      });

    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível salvar as configurações.'
      });
    } finally {
      setSalvando(false);
    }
  }

  function renderCampoImagem(tipo) {
    const isLogo = tipo === 'logo';

    const campo = isLogo ? 'logoUrl' : 'fotoCapaUrl';
    const valor = formData[campo];

    const modo = isLogo ? modoLogo : modoCapa;
    const setModo = isLogo ? setModoLogo : setModoCapa;

    const inputRef = isLogo ? logoInputRef : capaInputRef;

    const carregandoImagem = isLogo
      ? uploadandoLogo
      : uploadandoCapa;

    const imagemComErro = isLogo ? erroLogo : erroCapa;
    const setImagemComErro = isLogo ? setErroLogo : setErroCapa;

    return (
      <div className="config-image-field">

        <label className="config-field-label">
          {isLogo ? 'Logo do estabelecimento' : 'Foto de capa'}
        </label>

        <div className="config-image-options">
          <button
            type="button"
            className={`config-image-option ${
              modo === 'arquivo' ? 'active' : ''
            }`}
            onClick={() => setModo('arquivo')}
          >
            <FiUploadCloud size={16} />
            Enviar foto
          </button>

          <button
            type="button"
            className={`config-image-option ${
              modo === 'link' ? 'active' : ''
            }`}
            onClick={() => setModo('link')}
          >
            <FiLink size={16} />
            Usar link
          </button>
        </div>

        {modo === 'arquivo' ? (
          <button
            type="button"
            className={`config-image-upload ${
              carregandoImagem ? 'uploading' : ''
            }`}
            onClick={() => !carregandoImagem && inputRef.current?.click()}
            disabled={carregandoImagem}
          >
            <input
              type="file"
              ref={inputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={event => handleUpload(event, tipo)}
              hidden
            />

            {carregandoImagem ? (
              <div className="config-upload-loading">
                <FiLoader className="config-spin" size={28} />
                <span>Enviando imagem...</span>
              </div>
            ) : (
              <>
                <FiUploadCloud size={30} />

                <strong>
                  {valor ? 'Clique para trocar a imagem' : 'Escolher imagem'}
                </strong>

                <span>JPG, PNG ou WEBP · Máximo 5 MB</span>
              </>
            )}
          </button>
        ) : (
          <div className="config-image-link">
            <div className="config-image-link-input">
              <FiLink size={17} />

              <input
                type="url"
                className="config-input"
                placeholder="https://exemplo.com/imagem.png"
                value={valor}
                onChange={event => atualizarCampo(campo, event.target.value)}
              />
            </div>

            <small>
              Cole o endereço direto da imagem.
            </small>
          </div>
        )}

        {valor && (
          <div className="config-image-preview">

            <div className="config-image-preview-header">
              <span>Pré-visualização</span>

              <button
                type="button"
                className="config-remove-image"
                onClick={() => removerImagem(tipo)}
              >
                <FiTrash2 size={14} />
                Remover
              </button>
            </div>

            {imagemComErro ? (
              <div className="config-image-error">
                <FiAlertCircle size={20} />
                <span>Não foi possível carregar esta imagem.</span>
              </div>
            ) : (
              <img
                src={valor}
                alt={isLogo ? 'Logo do estabelecimento' : 'Foto de capa'}
                className={isLogo
                  ? 'config-image-preview-logo'
                  : 'config-image-preview-cover'}
                onError={() => setImagemComErro(true)}
                onLoad={() => setImagemComErro(false)}
              />
            )}

          </div>
        )}

      </div>
    );
  }

  if (carregando) {
    return (
      <div className="config-loading">
        <span className="config-loader" />
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="configuracoes-page">

      <header className="config-page-header">
        <div>
          <span className="config-eyebrow">PERSONALIZAÇÃO</span>

          <h1>Minha Marca</h1>

          <p>
            Personalize a página de agendamento do seu estabelecimento.
          </p>
        </div>
      </header>

      <div className="config-layout">

        <main className="config-panel">

          <form onSubmit={handleSalvar}>

            {mensagem.texto && (
              <div className={`config-alert config-alert--${mensagem.tipo}`}>
                {mensagem.tipo === 'sucesso'
                  ? <FiCheckCircle size={18} />
                  : <FiAlertCircle size={18} />
                }

                <span>{mensagem.texto}</span>

                <button
                  type="button"
                  className="config-alert-close"
                  onClick={() => setMensagem({ tipo: '', texto: '' })}
                  aria-label="Fechar mensagem"
                >
                  <FiX size={17} />
                </button>
              </div>
            )}

            <section className="config-section">

              <h2 className="config-section-title">
                Identidade visual
              </h2>

              <div className="config-form-field">

                <label className="config-field-label">
                  Cor principal
                </label>

                <div className="config-color-control">

                  <input
                    type="color"
                    className="config-color-picker"
                    value={formData.corPrimaria}
                    onChange={event =>
                      atualizarCampo('corPrimaria', event.target.value)
                    }
                    aria-label="Selecionar cor principal"
                  />

                  <input
                    type="text"
                    className="config-input"
                    value={formData.corPrimaria}
                    onChange={event =>
                      atualizarCampo('corPrimaria', event.target.value)
                    }
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Informe uma cor hexadecimal válida."
                  />

                </div>

                <div className="config-color-options">
                  {coresSugeridas.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      title={cor}
                      aria-label={`Selecionar cor ${cor}`}
                      className={`config-color-option ${
                        formData.corPrimaria.toUpperCase() === cor
                          ? 'active'
                          : ''
                      }`}
                      style={{ '--config-color': cor }}
                      onClick={() => atualizarCampo('corPrimaria', cor)}
                    />
                  ))}
                </div>

              </div>

            </section>

            <section className="config-section">

              <h2 className="config-section-title">
                <FiImage />
                Imagens do estabelecimento
              </h2>

              <p className="config-section-description">
                Escolha imagens para representar sua marca na página de agendamento.
              </p>

              {renderCampoImagem('logo')}

              {renderCampoImagem('capa')}

            </section>

            <section className="config-section">

              <h2 className="config-section-title">
                Contato e localização
              </h2>

              <div className="config-form-field">

                <label className="config-field-label">
                  <FiInstagram />
                  Instagram
                </label>

                <input
                  type="text"
                  className="config-input"
                  placeholder="seuestabelecimento"
                  value={formData.instagram}
                  onChange={event =>
                    atualizarCampo(
                      'instagram',
                      event.target.value.replace(/^@/, '')
                    )
                  }
                />

                <small className="config-field-hint">
                  Informe o usuário sem o @.
                </small>

              </div>

              <div className="config-form-field">

                <label className="config-field-label">
                  <FiMapPin />
                  Endereço completo
                </label>

                <input
                  type="text"
                  className="config-input"
                  placeholder="Rua, número, bairro, cidade - UF"
                  value={formData.endereco}
                  onChange={event =>
                    atualizarCampo('endereco', event.target.value)
                  }
                />

              </div>

            </section>

            <footer className="config-form-footer">

              <button
                type="submit"
                className="config-btn config-btn--primary"
                disabled={
                  salvando ||
                  uploadandoLogo ||
                  uploadandoCapa
                }
              >
                {salvando
                  ? <FiLoader className="config-spin" />
                  : <FiSave />
                }

                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>

              <span>
                As alterações serão aplicadas após salvar.
              </span>

            </footer>

          </form>

        </main>

        <aside className="config-preview-sticky">

          <div className="config-preview-heading">
            <h2>Prévia da página</h2>

            <p>
              Veja como seus clientes visualizarão seu estabelecimento.
            </p>
          </div>

          <div className="config-preview-phone">

            <div className="config-preview-notch" />

            <div className="config-preview-content">

              <div
                className="config-preview-cover"
                style={{
                  backgroundColor: formData.corPrimaria
                }}
              >
                {formData.fotoCapaUrl && !erroCapa && (
                  <img
                    src={formData.fotoCapaUrl}
                    alt="Capa do estabelecimento"
                    onError={() => setErroCapa(true)}
                    onLoad={() => setErroCapa(false)}
                  />
                )}
              </div>

              <div className="config-preview-logo">

                {formData.logoUrl && !erroLogo ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo do estabelecimento"
                    onError={() => setErroLogo(true)}
                    onLoad={() => setErroLogo(false)}
                  />
                ) : (
                  <span style={{ color: formData.corPrimaria }}>
                    {user?.estabelecimento?.charAt(0) || 'S'}
                  </span>
                )}

              </div>

              <div className="config-preview-info">

                <h3>
                  {user?.estabelecimento || 'Seu estabelecimento'}
                </h3>

                {formData.endereco && (
                  <p>{formData.endereco}</p>
                )}

                {formData.instagram && (
                  <p className="config-preview-instagram">
                    @{formData.instagram}
                  </p>
                )}

              </div>

              <div className="config-preview-services">

                <h4>Serviços disponíveis</h4>

                <div className="config-preview-service">

                  <div>
                    <strong>Serviço de exemplo</strong>
                    <small>30 minutos</small>
                  </div>

                  <span
                    className="config-preview-book"
                    style={{ backgroundColor: formData.corPrimaria }}
                  >
                    Agendar
                  </span>

                </div>

              </div>

              <div className="config-preview-footer">
                Prévia ilustrativa da página de agendamento
              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}