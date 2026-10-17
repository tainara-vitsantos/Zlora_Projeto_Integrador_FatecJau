import { useState } from 'react';
import SectionTitle from '../ui/SectionTitle';
import { FAQ } from '../../data/faq';

export default function Faq() {
  const [aberto, setAberto] = useState(0);

  const toggle = (i) => setAberto((atual) => (atual === i ? -1 : i));

  return (
    <section className="section light-bg" id="faq">
      <div className="container">
        <SectionTitle
          title="Perguntas"
          highlight="frequentes"
          subtitle="Tudo o que você precisa saber antes de começar"
        />

        <div className="faq-list">
          {FAQ.map(({ q, a }, i) => {
            const open = aberto === i;
            return (
              <div className={`faq-item ${open ? 'open' : ''}`} key={q}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={open}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => toggle(i)}
                >
                  <span>{q}</span>
                  <span className="faq-icon" aria-hidden="true">+</span>
                </button>
                <div
                  className="faq-answer"
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-hidden={!open}
                >
                  <div className="faq-answer-inner">{a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}