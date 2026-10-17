import SectionTitle from '../ui/SectionTitle';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

const PASSOS = [
  {
    n: 1,
    title: 'Faça o cadastro',
    text: 'Cadastre-se na Zlora, informando os dados básicos do seu estabelecimento. É rápido e fácil.',
  },
  {
    n: 2,
    title: 'Configure o essencial',
    text: 'Cadastre serviços, profissionais e a jornada de trabalho. Levamos você pela mão.',
  },
  {
    n: 3,
    title: 'Teste grátis por 30 dias',
    text: 'Use todas as funcionalidades por 30 dias, sem compromisso e sem cartão de crédito.',
  },
];

export default function Passos() {
  const scrollTo = useSmoothScroll();

  return (
    <section className="section" id="passos">
      <div className="container">
        <SectionTitle
          title="Como"
          highlight="começar"
          subtitle="Três passos simples para transformar sua gestão"
        />

        <div className="steps-layout">
          <ol className="ui-steps">
            {PASSOS.map(({ n, title, text }) => (
              <li key={n}>
                <div className="circle-icon" aria-hidden="true">
                  {n}
                </div>
                <div>
                  <h3 className="step-title">{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="steps-visual" aria-hidden="true">
            <div className="steps-mockup">
              <div className="mockup-bar">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <span className="bar" />
              </div>
              <div className="mockup-row accent" />
              <div className="mockup-row" />
              <div className="mockup-row short" />
              <div className="mockup-row" />
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <a
            href="#cadastro"
            className="btn btn-primary btn-lg"
            onClick={(e) => scrollTo(e, 'cadastro')}
          >
            Cadastre-se agora
          </a>
        </div>
      </div>
    </section>
  );
}