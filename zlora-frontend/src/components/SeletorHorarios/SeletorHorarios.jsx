import { useMemo } from 'react';
import './SeletorHorarios.css';

export default function SeletorHorarios({ 
  dataSelecionada,
  duracaoMinutos,
  turnos = [], 
  horariosDisponiveis,
  horariosOcupados = [],
  horarioSelecionado,
  onChangeHorario,
  corMarca = "#6F3CE7"
}) {
  
  const slots = useMemo(() => {
    if (!dataSelecionada) return [];

    if (Array.isArray(horariosDisponiveis)) {
      return horariosDisponiveis.map((inicio) => {
        const [hora, minuto] = inicio.split(':').map(Number);
        const fimMinutos = hora * 60 + minuto + duracaoMinutos;
        const fim = `${String(Math.floor(fimMinutos / 60)).padStart(2, '0')}:${String(fimMinutos % 60).padStart(2, '0')}`;
        return { inicio, fim, ocupado: false };
      });
    }

    if (!turnos || turnos.length === 0) return [];

    const slotsGerados = [];

    turnos.forEach(turno => {
      if (!turno || !turno.inicio || !turno.fim) return;

      const [inicioH, inicioM] = String(turno.inicio).split(':').map(Number);
      const [fimH, fimM] = String(turno.fim).split(':').map(Number);
      
      let minutoAtual = inicioH * 60 + inicioM;
      const minutoFim = fimH * 60 + fimM;

      while (minutoAtual + duracaoMinutos <= minutoFim) {
        const h = Math.floor(minutoAtual / 60);
        const m = minutoAtual % 60;
        const horarioString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        
        const fimSlot = minutoAtual + duracaoMinutos;
        const hFim = Math.floor(fimSlot / 60);
        const mFim = fimSlot % 60;
        const horarioFimString = `${String(hFim).padStart(2, '0')}:${String(mFim).padStart(2, '0')}`;

        const isOcupado = horariosOcupados.includes(horarioString);

        slotsGerados.push({
          inicio: horarioString,
          fim: horarioFimString,
          ocupado: isOcupado
        });

        minutoAtual += duracaoMinutos;
      }
    });

    return slotsGerados.sort((a, b) => a.inicio.localeCompare(b.inicio));
  }, [dataSelecionada, turnos, duracaoMinutos, horariosDisponiveis, horariosOcupados]);

  if (!dataSelecionada || (!Array.isArray(horariosDisponiveis) && (!turnos || turnos.length === 0))) return null;

  return (
    <div className="seletor-slots">
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '12px', textTransform: 'uppercase' }}>
        Escolha o Horário *
      </label>
      
      {slots.length === 0 ? (
         <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>Nenhum horário livre para este dia.</p>
      ) : (
        <div className="slots-grid">
          {slots.map(slot => (
            <button
              key={slot.inicio}
              type="button"
              disabled={slot.ocupado}
              onClick={() => onChangeHorario(slot.inicio)}
              className={`slot-btn ${horarioSelecionado === slot.inicio ? 'selected' : ''}`}
              style={{ '--brand-color': corMarca }}
            >
              <span className="slot-time-start">{slot.inicio}</span>
              <span className="slot-time-divider">-</span>
              <span className="slot-time-end">{slot.fim}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}