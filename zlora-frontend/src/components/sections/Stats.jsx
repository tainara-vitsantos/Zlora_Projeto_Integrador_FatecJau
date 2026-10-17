const STATS = [
  { value: '+2.400',  label: 'Negócios ativos' },
  { value: '+180k',   label: 'Agendamentos/mês' },
  { value: '98%',     label: 'Satisfação dos clientes' },
  { value: '4,9/5',   label: 'Avaliação média' },
];

export default function Stats() {
  return (
    <section className="stats-bar">
      <div className="container">
        <div className="stats-grid">
          {STATS.map(({ value, label }) => (
            <div className="stat-item" key={label}>
              <span className="stat-value">
                <span className="gradient-text">{value}</span>
              </span>
              <p className="stat-label">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}