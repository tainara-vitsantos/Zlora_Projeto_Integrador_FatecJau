import { FiUserPlus, FiSettings, FiZap, FiCheckCircle } from 'react-icons/fi';
import SectionTitle from '../ui/SectionTitle';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

const PASSOS = [
  {
    n: 1,
    icon: FiUserPlus,
    title: 'Faça o cadastro',
    text: 'Cadastre-se na Zilora informando os dados básicos do seu estabelecimento. É rápido e fácil.',
  },
  {
    n: 2,
    icon: FiSettings,
    title: 'Configure o essencial',
    text: 'Cadastre serviços, profissionais e a jornada de trabalho. Levamos você pela mão.',
  },
  {
    n: 3,
    icon: FiZap,
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
          {/* LADO ESQUERDO: TIMELINE */}
          <ol className="steps-timeline">
            {PASSOS.map(({ n, icon: Icon, title, text }) => (
              <li key={n} className="step-item">
                <div className="step-icon-wrapper">
                  <div className="step-icon">
                    <Icon size={24} />
                  </div>
                </div>
                <div className="step-content">
                  <span className="step-number">Passo 0{n}</span>
                  <h3 className="step-title">{title}</h3>
                  <p className="step-text">{text}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* LADO DIREITO: MOCKUP DE AGENDA */}
          <div className="steps-visual" aria-hidden="true">
            <div className="mockup-dashboard">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <div className="mockup-title">Agenda - Zilora</div>
              </div>
              
              <div className="mockup-calendar">
                <div className="calendar-header">
                  <span>Hoje, 24 de Nov</span>
                  <span className="badge">3 agendamentos</span>
                </div>
                
                <div className="calendar-event active">
                  <div className="event-time">09:00</div>
                  <div className="event-info">
                    <strong>Corte de Cabelo</strong>
                    <span>com João Silva</span>
                  </div>
                  <FiCheckCircle className="event-icon" />
                </div>

                <div className="calendar-event">
                  <div className="event-time">10:30</div>
                  <div className="event-info">
                    <strong>Manicure</strong>
                    <span>com Maria Souza</span>
                  </div>
                </div>

                <div className="calendar-event">
                  <div className="event-time">14:00</div>
                  <div className="event-info">
                    <strong>Barba</strong>
                    <span>com João Silva</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <a
            href="/cadastro"
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