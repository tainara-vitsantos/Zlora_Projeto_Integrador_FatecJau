import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

export default function PriceCard({
  label,
  monthly,
  old,
  total,
  popular,
  features = [],
  onSelect,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mostra os 5 primeiros benefícios no card
  const visibleFeatures = features.slice(0, 5);
  const hiddenCount = features.length - 5;

  return (
    <>
      <article className={`card pricing ${popular ? 'popular' : ''}`}>
        {popular && <div className="ribbon">Mais Escolhido</div>}

        <div className="card-head">
          <small>{label}</small>
          <div className="price-wrapper">
            {old && <del className="price-old">R$ {old}</del>}
            <span className="price">
              <sub>R$</sub> {monthly}
              <sub>/mês</sub>
            </span>
          </div>
          {total && <p className="price-total">Total: R$ {total}</p>}
        </div>

        <div className="card-body">
          <ul className="plan-features">
            {visibleFeatures.map((f) => (
              <li key={f}>
                <FiCheck className="feature-check" /> {f}
              </li>
            ))}
          </ul>
          
          {/* BOTÃO PARA ABRIR O MODAL DE BENEFÍCIOS */}
          {hiddenCount > 0 && (
            <button 
              type="button" 
              className="btn-more-features"
              onClick={() => setIsModalOpen(true)}
            >
              + {hiddenCount} outros benefícios
            </button>
          )}

          <button
            type="button"
            className={popular ? 'btn btn-primary btn-block' : 'btn btn-ghost btn-block'}
            onClick={onSelect}
            style={{ marginTop: 'auto' }} // Garante que o botão fique sempre no fundo
          >
            Começar agora
          </button>
        </div>
      </article>

      {/* MODAL DE BENEFÍCIOS */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Benefícios do plano {label}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <ul className="plan-features-modal">
                {features.map((f) => (
                  <li key={f}>
                    <FiCheck className="feature-check" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-block" onClick={() => { setIsModalOpen(false); onSelect(); }}>
                Escolher este plano
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}