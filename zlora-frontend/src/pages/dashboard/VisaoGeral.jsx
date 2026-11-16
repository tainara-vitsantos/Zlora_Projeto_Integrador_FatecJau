import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiUsers, FiTrendingUp, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function VisaoGeral() {
  const { user } = useAuth();
  const [dados, setDados] = useState({ agendamentosHoje: 0, faturamentoMes: 0, novosClientes: 0 });
  const [chartData, setChartData] = useState([]); // Estado para o gráfico
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // Proteção para o link não mostrar "undefined"
  const urlAgendamento = user?.slug ? `${window.location.origin}/${user.slug}` : 'Link não configurado';

  const copiarLink = () => {
    if (!user?.slug) return;
    navigator.clipboard.writeText(urlAgendamento);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  useEffect(() => {
    async function carregarDashboard() {
      try {
        // FASE 2: Busca os dados processados pelo MongoDB em paralelo
        const [resumo, grafico] = await Promise.all([
          api.request('/api/dashboard/resumo'),
          api.request('/api/dashboard/grafico-faturamento')
        ]);
        
        setDados(resumo);
        setChartData(grafico);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDashboard();
  }, []);

  const formatarDinheiro = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  // Customização do Tooltip do gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '12px', border: '1px solid #E0D7FF', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: '600', color: '#6B5B8C', fontSize: '13px' }}>Dia {label}</p>
          <p style={{ margin: '4px 0 0', fontWeight: '800', color: '#6F3CE7', fontSize: '16px' }}>
            {formatarDinheiro(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (carregando) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>Calculando dados no banco...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Olá, {user?.nome}!</h2>
        <p style={{ color: 'var(--zlora-text-soft)' }}>Aqui está o resumo do seu negócio hoje.</p>
      </div>

      {/* CARD DO LINK EXCLUSIVO */}
      <div className="dash-card" style={{ background: 'var(--zlora-primary-soft)', borderColor: 'var(--zlora-border-strong)', marginBottom: '32px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--zlora-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLink /> Seu link de agendamento
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--zlora-text-soft)' }}>
              Envie este link para seus clientes agendarem sozinhos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid var(--zlora-border)' }}>
            <span style={{ fontSize: '14px', color: 'var(--zlora-text-soft)', padding: '8px' }}>{urlAgendamento}</span>
            <button onClick={copiarLink} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '6px' }} disabled={!user?.slug}>
              {copiado ? <><FiCheck /> Copiado!</> : <><FiCopy /> Copiar</>}
            </button>
          </div>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Agendamentos Hoje</p>
            <div className="dash-card-icon"><FiCalendar /></div>
          </div>
          <p className="dash-card-value">{dados.agendamentosHoje}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Atualizado agora</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Faturamento (Mês)</p>
            <div className="dash-card-icon"><FiDollarSign /></div>
          </div>
          <p className="dash-card-value">{formatarDinheiro(dados.faturamentoMes)}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Atualizado agora</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Novos Clientes</p>
            <div className="dash-card-icon"><FiUsers /></div>
          </div>
          <p className="dash-card-value">{dados.novosClientes}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Atualizado agora</span>
        </div>
      </div>

      {/* GRÁFICO DE FATURAMENTO (FASE 2) */}
      <div className="dash-card" style={{ marginTop: '32px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--zlora-dark)', marginBottom: '24px', fontWeight: '700' }}>
          Faturamento dos Últimos 7 Dias
        </h3>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6F3CE7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6F3CE7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0D7FF" />
              <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#6B5B8C', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B5B8C', fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value}`}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke="#6F3CE7" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorFaturamento)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}