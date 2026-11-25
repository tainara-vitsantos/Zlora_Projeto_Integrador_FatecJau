import { useMemo } from 'react';
import './SeletorData.css';

export default function SeletorData({ 
  horariosProfissional, 
  datasDisponiveis,
  dataSelecionada, 
  onChangeData,
  corMarca = "#6F3CE7"
}) {
  const datas = useMemo(() => {
    const arr = [];
    const hoje = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      const diaSemana = d.getDay();
      const chaves = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      
      const chaveLower = chaves[diaSemana];
      const chaveUpper = chaveLower.charAt(0).toUpperCase() + chaveLower.slice(1);
      
      const diaObj = horariosProfissional ? (horariosProfissional[chaveLower] || horariosProfissional[chaveUpper]) : null;
      
      const isWorking = Array.isArray(datasDisponiveis)
        ? datasDisponiveis.includes(dateString)
        : diaObj && diaObj.ativo && diaObj.turnos && diaObj.turnos.length > 0;
      
      arr.push({
        dateObj: d,
        dateString,
        dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        dayNumber: String(d.getDate()).padStart(2, '0'),
        isWorking: horariosProfissional ? isWorking : false
      });
    }
    return arr;
  }, [horariosProfissional, datasDisponiveis]);

  const carregando = Array.isArray(datasDisponiveis)
    ? false
    : horariosProfissional === null;
  const semHorarios = Array.isArray(datasDisponiveis)
    ? datasDisponiveis.length === 0
    : horariosProfissional && Object.keys(horariosProfissional).length === 0;

  return (
    <div className="seletor-data-container">
      {carregando ? (
        <p className="aviso-selecione-prof">Buscando horários da profissional...</p>
      ) : semHorarios ? (
        <p className="aviso-selecione-prof" style={{ color: '#DC2626' }}>
          Esta profissional ainda não configurou os dias de trabalho.
        </p>
      ) : (
        <div className="seletor-data-scroll">
          {datas.map((d) => (
            <button
              key={d.dateString}
              type="button"
              disabled={!d.isWorking}
              onClick={() => onChangeData(d.dateString)}
              className={`data-btn ${dataSelecionada === d.dateString ? 'selected' : ''}`}
              style={{ '--brand-color': corMarca }}
            >
              <span className="dia-semana">{d.dayName}</span>
              <span className="dia-numero">{d.dayNumber}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}