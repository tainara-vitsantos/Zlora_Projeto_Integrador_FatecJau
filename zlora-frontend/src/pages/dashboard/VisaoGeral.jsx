import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiUsers, FiTrendingUp, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function VisaoGeral() {
  const { user } = useAuth(); // Pega o usuário logado para acessar o slug
  const [dados, setDados] = useState({ agendamentosHoje: 0, faturamentoMes: 0, novosClientes: 0 });
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // Monta o link público
  const urlAgendamento = `${window.location.origin}/${user?.slug}`;

  // Função para copiar o link
  const copiarLink = () => {
    navigator.clipboard.writeText(urlAgendamento);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  useEffect(() => {
    async function buscarDadosDoBack() {
      try {
        const [agendamentos, clientes] = await Promise.all([
          api.request('/api/agendamentos'),
          api.request('/api/clientes')
        ]);

        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const hojeString = hoje.toISOString().split('T')[0];

        const agendamentosHoje = agendamentos.filter(ag => {
          const dataAg = ag.dataHora || ag.data;
          return dataAg && dataAg.startsWith(hojeString);
        }).length;

        let faturamentoMes = 0;
        agendamentos.forEach(ag => {
          const dataAg = new Date(ag.dataHora || ag.data);
          if (dataAg >= primeiroDiaMes) faturamentoMes += (ag.valor || ag.preco || 0);
        });

        const novosClientes = clientes.filter(cli => {
          const dataCli = cli.dataCadastro || cli.createdAt;
          return dataCli ? new Date(dataCli) >= primeiroDiaMes : false;
        }).length;

        setDados({ agendamentosHoje, faturamentoMes, novosClientes });
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setCarregando(false);
      }
    }
    buscarDadosDoBack();
  }, []);

  const formatarDinheiro = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  if (carregando) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>Buscando dados...</div>;

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
            <button onClick={copiarLink} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
              {copiado ? <><FiCheck /> Copiado!</> : <><FiCopy /> Copiar</>}
            </button>
          </div>
        </div>
      </div>

      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Agendamentos Hoje</p>
            <div className="dash-card-icon"><FiCalendar /></div>
          </div>
          <p className="dash-card-value">{dados.agendamentosHoje}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Dados reais</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Faturamento (Mês)</p>
            <div className="dash-card-icon"><FiDollarSign /></div>
          </div>
          <p className="dash-card-value">{formatarDinheiro(dados.faturamentoMes)}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Dados reais</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Novos Clientes</p>
            <div className="dash-card-icon"><FiUsers /></div>
          </div>
          <p className="dash-card-value">{dados.novosClientes}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Dados reais</span>
        </div>
      </div>
    </div>
  );
}