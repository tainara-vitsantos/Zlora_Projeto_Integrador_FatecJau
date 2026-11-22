import { useEffect, useState } from 'react';
import {
  FiCalendar, FiDollarSign, FiUsers, FiTrendingUp, 
  FiLink, FiCopy, FiCheck, FiActivity, FiPieChart, FiAward
} from 'react-icons/fi';

import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const formatarDinheiro = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

export default function VisaoGeral() {
  const { user } = useAuth();

  const [dados, setDados] = useState({
    agendamentosHoje: 0,
    faturamentoMes: 0,
    novosClientes: 0
  });

  const [faturamentoSemana, setFaturamentoSemana] = useState([]);
  const [servicosMaisRealizados, setServicosMaisRealizados] = useState([]);
  const [statusAgendamentos, setStatusAgendamentos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const urlAgendamento = user?.slug ? `${window.location.origin}/${user.slug}` : 'Link não configurado';

  const copiarLink = async () => {
    if (!user?.slug) return;
    try {
      await navigator.clipboard.writeText(urlAgendamento);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert('Não foi possível copiar o link.');
    }
  };

  useEffect(() => {
    async function buscarDados() {
      try {
        // Puxa os dados otimizados do DashboardController (Aggregations)
        // E também puxa agendamentos/serviços para os gráficos complementares
        const [resumo, grafico, agendamentos, servicos] = await Promise.all([
          api.request('/api/dashboard/resumo'),
          api.request('/api/dashboard/grafico-faturamento'),
          api.request('/api/agendamentos'),
          api.request('/api/servicos')
        ]);

        setDados(resumo);
        setFaturamentoSemana(grafico);

        // Processa os dados locais para os outros gráficos
        const validos = agendamentos.filter(ag => (ag.status || '').toLowerCase() !== 'cancelado');

        // Gráfico 2: Serviços mais realizados
        const contagemServicos = {};
        validos.forEach(ag => {
          const id = ag.servicoId || ag.ServicoId;
          contagemServicos[id] = (contagemServicos[id] || 0) + 1;
        });

        const ranking = servicos.map(servico => ({
          nome: servico.nome || servico.Nome,
          quantidade: contagemServicos[servico.id || servico.Id] || 0
        }))
        .filter(s => s.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);
        
        setServicosMaisRealizados(ranking);

        // Gráfico 3: Status dos agendamentos
        const status = {};
        agendamentos.forEach(ag => {
          const nome = (ag.status || 'não informado').toLowerCase();
          status[nome] = (status[nome] || 0) + 1;
        });

        setStatusAgendamentos(
          Object.entries(status).map(([nome, quantidade]) => ({ nome, quantidade }))
        );

      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setCarregando(false);
      }
    }

    buscarDados();
  }, []);

  if (carregando) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--zlora-text-soft)' }}>Calculando dados do banco...</div>;
  }

  // Cálculos para as alturas das barras (sem Recharts)
  const maiorFaturamento = Math.max(...faturamentoSemana.map(d => d.valor), 1);
  const maiorServico = Math.max(...servicosMaisRealizados.map(s => s.quantidade), 1);
  const totalStatus = statusAgendamentos.reduce((total, s) => total + s.quantidade, 0);

  const coresStatus = {
    agendado: '#ACB1F9',
    confirmado: '#8B91D7',
    concluido: '#20B486',
    cancelado: '#E87979'
  };

  return (
    <div>
      {/* CABEÇALHO */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Olá, {user?.nome}!</h2>
        <p style={{ color: 'var(--zlora-text-soft)' }}>Aqui está o resumo do seu negócio hoje.</p>
      </div>

      {/* LINK DE AGENDAMENTO */}
      <div className="dash-card" style={{ background: 'var(--zlora-primary-soft)', borderColor: 'var(--zlora-border-strong)', marginBottom: 32, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--zlora-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiLink /> Seu link de agendamento
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--zlora-text-soft)' }}>
              Envie este link para seus clientes agendarem sozinhos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, background: '#fff', padding: 8, borderRadius: 8, border: '1px solid var(--zlora-border)' }}>
            <span style={{ fontSize: 14, color: 'var(--zlora-text-soft)', padding: 8 }}>{urlAgendamento}</span>
            <button onClick={copiarLink} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 6 }} disabled={!user?.slug}>
              {copiado ? <><FiCheck /> Copiado!</> : <><FiCopy /> Copiar</>}
            </button>
          </div>
        </div>
      </div>

      {/* INDICADORES PRINCIPAIS */}
      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Agendamentos Hoje</p>
            <div className="dash-card-icon"><FiCalendar /></div>
          </div>
          <p className="dash-card-value">{dados.agendamentosHoje}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Dados via Aggregation</span>
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
          <span className="dash-card-trend"><FiTrendingUp /> Cadastrados neste mês</span>
        </div>
      </div>

      {/* ÁREA DOS GRÁFICOS (Puro CSS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 32 }}>

        {/* GRÁFICO 1: FATURAMENTO NOS ÚLTIMOS 7 DIAS */}
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 6, fontSize: 17 }}>
            <FiActivity style={{ marginRight: 8, marginBottom: -2 }} /> Faturamento (7 dias)
          </h3>
          <p style={{ color: 'var(--zlora-text-soft)', fontSize: 13, marginBottom: 28 }}>
            Receita gerada por dia
          </p>

          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-around', height: 190, gap: 12, borderBottom: '1px solid var(--zlora-border)', paddingBottom: 8 }}>
            {faturamentoSemana.length === 0 ? (
              <p style={{ color: 'var(--zlora-text-soft)', fontSize: 13, paddingBottom: 20 }}>Sem faturamento no período.</p>
            ) : (
              faturamentoSemana.map((dia, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'end', height: '100%', flex: 1, gap: 8 }}>
                  <strong style={{ fontSize: 11, color: 'var(--zlora-primary)' }}>
                    R${dia.valor.toFixed(0)}
                  </strong>
                  <div style={{ 
                    width: '100%', maxWidth: 38, 
                    height: `${Math.max((dia.valor / maiorFaturamento) * 110, 4)}px`, 
                    background: 'linear-gradient(180deg, #8B5CF0 0%, #6F3CE7 100%)', 
                    borderRadius: '7px 7px 2px 2px', 
                    transition: 'height .3s' 
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--zlora-text-soft)' }}>{dia.data}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GRÁFICO 2: SERVIÇOS MAIS REALIZADOS */}
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 6, fontSize: 17 }}>
            <FiAward style={{ marginRight: 8, marginBottom: -2 }} /> Top Serviços
          </h3>
          <p style={{ color: 'var(--zlora-text-soft)', fontSize: 13, marginBottom: 24 }}>
            Os mais agendados por clientes
          </p>

          {servicosMaisRealizados.length === 0 ? (
            <p style={{ color: 'var(--zlora-text-soft)', fontSize: 13 }}>Nenhum serviço agendado.</p>
          ) : (
            servicosMaisRealizados.map((servico, index) => (
              <div key={index} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13 }}>
                  <strong>{servico.nome}</strong>
                  <span>{servico.quantidade}x</span>
                </div>
                <div style={{ height: 9, background: 'var(--zlora-primary-soft)', borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ width: `${(servico.quantidade / maiorServico) * 100}%`, height: '100%', background: 'var(--zlora-primary)', borderRadius: 20 }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* GRÁFICO 3: STATUS DOS AGENDAMENTOS */}
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 6, fontSize: 17 }}>
            <FiPieChart style={{ marginRight: 8, marginBottom: -2 }} /> Situação Geral
          </h3>
          <p style={{ color: 'var(--zlora-text-soft)', fontSize: 13, marginBottom: 24 }}>
            Distribuição de todos os horários
          </p>

          {totalStatus === 0 ? (
            <p style={{ color: 'var(--zlora-text-soft)', fontSize: 13 }}>Nenhum agendamento na base.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {statusAgendamentos.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ textTransform: 'capitalize' }}>{item.nome}</span>
                    <strong>{item.quantidade} ({Math.round(item.quantidade / totalStatus * 100)}%)</strong>
                  </div>
                  <div style={{ height: 9, background: 'var(--zlora-primary-soft)', borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${item.quantidade / totalStatus * 100}%`, 
                      height: '100%', 
                      background: coresStatus[item.nome] || '#8B91D7', 
                      borderRadius: 20 
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}