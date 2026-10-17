import { FaCheck } from 'react-icons/fa';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

const GARANTIAS = [
  '30 dias grátis',
  'Sem cartão de crédito',
  'Cancele quando quiser',
];

export default function CtaFinal() {
  const scrollTo = useSmoothScroll();

  return (
    <section className="bg-cta">
      <div className="container">
        <div className="call-to-action">
          <h2>
            Pronto para organizar<br />a gestão do seu negócio?
          </h2>
          <p>
            Junte-se a mais de 2.400 estabelecimentos que já usam a Zlora
            para crescer com menos esforço.
          </p>

          <div className="cta-actions">
            <a
              href="#cadastro"
              className="btn btn-light"
              onClick={(e) => scrollTo(e, 'cadastro')}
            >
              Começar teste grátis
            </a>
          </div>

          <div className="cta-guarantees">
            {GARANTIAS.map((g) => (
              <span className="cta-guarantee" key={g}>
                <FaCheck aria-hidden="true" />
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}