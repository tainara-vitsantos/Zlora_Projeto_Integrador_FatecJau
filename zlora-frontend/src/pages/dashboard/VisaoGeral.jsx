import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FiCalendar, FiDollarSign, FiUsers, FiTrendingUp,
  FiLink, FiCopy, FiCheck, FiActivity, FiPieChart, 
  FiAward, FiAlertCircle, FiRefreshCw, FiExternalLink
} from 'react-icons/fi';

import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './VisaoGeral.css';

// --- HELPERS ---

const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);

const formatarMoedaCompacta = (valor) =>
  new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    maximumFractionDigits: 0 
  }).format(Number(valor) || 0);

// --- SUBCOMPONENTES ---

const DashboardSkeleton = () => (
  <div className="dash-skeleton">
    <div className="skeleton-box title" />
    <div className="skeleton-box banner" />
    <div className="dash-cards-grid">
      {[1, 2, 3].map((i) => <div key={i} className="skeleton-box card" />)}
    </div>
    <div className="dash-charts-grid">
      {[1, 2, 3].map((i) => <div key={i} className="skeleton-box chart" />)}
    </div>
  </div>
);

const MetricCard = ({ title, value, icon, subtitle, highlight = false }) => (
  <div className={`dash-card ${highlight ? 'dash-card--highlight' : ''}`}>
    <div className="dash-card-header">
      <span className="dash-card-title">{title}</span>
      <div className="dash-card-icon">{icon}</div>
    </div>
    <strong className="dash-card-value">{value}</strong>
    <div className="dash-card-footer">
      <span className="dash-card-trend">
        <FiTrendingUp /> {subtitle}
      </span>
    </div>
  </div>
);

const RevenueChart = ({ data = [] }) => {
  const maxRevenue = useMemo(() => {
    if (!data.length) return 1;
    return Math.max(...data.map(d => Number(d.valor) || 0), 1);
  }, [data]);

  const totalSemana = useMemo(() => 
    data.reduce((acc, d) => acc + (Number(d.valor) || 0), 0), 
  [data]);

  return (
    <div className="dash-card chart-card">
      <div className="chart-header">
        <div>
          <h3><FiActivity /> Faturamento (7 dias)</h3>
          <p>Receita diária consolidada</p>
        </div>
        <span className="chart-badge">{formatarMoeda(totalSemana)}</span>
      </div>

      <div className="revenue-chart-container">
        {data.length === 0 ? (
          <div className="empty-state">Sem movimentação financeira nos últimos 7 dias.</div>
        ) : (
          data.map((dia, index) => {
            const valor = Number(dia.valor) || 0;
            const alturaPercentual = Math.max((valor / maxRevenue) * 100, 4);
            
            return (
              <div key={dia.data || index} className="revenue-bar-group" title={`${dia.data}: ${formatarMoeda(valor)}`}>
                <span className="revenue-bar-value">
                  {valor > 0 ? formatarMoedaCompacta(valor) : '-'}
                </span>
                <div className="revenue-bar-track">
                  <div 
                    className={`revenue-bar-fill ${valor === 0 ? 'is-empty' : ''}`}
                    style={{ height: `${alturaPercentual}%` }} 
                  />
                </div>
                <span className="revenue-bar-label">{dia.data}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const TopServicesChart = ({ data = [] }) => {
  const maxService = useMemo(() => 
    data.length ? Math.max(...data.map(s => s.quantidade), 1) : 1, 
  [data]);

  return (
    <div className="dash-card chart-card">
      <div className="chart-header">
        <div>
          <h3><FiAward /> Serviços em Destaque</h3>
          <p>Mais solicitados pelos clientes</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">Nenhum serviço agendado até o momento.</div>
      ) : (
        <div className="progress-list">
          {data.map((servico, index) => (
            <div key={servico.nome || index} className="progress-item">
              <div className="progress-info">
                <span className="progress-name" title={servico.nome}>
                  <span className="rank-number">#{index + 1}</span> {servico.nome}
                </span>
                <strong className="progress-count">{servico.quantidade}x</strong>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(servico.quantidade / maxService) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusChart = ({ data = [] }) => {
  const totalStatus = useMemo(() => 
    data.reduce((total, s) => total + s.quantidade, 0), 
  [data]);

  const statusConfig = {
    agendado: { label: 'Agendado', color: '#6366F1' },
    confirmado: { label: 'Confirmado', color: '#3B82F6' },
    concluido: { label: 'Concluído', color: '#10B981' },
    cancelado: { label: 'Cancelado', color: '#EF4444' }
  };

  return (
    <div className="dash-card chart-card">
      <div className="chart-header">
        <div>
          <h3><FiPieChart /> Situação Geral</h3>
          <p>Distribuição por status ({totalStatus} total)</p>
        </div>
      </div>

      {totalStatus === 0 ? (
        <div className="empty-state">Nenhum agendamento registrado na base.</div>
      ) : (
        <div className="progress-list">
          {data.map((item, index) => {
            const key = item.nome?.toLowerCase();
            const config = statusConfig[key] || { label: item.nome, color: '#8B91D7' };
            const percentual = Math.round((item.quantidade / totalStatus) * 100);

            return (
              <div key={key || index} className="progress-item">
                <div className="progress-info">
                  <span className="status-label">
                    <span className="status-dot" style={{ backgroundColor: config.color }} />
                    {config.label}
                  </span>
                  <strong>{item.quantidade} <small>({percentual}%)</small></strong>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percentual}%`, backgroundColor: config.color }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function VisaoGeral() {
  const { user } = useAuth();

  const [dados, setDados] = useState({ agendamentosHoje: 0, faturamentoMes: 0, novosClientes: 0 });
  const [faturamentoSemana, setFaturamentoSemana] = useState([]);
  const [servicosMaisRealizados, setServicosMaisRealizados] = useState([]);
  const [statusAgendamentos, setStatusAgendamentos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [statusCopia, setStatusCopia] = useState('idle'); // 'idle' | 'copied' | 'error'

  const urlAgendamento = user?.slug ? `${window.location.origin}/${user.slug}` : '';

  const copiarLink = useCallback(async () => {
    if (!urlAgendamento) return;
    try {
      await navigator.clipboard.writeText(urlAgendamento);
      setStatusCopia('copied');
      setTimeout(() => setStatusCopia('idle'), 2500);
    } catch {
      setStatusCopia('error');
      setTimeout(() => setStatusCopia('idle'), 2500);
    }
  }, [urlAgendamento]);

  const buscarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [resumo, grafico, agendamentos, servicos] = await Promise.all([
        api.request('/api/dashboard/resumo'),
        api.request('/api/dashboard/grafico-faturamento'),
        api.request('/api/agendamentos'),
        api.request('/api/servicos')
      ]);

      setDados(resumo || { agendamentosHoje: 0, faturamentoMes: 0, novosClientes: 0 });
      setFaturamentoSemana(Array.isArray(grafico) ? grafico : []);

      const listaAgendamentos = Array.isArray(agendamentos) ? agendamentos : [];
      const listaServicos = Array.isArray(servicos) ? servicos : [];

      // 1. Processa Top Serviços (ignorando cancelados)
      const contagemServicos = listaAgendamentos.reduce((acc, ag) => {
        if ((ag.status || '').toLowerCase() === 'cancelado') return acc;
        const id = ag.servicoId ?? ag.ServicoId;
        if (id) acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});

      const ranking = listaServicos
        .map(servico => ({
          nome: servico.nome || servico.Nome || 'Serviço sem nome',
          quantidade: contagemServicos[servico.id ?? servico.Id] || 0
        }))
        .filter(s => s.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      setServicosMaisRealizados(ranking);

      // 2. Processa Status Geral
      const contagemStatus = listaAgendamentos.reduce((acc, ag) => {
        const nome = (ag.status || 'não informado').toLowerCase();
        acc[nome] = (acc[nome] || 0) + 1;
        return acc;
      }, {});

      const ordemStatus = ['agendado', 'confirmado', 'concluido', 'cancelado'];
      const statusFormatado = Object.entries(contagemStatus)
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => {
          const idxA = ordemStatus.indexOf(a.nome);
          const idxB = ordemStatus.indexOf(b.nome);
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });

      setStatusAgendamentos(statusFormatado);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setErro('Não foi possível sincronizar os dados do painel. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  if (carregando) return <DashboardSkeleton />;

  if (erro) {
    return (
      <div className="dash-error-state">
        <FiAlertCircle size={42} />
        <h3>Falha ao carregar o painel</h3>
        <p>{erro}</p>
        <button onClick={buscarDados} className="btn btn-primary">
          <FiRefreshCw /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* CABEÇALHO */}
      <header className="dash-header">
        <div>
          <h2>Olá, {user?.nome?.split(' ')[0] || 'Gestor'}!</h2>
          <p>Acompanhe o desempenho e os agendamentos do seu negócio.</p>
        </div>
      </header>

      {/* BANNER LINK DE AGENDAMENTO */}
      <section className="dash-card share-banner">
        <div className="share-info">
          <h3><FiLink /> Link exclusivo de agendamento</h3>
          <p>Compartilhe nas suas redes sociais ou WhatsApp para seus clientes agendarem online.</p>
        </div>

        <div className="share-actions">
          <div className="share-url-box">
            <span>{urlAgendamento || 'Configure seu slug nas configurações'}</span>
          </div>
          
          <button 
            onClick={copiarLink} 
            className={`btn btn-sm ${statusCopia === 'copied' ? 'btn-success' : 'btn-primary'}`}
            disabled={!urlAgendamento}
            title="Copiar link de agendamento"
          >
            {statusCopia === 'copied' ? <><FiCheck /> Copiado</> : <><FiCopy /> Copiar</>}
          </button>

          {urlAgendamento && (
            <a 
              href={urlAgendamento} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-sm btn-outline btn-icon"
              title="Abrir página de agendamento"
            >
              <FiExternalLink />
            </a>
          )}
        </div>
      </section>

      {/* MÉTRICAS PRINCIPAIS */}
      <section className="dash-cards-grid">
        <MetricCard 
          title="Agendamentos Hoje" 
          value={dados.agendamentosHoje} 
          icon={<FiCalendar />} 
          subtitle="Horários marcados para hoje" 
        />
        <MetricCard 
          title="Faturamento (Mês)" 
          value={formatarMoeda(dados.faturamentoMes)} 
          icon={<FiDollarSign />} 
          subtitle="Receita acumulada no mês"
          highlight
        />
        <MetricCard 
          title="Novos Clientes" 
          value={dados.novosClientes} 
          icon={<FiUsers />} 
          subtitle="Cadastros realizados no mês" 
        />
      </section>

      {/* GRÁFICOS E RANKINGS */}
      <section className="dash-charts-grid">
        <RevenueChart data={faturamentoSemana} />
        <TopServicesChart data={servicosMaisRealizados} />
        <StatusChart data={statusAgendamentos} />
      </section>
    </div>
  );
}