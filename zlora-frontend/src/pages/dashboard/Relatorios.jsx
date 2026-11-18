
import { useEffect, useMemo, useState } from 'react';
import { FiFileText, FiPrinter, FiSearch } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './relatorios.css';

const obterId = (item) => item.id || item.Id;

const obterData = (agendamento) =>
  agendamento.dataHoraInicio || agendamento.DataHoraInicio;

const dataLocal = (valor) => {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return '';

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
};

const formatarData = (valor) => {
  if (!valor) return '—';

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return '—';

  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatarDataSimples = (valor) => {
  if (!valor) return '—';

  const [ano, mes, dia] = valor.split('-');

  return `${dia}/${mes}/${ano}`;
};

const formatarDinheiro = (valor) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(valor) || 0);

const hoje = dataLocal(new Date());

const trintaDiasAtras = (() => {
  const data = new Date();
  data.setDate(data.getDate() - 30);
  return dataLocal(data);
})();

export default function Relatorios() {
  const { user } = useAuth();

  const nomeEmpresa =
    typeof user?.estabelecimento === 'string'
      ? user.estabelecimento
      : user?.estabelecimento?.nome ||
        user?.estabelecimento?.Nome ||
        'Meu estabelecimento';

  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);

  const [dataInicio, setDataInicio] = useState(trintaDiasAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [statusFiltro, setStatusFiltro] = useState('todos');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // ============================================
  // CARREGAR DADOS
  // ============================================
  useEffect(() => {
    async function carregarDados() {
      try {
        setErro('');

        const [
          listaAgendamentos,
          listaClientes,
          listaServicos,
          listaProfissionais
        ] = await Promise.all([
          api.request('/api/agendamentos'),
          api.request('/api/clientes'),
          api.request('/api/servicos'),
          api.request('/api/profissionais')
        ]);

        setAgendamentos(
          Array.isArray(listaAgendamentos) ? listaAgendamentos : []
        );

        setClientes(
          Array.isArray(listaClientes) ? listaClientes : []
        );

        setServicos(
          Array.isArray(listaServicos) ? listaServicos : []
        );

        setProfissionais(
          Array.isArray(listaProfissionais) ? listaProfissionais : []
        );

      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);

        setErro(
          error.message || 'Não foi possível carregar os relatórios.'
        );

      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  // ============================================
  // FILTRAR E ORGANIZAR RELATÓRIOS
  // ============================================
  const relatorio = useMemo(() => {
    return agendamentos
      .map((agendamento) => {
        const clienteId =
          agendamento.clienteId || agendamento.ClienteId;

        const servicoId =
          agendamento.servicoId || agendamento.ServicoId;

        const profissionalId =
          agendamento.profissionalId || agendamento.ProfissionalId;

        const cliente = clientes.find(
          (item) => obterId(item) === clienteId
        );

        const servico = servicos.find(
          (item) => obterId(item) === servicoId
        );

        const profissional = profissionais.find(
          (item) => obterId(item) === profissionalId
        );

        return {
          id: obterId(agendamento),

          data: obterData(agendamento),

          cliente:
            cliente?.nome ||
            cliente?.Nome ||
            'Cliente não encontrado',

          servico:
            servico?.nome ||
            servico?.Nome ||
            'Serviço não encontrado',

          profissional:
            profissional?.nome ||
            profissional?.Nome ||
            'Não informado',

          status: (
            agendamento.status ||
            agendamento.Status ||
            'não informado'
          ).toLowerCase(),

          preco: Number(
            servico?.preco ?? servico?.Preco ?? 0
          )
        };
      })
      .filter((item) => {
        const dataAgendamento = dataLocal(item.data);

        if (!dataAgendamento) return false;

        if (
          dataInicio &&
          dataAgendamento < dataInicio
        ) return false;

        if (
          dataFim &&
          dataAgendamento > dataFim
        ) return false;

        if (
          statusFiltro !== 'todos' &&
          item.status !== statusFiltro
        ) return false;

        return true;
      })
      .sort(
        (a, b) => new Date(b.data) - new Date(a.data)
      );

  }, [
    agendamentos,
    clientes,
    servicos,
    profissionais,
    dataInicio,
    dataFim,
    statusFiltro
  ]);

  // ============================================
  // INDICADORES
  // ============================================
  const concluidos = relatorio.filter(
    (item) => item.status === 'concluido'
  );

  const valorConcluido = concluidos.reduce(
    (total, item) => total + item.preco,
    0
  );

  // ============================================
  // EXPORTAR PDF
  // ============================================
  const exportarPDF = () => {
    const tituloAnterior = document.title;

    document.title = `Relatorio - ${nomeEmpresa}`;

    window.print();

    document.title = tituloAnterior;
  };

  if (carregando) {
    return (
      <div className="relatorios-loading">
        Carregando relatórios...
      </div>
    );
  }

  return (
    <section className="relatorios-page">

      {/* CABEÇALHO DO RELATÓRIO */}
      <div className="relatorios-header">

        <div>
          <span className="relatorios-eyebrow">
            <FiFileText />
            Relatório gerencial
          </span>

          <h2>{nomeEmpresa}</h2>

          <h3>Relatório de agendamentos</h3>

    <p>
  Período: {formatarDataSimples(dataInicio)} até {formatarDataSimples(dataFim)}
</p>

          <p>
            Emitido em: {new Date().toLocaleString('pt-BR')}
          </p>

          <p>
            Responsável: {user?.nome || 'Administrador'}
          </p>
        </div>

        <button
          className="relatorios-print-button"
          onClick={exportarPDF}
        >
          <FiPrinter />
          Exportar / Salvar em PDF
        </button>

      </div>

      {/* ERROS */}
      {erro && (
        <div className="relatorios-erro">
          {erro}
        </div>
      )}

      {/* FILTROS */}
      <div className="relatorios-filtros">

        <label>
          Data inicial

          <input
            type="date"
            value={dataInicio}
            max={dataFim || undefined}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </label>

        <label>
          Data final

          <input
            type="date"
            value={dataFim}
            min={dataInicio || undefined}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </label>

        <label>
          Situação

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
          >
            <option value="todos">Todas</option>
            <option value="agendado">Agendado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>

        <div className="relatorios-filtro-info">
          <FiSearch />
          {relatorio.length} registro(s) encontrado(s)
        </div>

      </div>

      {/* INDICADORES */}
      <div className="relatorios-resumo">

        <article className="relatorios-resumo-card">
          <span>Agendamentos no período</span>
          <strong>{relatorio.length}</strong>
        </article>

        <article className="relatorios-resumo-card">
          <span>Serviços concluídos</span>
          <strong>{concluidos.length}</strong>
        </article>

        <article className="relatorios-resumo-card">
          <span>Valor dos serviços concluídos</span>
          <strong>{formatarDinheiro(valorConcluido)}</strong>
        </article>

      </div>

      {/* HISTÓRICO */}
      <div className="relatorios-tabela-card">

        <div className="relatorios-tabela-cabecalho">

          <div>
            <h3>Histórico de agendamentos</h3>

            <p>
              Dados referentes aos filtros selecionados.
            </p>
          </div>

        </div>

        <div className="relatorios-tabela-scroll">

          <table className="relatorios-tabela">

            <thead>
              <tr>
                <th>Data e horário</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Profissional</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {relatorio.length === 0 ? (

                <tr>
                  <td colSpan="6" className="relatorios-vazio">
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </td>
                </tr>

              ) : (

                relatorio.map((item) => (

                  <tr key={item.id}>
                    <td>{formatarData(item.data)}</td>

                    <td>{item.cliente}</td>

                    <td>{item.servico}</td>

                    <td>{item.profissional}</td>

                    <td>{formatarDinheiro(item.preco)}</td>

                    <td>
                      <span
                        className={`relatorios-status status-${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* OBSERVAÇÃO */}
      <p className="relatorios-observacao">
        O valor considera o preço cadastrado dos serviços concluídos.
        Não representa necessariamente pagamentos efetivamente recebidos.
      </p>

    </section>
  );
}
