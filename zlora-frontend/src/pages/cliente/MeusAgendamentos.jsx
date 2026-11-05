export default function MeusAgendamentos() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Meus Agendamentos</h2>
      <p style={{ color: 'var(--zlora-text-soft)' }}>Aqui você verá seus horários marcados.</p>
      
      <div className="dash-card" style={{ marginTop: '24px', textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--zlora-text-soft)' }}>Você ainda não tem nenhum agendamento marcado.</p>
        <button className="btn btn-primary" style={{ marginTop: '16px' }}>Buscar Salões</button>
      </div>
    </div>
  );
}