import { FiCalendar, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function VisaoGeral() {
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
          <p className="dash-card-value">12</p>
          <span className="dash-card-trend"><FiTrendingUp /> +2 desde ontem</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Faturamento (Mês)</p>
            <div className="dash-card-icon"><FiDollarSign /></div>
          </div>
          <p className="dash-card-value">R$ 4.850</p>
          <span className="dash-card-trend"><FiTrendingUp /> +12% vs mês anterior</span>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <p className="dash-card-title">Novos Clientes</p>
            <div className="dash-card-icon"><FiUsers /></div>
          </div>
          <p className="dash-card-value">8</p>
          <span className="dash-card-trend"><FiTrendingUp /> +3 esta semana</span>
        </div>
      </div>

      <div className="dash-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--zlora-text-soft)' }}>
        <h3>Gráfico de Agendamentos</h3>
        <p>Em breve, aqui entrará o gráfico real integrado com o ASP.NET.</p>
      </div>
    </div>
  );
}