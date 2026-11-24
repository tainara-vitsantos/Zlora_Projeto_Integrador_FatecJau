import { useState } from 'react';
import SectionTitle from '../ui/SectionTitle';
import PriceCard from '../ui/PriceCard';
import { PLANS } from '../../data/plans';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { FiShield, FiCheckCircle } from 'react-icons/fi';

const PERIODOS = [
  { id: 'anual',     label: 'Anual',     badge: 'Economize 30%' },
  { id: 'semestral', label: 'Semestral', badge: 'Economize 15%' },
  { id: 'mensal',    label: 'Mensal',    badge: null },
];

export default function Precos() {
  const [periodo, setPeriodo] = useState('anual');
  const scrollTo = useSmoothScroll();

  const handleContratar = (p, faixa) => {
    console.info('[Zlora] Plano selecionado:', { periodo: p, faixa });
    scrollTo({ preventDefault() {} }, 'cadastro');
  };

  return (
    <section className="section light-bg" id="precos">
      <div className="container">
        <SectionTitle
          title="Planos e"
          highlight="Preços"
          subtitle="Escolha o plano ideal para o tamanho do seu negócio."
        />

        {/* CONTROLE DE PERÍODO (ESTILO SEGMENTED CONTROL) */}
        <div className="d-flex justify-content-center mb-5">
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

        {/* GRID DE CARDS */}
        <div className="price-grid">
          {PLANS[periodo].map((plan) => (
            <PriceCard
              key={plan.range}
              {...plan}
              onSelect={() => handleContratar(periodo, plan.range)}
            />
          ))}
        </div>

        {/* GARANTIAS ABAIXO DOS CARDS */}
        <div className="pricing-guarantees">
          <div className="guarantee-item">
            <FiShield /> Garantia de 7 dias
          </div>
          <div className="guarantee-item">
            <FiCheckCircle /> Cancele quando quiser
          </div>
          <div className="guarantee-item">
            <FiCheckCircle /> Sem taxa de adesão
          </div>
        </div>
      </div>
    </section>
  );
}