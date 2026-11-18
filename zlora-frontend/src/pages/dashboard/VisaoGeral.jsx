

import { useEffect, useState } from 'react';
import {
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiLink,
  FiCopy,
  FiCheck,
  FiActivity
} from 'react-icons/fi';

import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const formatarDinheiro = (valor) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);

const formatarDataLocal = (data) => {
  const d = new Date(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function VisaoGeral() {
  const { user } = useAuth();

  const [dados, setDados] = useState({
    agendamentosHoje: 0,
    faturamentoMes: 0,
    novosClientes: 0
  });

  const [agendamentosSemana, setAgendamentosSemana] = useState([]);
  const [servicosMaisRealizados, setServicosMaisRealizados] = useState([]);
  const [statusAgendamentos, setStatusAgendamentos] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const urlAgendamento = `${window.location.origin}/${user?.slug || ''}`;

  const copiarLink = async () => {
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
        const [agendamentos, clientes, servicos] = await Promise.all([
          api.request('/api/agendamentos'),
          api.request('/api/clientes'),
          api.request('/api/servicos')
        ]);

        const hoje = new Date();

        const inicioMes = new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          1
        );

        const hojeString = formatarDataLocal(hoje);

        const validos = agendamentos.filter(ag =>
          (ag.status || '').toLowerCase() !== 'cancelado'
        );

        // Indicadores
        const agendamentosHoje = validos.filter(ag =>
          ag.dataHoraInicio &&
          formatarDataLocal(ag.dataHoraInicio) === hojeString
        ).length;

        const faturamentoMes = validos.reduce((total, ag) => {
          const data = new Date(ag.dataHoraInicio);

          if (
            data.getMonth() !== hoje.getMonth() ||
            data.getFullYear() !== hoje.getFullYear()
          ) return total;

          const servico = servicos.find(s =>
            (s.id || s.Id) === (ag.servicoId || ag.ServicoId)
          );

          return total + Number(servico?.preco || servico?.Preco || 0);
        }, 0);

        const novosClientes = clientes.filter(cli =>
          cli.criadoEm &&
          new Date(cli.criadoEm) >= inicioMes
        ).length;

        setDados({
          agendamentosHoje,
          faturamentoMes,
          novosClientes
        });

        // Gráfico: agendamentos dos últimos 7 dias
        const semana = [];

        for (let i = 6; i >= 0; i--) {
          const dia = new Date(hoje);
          dia.setDate(hoje.getDate() - i);

          const dataString = formatarDataLocal(dia);

          const quantidade = validos.filter(ag =>
            ag.dataHoraInicio &&
            formatarDataLocal(ag.dataHoraInicio) === dataString
          ).length;

          semana.push({
            dia: dia.toLocaleDateString('pt-BR', {
              weekday: 'short'
            }).replace('.', ''),
            quantidade
          });
        }

        setAgendamentosSemana(semana);

        // Gráfico: serviços mais realizados
        const contagemServicos = {};

        validos.forEach(ag => {
          const id = ag.servicoId || ag.ServicoId;

          contagemServicos[id] =
            (contagemServicos[id] || 0) + 1;
        });

        const ranking = servicos
          .map(servico => ({
            nome: servico.nome || servico.Nome,
            quantidade: contagemServicos[servico.id || servico.Id] || 0
          }))
          .filter(servico => servico.quantidade > 0)
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);

        setServicosMaisRealizados(ranking);

        // Gráfico: situação dos agendamentos
        const status = {};

        agendamentos.forEach(ag => {
          const nome = (ag.status || 'não informado').toLowerCase();

          status[nome] = (status[nome] || 0) + 1;
        });

        setStatusAgendamentos(
          Object.entries(status).map(([nome, quantidade]) => ({
            nome,
            quantidade
          }))
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
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        Carregando informações do estabelecimento...
      </div>
    );
  }

  const maiorQuantidade = Math.max(
    ...agendamentosSemana.map(d => d.quantidade),
    1
  );

  const maiorServico = Math.max(
    ...servicosMaisRealizados.map(s => s.quantidade),
    1
  );

  const totalStatus = statusAgendamentos.reduce(
    (total, s) => total + s.quantidade,
    0
  );

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
        <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>
          Olá, {user?.nome}!
        </h2>

        <p style={{ color: 'var(--zlora-text-soft)' }}>
          Aqui está o resumo do seu negócio hoje.
        </p>
      </div>

      {/* LINK DE AGENDAMENTO */}
      <div
        className="dash-card"
        style={{
          background: 'var(--zlora-primary-soft)',
          borderColor: 'var(--zlora-border-strong)',
          marginBottom: 32,
          padding: 24
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h3 style={{
              fontSize: '1.1rem',
              color: 'var(--zlora-primary)',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <FiLink /> Seu link de agendamento
            </h3>

            <p style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--zlora-text-soft)'
            }}>
              Envie este link para seus clientes agendarem sozinhos.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: 8,
            background: '#fff',
            padding: 8,
            borderRadius: 8,
            border: '1px solid var(--zlora-border)'
          }}>
            <span style={{
              fontSize: 14,
              color: 'var(--zlora-text-soft)',
              padding: 8
            }}>
              {urlAgendamento}
            </span>

            <button
              onClick={copiarLink}
              className="btn btn-primary"
              style={{ padding: '8px 16px', borderRadius: 6 }}
            >
              {copiado ? <><FiCheck /> Copiado!</> : <><FiCopy /> Copiar</>}
            </button>
          </div>
        </div>
      </div>

      {/* INDICADORES */}
      <div className="dash-cards-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Agendamentos Hoje</p>
            <div className="dash-card-icon"><FiCalendar /></div>
          </div>

          <p className="dash-card-value">{dados.agendamentosHoje}</p>

          <span className="dash-card-trend">
            <FiTrendingUp /> Dados reais
          </span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Valor Previsto (Mês)</p>
            <div className="dash-card-icon"><FiDollarSign /></div>
          </div>

          <p className="dash-card-value">
            {formatarDinheiro(dados.faturamentoMes)}
          </p>

          <span className="dash-card-trend">
            <FiTrendingUp /> Baseado nos serviços agendados
          </span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Novos Clientes</p>
            <div className="dash-card-icon"><FiUsers /></div>
          </div>

          <p className="dash-card-value">{dados.novosClientes}</p>

          <span className="dash-card-trend">
            <FiTrendingUp /> Cadastrados neste mês
          </span>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginTop: 32
      }}>

        {/* AGENDAMENTOS DA SEMANA */}
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 6, fontSize: 17 }}>
            <FiActivity style={{ marginRight: 8 }} />
            Agendamentos nos últimos 7 dias
          </h3>

          <p style={{
            color: 'var(--zlora-text-soft)',
            fontSize: 13,
            marginBottom: 28
          }}>
            Quantidade de agendamentos por dia
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-around',
            height: 190,
            gap: 12,
            borderBottom: '1px solid var(--zlora-border)',
            paddingBottom: 8
          }}>
            {agendamentosSemana.map((dia, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'end',
                  height: '100%',
                  flex: 1,
                  gap: 8
                }}
              >
                <strong style={{ fontSize: 12 }}>
                  {dia.quantidade}
                </strong>

                <div style={{
                  width: '100%',
                  maxWidth: 38,
                  height: `${Math.max((dia.quantidade / maiorQuantidade) * 125, 4)}px`,
                  background: 'var(--zlora-primary)',
                  borderRadius: '7px 7px 2px 2px',
                  transition: 'height .3s'
                }} />

                <span style={{
                  fontSize: 11,
                  color: 'var(--zlora-text-soft)'
                }}>
                  {dia.dia}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SERVIÇOS MAIS REALIZADOS */}
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 6, fontSize: 17 }}>
            Serviços mais realizados
          </h3>

          <p style={{
            color: 'var(--zlora-text-soft)',
            fontSize: 13,
            marginBottom: 24
          }}>
            Ranking dos serviços com mais agendamentos
          </p>

          {servicosMaisRealizados.length === 0 ? (
            <p style={{ color: 'var(--zlora-text-soft)' }}>
              Ainda não existem serviços agendados.
            </p>
          ) : (
            servicosMaisRealizados.map((servico, index) => (
              <div key={index} style={{ marginBottom: 18 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 7,
                  fontSize: 13
                }}>
                  <strong>{servico.nome}</strong>
                  <span>{servico.quantidade}</span>
                </div>

                <div style={{
                  height: 9,
                  background: 'var(--zlora-primary-soft)',
                  borderRadius: 20,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(servico.quantidade / maiorServico) * 100}%`,
                    height: '100%',
                    background: 'var(--zlora-primary)',
                    borderRadius: 20
                  }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* STATUS DOS AGENDAMENTOS */}
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 6, fontSize: 17 }}>
            Situação dos agendamentos
          </h3>

          <p style={{
            color: 'var(--zlora-text-soft)',
            fontSize: 13,
            marginBottom: 24
          }}>
            Distribuição por status
          </p>

          {totalStatus === 0 ? (
            <p style={{ color: 'var(--zlora-text-soft)' }}>
              Ainda não existem agendamentos cadastrados.
            </p>
          ) : (
            <>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 15
              }}>
                {statusAgendamentos.map((item, index) => (
                  <div key={index}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      fontSize: 13
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {item.nome}
                      </span>

                      <strong>
                        {item.quantidade} ({Math.round(item.quantidade / totalStatus * 100)}%)
                      </strong>
                    </div>

                    <div style={{
                      height: 9,
                      background: 'var(--zlora-primary-soft)',
                      borderRadius: 20,
                      overflow: 'hidden'
                    }}>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
