import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { api } from '../../services/api';

export default function VisaoGeral() {
  const [dados, setDados] = useState({
    agendamentosHoje: 0,
    faturamentoMes: 0,
    novosClientes: 0
  });
  
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarDadosDoBack() {
      try {
        // Busca as duas rotas que JÁ EXISTEM no seu C#
        const [agendamentos, clientes] = await Promise.all([
          api.request('/api/agendamentos'),
          api.request('/api/clientes')
        ]);

        // --- CÁLCULO NO FRONT-END ---
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const hojeString = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD

        // 1. Agendamentos de Hoje
        const agendamentosHoje = agendamentos.filter(ag => {
          const dataAg = ag.dataHora || ag.data; // Tenta achar o campo de data
          return dataAg && dataAg.startsWith(hojeString);
        }).length;

        // 2. Faturamento do Mês
        // Atenção: Aqui ele tenta somar "valor", "preco" ou "preço". 
        // Se no seu C# o campo tiver outro nome, é só ajustar aqui embaixo.
        let faturamentoMes = 0;
        agendamentos.forEach(ag => {
          const dataAg = new Date(ag.dataHora || ag.data);
          if (dataAg >= primeiroDiaMes) {
            faturamentoMes += (ag.valor || ag.preco || 0);
          }
        });

        // 3. Novos Clientes (cadastrados este mês)
        const novosClientes = clientes.filter(cli => {
          const dataCli = cli.dataCadastro || cli.createdAt;
          if (!dataCli) return false;
          return new Date(dataCli) >= primeiroDiaMes;
        }).length;

        setDados({
          agendamentosHoje,
          faturamentoMes,
          novosClientes
        });

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setCarregando(false);
      }
    }

    buscarDadosDoBack();
  }, []);

  // Formata dinheiro para o padrão brasileiro
  const formatarDinheiro = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  if (carregando) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
        <p>Buscando dados no servidor...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Olá, bem-vindo(a)!</h2>
        <p style={{ color: 'var(--zlora-text-soft)' }}>Aqui está o resumo do seu negócio hoje.</p>
      </div>

      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Agendamentos Hoje</p>
            <div className="dash-card-icon"><FiCalendar /></div>
          </div>
          <p className="dash-card-value">{dados.agendamentosHoje}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Dados reais do sistema</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Faturamento (Mês)</p>
            <div className="dash-card-icon"><FiDollarSign /></div>
          </div>
          <p className="dash-card-value">{formatarDinheiro(dados.faturamentoMes)}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Dados reais do sistema</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Novos Clientes</p>
            <div className="dash-card-icon"><FiUsers /></div>
          </div>
          <p className="dash-card-value">{dados.novosClientes}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Dados reais do sistema</span>
        </div>
      </div>

      <div className="dash-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
        <h3>Gráfico de Agendamentos</h3>
        <p>Em breve, aqui entrará o gráfico real integrado com o ASP.NET.</p>
      </div>
    </div>
  );
}