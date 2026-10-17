import { useState } from 'react';
import SectionTitle from '../ui/SectionTitle';
import PriceCard from '../ui/PriceCard';
import { PLANS } from '../../data/plans';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

const PERIODOS = [
  { id: 'anual',     label: 'Anual',     badge: '30% off' },
  { id: 'semestral', label: 'Semestral', badge: '15% off' },
  { id: 'mensal',    label: 'Mensal' },
];

export default function Precos() {
  const [periodo, setPeriodo] = useState('anual');
  const scrollTo = useSmoothScroll();

  const handleContratar = (p, faixa) => {
    // TODO: redirecionar para checkout real
    console.info('[Zlora] Plano selecionado:', { periodo: p, faixa });
    scrollTo({ preventDefault() {} }, 'cadastro');
  };

  return (
    <section className="section light-bg" id="precos">
      <div className="container">
        <SectionTitle
          title="Planos e"
          highlight="Preços"
          subtitle="Escolha o plano ideal. Cancele quando quiser."
        />

        <div className="text-center">
          <div className="price-switch" role="group" aria-label="Selecionar periodicidade">
            {PERIODOS.map(({ id, label, badge }) => (
              <button
                key={id}
                type="button"
                className={`btn-price ${periodo === id ? 'active' : ''}`}
                aria-pressed={periodo === id}
                onClick={() => setPeriodo(id)}
              >
                {label}
                {badge && <span className="price-badge">{badge}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="price-grid">
          {PLANS[periodo].map((plan) => (
            <PriceCard
              key={plan.range}
              {...plan}
              onSelect={() => handleContratar(periodo, plan.range)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}