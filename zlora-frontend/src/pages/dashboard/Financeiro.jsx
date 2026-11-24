import { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiTrendingUp, FiCheckCircle, FiXCircle, FiPrinter } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './financeiro.css';

export default function Financeiro() {
  const { user } = useAuth();
  const [dados, setDados] = useState({
    agendamentos: [],
    servicos: [],
    clientes: []
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro('');
        
        // Quebra-cache para garantir dados frescos
        const cacheBuster = `?t=${new Date().getTime()}`;
        
        const [agendamentos, servicos, clientes] = await Promise.all([
          api.request(`/api/agendamentos${cacheBuster}`),
          api.request(`/api/servicos${cacheBuster}`),
          api.request(`/api/clientes${cacheBuster}`)
        ]);
        
        setDados({ 
          agendamentos: Array.isArray(agendamentos) ? agendamentos : [], 
          servicos: Array.isArray(servicos) ? servicos : [], 
          clientes: Array.isArray(clientes) ? clientes : [] 
        });
      } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
        setErro(error.message || "Erro ao carregar dados financeiros.");
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // ==========================================
  // CRUZAMENTO DE DADOS
  // ==========================================
  const getServico = (id) => dados.servicos.find(s => (s.id || s.Id) === id) || {};
  const getCliente = (id) => dados.clientes.find(c => (c.id || c.Id) === id) || {};

  // ==========================================
  // CÁLCULOS FINANCEIROS OTIMIZADOS (useMemo)
  // ==========================================
  const estatisticas = useMemo(() => {
    // Consideramos apenas os agendamentos concluídos para o faturamento
    const validos = dados.agendamentos.filter(a => (a.status || a.Status || '').toLowerCase() === 'concluido');
    
    const faturamento = validos.reduce((total, ag) => {
      const servico = getServico(ag.servicoId || ag.ServicoId);
      return total + Number(servico.preco || servico.Preco || 0);
    }, 0);

    const ticket = validos.length > 0 ? faturamento / validos.length : 0;
    const cancelados = dados.agendamentos.filter(a => (a.status || a.Status || '').toLowerCase() === 'cancelado').length;

    return {
      faturamentoTotal: faturamento,
      ticketMedio: ticket,
      agendamentosConcluidos: validos.length,
      agendamentosCancelados: cancelados
    };
  }, [dados]);

  const formatarDinheiro = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  
  const formatarData = (dataString) => {
    if (!dataString) return '-';
    return new Date(dataString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ==========================================
  // EXPORTAR PDF (Impressão nativa)
  // ==========================================
  const exportarPDF = () => {
    const tituloAnterior = document.title;
    document.title = `Financeiro - ${user?.estabelecimento || 'Zlora'}`;
    window.print();
    document.title = tituloAnterior;
  };

  if (carregando && dados.agendamentos.length === 0) {
    return <div className="financeiro-loading">Calculando finanças...</div>;
  }

  return (
    <section className="financeiro-page">
      {erro && <div className="financeiro-erro">{erro}</div>}

      <div className="financeiro-header">
        <div>
          <h2>Visão Financeira</h2>
          <p>Acompanhe o faturamento e o histórico de transações do seu estabelecimento.</p>
        </div>
        
        <button className="financeiro-print-button" onClick={exportarPDF}>
          <FiPrinter /> Exportar / Salvar em PDF
        </button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="financeiro-resumo">
        <div className="financeiro-resumo-card">
          <div className="financeiro-resumo-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><FiDollarSign /></div>
          <div>
            <span>Faturamento Realizado</span>
            <strong>{formatarDinheiro(estatisticas.faturamentoTotal)}</strong>
          </div>
        </div>

        <div className="financeiro-resumo-card">
          <div className="financeiro-resumo-icon" style={{ background: '#F0EAFF', color: '#6F3CE7' }}><FiTrendingUp /></div>
          <div>
            <span>Ticket Médio</span>
            <strong>{formatarDinheiro(estatisticas.ticketMedio)}</strong>
          </div>
        </div>

        <div className="financeiro-resumo-card">
          <div className="financeiro-resumo-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}><FiCheckCircle /></div>
          <div>
            <span>Atendimentos Concluídos</span>
            <strong>{estatisticas.agendamentosConcluidos}</strong>
          </div>
        </div>

        <div className="financeiro-resumo-card">
          <div className="financeiro-resumo-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><FiXCircle /></div>
          <div>
            <span>Atendimentos Cancelados</span>
            <strong>{estatisticas.agendamentosCancelados}</strong>
          </div>
        </div>
      </div>

      {/* TABELA DE TRANSAÇÕES */}
      <div className="financeiro-tabela-card">
        <div className="financeiro-tabela-cabecalho">
          <h3>Histórico de Transações</h3>
          <p>Todas as movimentações do seu estabelecimento.</p>
        </div>

        <div className="financeiro-tabela-scroll">
          <table className="financeiro-tabela">
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
                  <td colSpan="5" className="financeiro-vazio">
                    Nenhuma movimentação registrada ainda.
                  </td>
                </tr>
              ) : (
                [...dados.agendamentos]
                  .sort((a, b) => new Date(b.dataHoraInicio || b.DataHoraInicio) - new Date(a.dataHoraInicio || a.DataHoraInicio))
                  .map(ag => {
                    const cliente = getCliente(ag.clienteId || ag.ClienteId);
                    const servico = getServico(ag.servicoId || ag.ServicoId);
                    const status = (ag.status || ag.Status || 'agendado').toLowerCase();
                    
                    return (
                      <tr key={ag.id || ag.Id}>
                        <td>{formatarData(ag.dataHoraInicio || ag.DataHoraInicio)}</td>
                        <td>{cliente.nome || cliente.Nome || 'Cliente Excluído'}</td>
                        <td>{servico.nome || servico.Nome || 'Serviço Excluído'}</td>
                        <td style={{ fontWeight: 600 }}>{formatarDinheiro(servico.preco || servico.Preco || 0)}</td>
                        <td>
                          <span className={`financeiro-status status-${status}`}>
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
    </section>
  );
}