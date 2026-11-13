import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { api } from '../../services/api';

export default function Financeiro() {
  const [dados, setDados] = useState({
    agendamentos: [],
    servicos: [],
    clientes: []
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [agendamentos, servicos, clientes] = await Promise.all([
          api.request('/api/agendamentos'),
          api.request('/api/servicos'),
          api.request('/api/clientes')
        ]);
        setDados({ agendamentos, servicos, clientes });
      } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // Funções para achar os dados cruzados
  const getServico = (id) => dados.servicos.find(s => (s.id || s.Id) === id) || {};
  const getCliente = (id) => dados.clientes.find(c => (c.id || c.Id) === id) || {};

  // Cálculos Financeiros (Ignorando os cancelados)
  const agendamentosValidos = dados.agendamentos.filter(a => (a.status || a.Status) !== 'cancelado');
  
  const faturamentoTotal = agendamentosValidos.reduce((total, ag) => {
    const servico = getServico(ag.servicoId || ag.ServicoId);
    return total + (servico.preco || servico.Preco || 0);
  }, 0);

  const ticketMedio = agendamentosValidos.length > 0 ? faturamentoTotal / agendamentosValidos.length : 0;
  
  const agendamentosConcluidos = dados.agendamentos.filter(a => (a.status || a.Status) === 'concluido').length;
  const agendamentosCancelados = dados.agendamentos.filter(a => (a.status || a.Status) === 'cancelado').length;

  const formatarDinheiro = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  
  const formatarData = (dataString) => {
    if (!dataString) return '-';
    return new Date(dataString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (carregando) return <div style={{ padding: '40px', textAlign: 'center' }}>Calculando finanças...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Visão Financeira</h2>
          <p style={{ color: 'var(--zlora-text-soft)', margin: 0 }}>Acompanhe o faturamento e o histórico de transações.</p>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Faturamento Previsto</p>
            <div className="dash-card-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><FiDollarSign /></div>
          </div>
          <p className="dash-card-value">{formatarDinheiro(faturamentoTotal)}</p>
          <span className="dash-card-trend"><FiTrendingUp /> Baseado nos agendamentos ativos</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Ticket Médio</p>
            <div className="dash-card-icon"><FiTrendingUp /></div>
          </div>
          <p className="dash-card-value">{formatarDinheiro(ticketMedio)}</p>
          <span className="dash-card-trend">Média por atendimento</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Concluídos</p>
            <div className="dash-card-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}><FiCheckCircle /></div>
          </div>
          <p className="dash-card-value">{agendamentosConcluidos}</p>
          <span className="dash-card-trend">Atendimentos finalizados</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Cancelados</p>
            <div className="dash-card-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><FiXCircle /></div>
          </div>
          <p className="dash-card-value">{agendamentosCancelados}</p>
          <span className="dash-card-trend">Prejuízo evitado</span>
        </div>
      </div>

      {/* TABELA DE TRANSAÇÕES */}
      <div className="table-container" style={{ marginTop: '32px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--zlora-border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--zlora-dark)' }}>Histórico de Transações</h3>
        </div>
        
        <table className="dash-table">
          <thead>
            <tr>
              <th>Data / Hora</th>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dados.agendamentos.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--zlora-text-soft)' }}>
                  Nenhuma movimentação registrada ainda.
                </td>
              </tr>
            ) : (
              // Ordena do mais recente para o mais antigo
              [...dados.agendamentos]
                .sort((a, b) => new Date(b.dataHoraInicio || b.DataHoraInicio) - new Date(a.dataHoraInicio || a.DataHoraInicio))
                .map(ag => {
                  const cliente = getCliente(ag.clienteId || ag.ClienteId);
                  const servico = getServico(ag.servicoId || ag.ServicoId);
                  const status = (ag.status || ag.Status || 'agendado').toLowerCase();
                  
                  return (
                    <tr key={ag.id || ag.Id}>
                      <td style={{ color: 'var(--zlora-text-soft)' }}>
                        {formatarData(ag.dataHoraInicio || ag.DataHoraInicio)}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {cliente.nome || cliente.Nome || 'Cliente Excluído'}
                      </td>
                      <td>
                        {servico.nome || servico.Nome || 'Serviço Excluído'}
                      </td>
                      <td style={{ fontWeight: 600, color: status === 'cancelado' ? 'var(--zlora-text-soft)' : 'var(--zlora-dark)' }}>
                        {formatarDinheiro(servico.preco || servico.Preco || 0)}
                      </td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                          background: status === 'concluido' ? '#DCFCE7' : status === 'cancelado' ? '#FEE2E2' : '#DBEAFE',
                          color: status === 'concluido' ? '#166534' : status === 'cancelado' ? '#991B1B' : '#1E40AF'
                        }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}