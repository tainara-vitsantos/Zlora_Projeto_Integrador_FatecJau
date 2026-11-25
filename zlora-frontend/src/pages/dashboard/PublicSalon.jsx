import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FiClock, FiInstagram, FiMapPin, FiCalendar, FiX, 
  FiUser, FiPhone, FiCheckCircle, FiBriefcase, FiAlertCircle 
} from 'react-icons/fi';

import './PublicSalon.css';

const obter = (obj, ...chaves) => {
  for (const chave of chaves) {
    if (obj?.[chave] !== undefined && obj?.[chave] !== null) return obj[chave];
  }
  return '';
};

const formatarPreco = (valor) => {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function PublicSalon() {
  const { slug } = useParams();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  
  // Estados do Modal
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [etapaAgendamento, setEtapaAgendamento] = useState('');
  const [formCliente, setFormCliente] = useState({ nome: '', telefone: '', profissionalId: '', dataHora: '' });
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  useEffect(() => {
    async function buscarDados() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/publico/${slug}`);
        
        if (!response.ok) throw new Error('Salão não encontrado');
        
        const data = await response.json();
        setDados(data);
      } catch (error) {
        console.error(error);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }
    buscarDados();
  }, [slug]);

  const abrirAgendamento = (servico) => {
    setServicoSelecionado(servico);
    setEtapaAgendamento('form');
    setErroForm('');
    setFormCliente({ nome: '', telefone: '', profissionalId: '', dataHora: '' });
  };

  const fecharModal = () => {
    if (enviando) return;
    setServicoSelecionado(null);
    setEtapaAgendamento('');
    setErroForm('');
  };

  const confirmarAgendamento = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErroForm('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/publico/${slug}/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formCliente.nome.trim(),
          telefone: formCliente.telefone.trim(),
          servicoId: obter(servicoSelecionado, 'id', 'Id'),
          profissionalId: formCliente.profissionalId,
          dataHoraInicio: new Date(formCliente.dataHora).toISOString()
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.mensagem || 'Erro ao agendar.');

      setEtapaAgendamento('sucesso');
    } catch (error) {
      setErroForm(error.message);
    } finally {
      setEnviando(false);
    }
  };

  // --- RENDERIZAÇÃO DE ESTADOS ---
  if (carregando) {
    return (
      <div className="public-loading">
        <div className="public-spinner" />
        <p>Carregando informações...</p>
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="public-error">
        <FiAlertCircle size={48} />
        <h2>Estabelecimento não encontrado</h2>
        <p>O link que você acessou pode estar incorreto ou o estabelecimento não existe mais.</p>
      </div>
    );
  }

  const corMarca = dados.empresa.corPrimaria || '#6F3CE7';
  const estiloCapa = dados.empresa.fotoCapaUrl 
    ? { backgroundImage: `url(${dados.empresa.fotoCapaUrl})` }
    : { background: `linear-gradient(135deg, ${corMarca} 0%, #1B1130 100%)` };
    
  // Pega a data e hora atual no formato do input datetime-local para travar datas passadas
  const dataMinima = new Date();
  dataMinima.setMinutes(dataMinima.getMinutes() - dataMinima.getTimezoneOffset());
  const minDateTime = dataMinima.toISOString().slice(0, 16);

  return (
    <div className="public-page" style={{ '--brand-color': corMarca }}>
      
      {/* HEADER */}
      <header className="public-header">
        <div className="public-cover" style={estiloCapa} />
        <div className="public-logo">
          {dados.empresa.logoUrl ? (
            <img src={dados.empresa.logoUrl} alt={`Logo ${dados.empresa.nome}`} />
          ) : (
            <span>{dados.empresa.nome.charAt(0)}</span>
          )}
        </div>
      </header>

      {/* INFORMAÇÕES DO SALÃO */}
      <div className="public-info">
        <h1>{dados.empresa.nome}</h1>
        <div className="public-meta">
          {dados.empresa.endereco && (
            <span><FiMapPin /> {dados.empresa.endereco}</span>
          )}
          {dados.empresa.instagram && (
            <a href={`https://instagram.com/${dados.empresa.instagram}`} target="_blank" rel="noreferrer">
              <FiInstagram /> @{dados.empresa.instagram}
            </a>
          )}
        </div>
      </div>

      {/* LISTA DE SERVIÇOS */}
      <main className="public-main">
        <h2 className="public-section-title"><FiCalendar /> Serviços Disponíveis</h2>
        
        <div className="public-services-list">
          {dados.servicos.length === 0 ? (
            <div className="public-empty">Nenhum serviço disponível no momento.</div>
          ) : (
            dados.servicos.map(servico => (
              <div key={obter(servico, 'id', 'Id')} className="public-service-card">
                <div className="service-info">
                  {(servico.imagemUrl || servico.ImagemUrl) && (
                    <img src={servico.imagemUrl || servico.ImagemUrl} alt={servico.nome || servico.Nome} className="service-image" />
                  )}
                  <div>
                    <h3>{servico.nome || servico.Nome}</h3>
                    <p>{servico.descricao || servico.Descricao || 'Sem descrição.'}</p>
                    <span className="service-duration"><FiClock /> {servico.duracaoMinutos || servico.DuracaoMinutos} min</span>
                  </div>
                </div>
                
                <div className="service-action">
                  <div className="service-price">{formatarPreco(servico.preco || servico.Preco)}</div>
                  <button onClick={() => abrirAgendamento(servico)} className="btn-book">Agendar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      <footer className="public-footer">
        Agendamento online feito com <strong>Zlora</strong>
      </footer>

      {/* MODAL DE AGENDAMENTO */}
      {servicoSelecionado && (
        <div className="public-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) fecharModal(); }}>
          <div className="public-modal">
            
            <div className="modal-header">
              <div>
                <h3>Confirmar Agendamento</h3>
                <p>{servicoSelecionado.nome || servicoSelecionado.Nome}</p>
              </div>
              <button onClick={fecharModal} className="btn-close-modal"><FiX size={20} /></button>
            </div>

            <div className="modal-body">
              {etapaAgendamento === 'form' ? (
                <form onSubmit={confirmarAgendamento}>
                  
                  {erroForm && (
                    <div className="form-error"><FiAlertCircle /> {erroForm}</div>
                  )}

                  <div className="input-group">
                    <label>Seu Nome Completo *</label>
                    <div className="input-wrapper">
                      <FiUser className="input-icon" />
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: Maria Silva" 
                        value={formCliente.nome} 
                        onChange={e => setFormCliente({ ...formCliente, nome: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Seu WhatsApp *</label>
                    <div className="input-wrapper">
                      <FiPhone className="input-icon" />
                      <input 
                        type="tel" 
                        required 
                        placeholder="(00) 00000-0000" 
                        value={formCliente.telefone} 
                        onChange={e => setFormCliente({ ...formCliente, telefone: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Profissional *</label>
                    <div className="input-wrapper">
                      <FiBriefcase className="input-icon" />
                      <select 
                        required 
                        value={formCliente.profissionalId} 
                        onChange={e => setFormCliente({ ...formCliente, profissionalId: e.target.value })}
                      >
                        <option value="">Selecione...</option>
                        {dados.profissionais?.map(p => (
                          <option key={obter(p, 'id', 'Id')} value={obter(p, 'id', 'Id')}>
                            {p.nome || p.Nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Data e Hora *</label>
                    <input 
                      type="datetime-local" 
                      required 
                      min={minDateTime}
                      value={formCliente.dataHora} 
                      onChange={e => setFormCliente({ ...formCliente, dataHora: e.target.value })} 
                    />
                  </div>

                  <div className="modal-total">
                    <span>Total a pagar</span>
                    <strong>{formatarPreco(servicoSelecionado.preco || servicoSelecionado.Preco)}</strong>
                  </div>

                  <button type="submit" disabled={enviando} className="btn-submit">
                    {enviando ? 'Confirmando...' : 'Confirmar Agendamento'}
                  </button>
                </form>
              ) : (
                <div className="modal-success">
                  <FiCheckCircle size={64} color="#10B981" />
                  <h3>Agendamento Confirmado!</h3>
                  <p>Enviamos os detalhes para o WhatsApp do salão. Te esperamos lá!</p>
                  <button onClick={fecharModal} className="btn-close-success">Fechar</button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}