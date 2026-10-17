import { useSmoothScroll } from '../../hooks/useSmoothScroll';

export default function Hero() {
  const scrollTo = useSmoothScroll();

  return (
    <section className="bg-hero" id="home">
      <div className="container hero-content">
        <div className="hero-eyebrow">
          <span className="dot" aria-hidden="true" />
          Teste grátis por <strong>30 dias</strong> · sem cartão
        </div>

        <h1 className="hero-title">
          Gestão completa para o seu<br />
          <span className="gradient-text">negócio de beleza</span>
        </h1>

        <p className="hero-tagline">
          Agendamento online, controle de comissões, histórico de clientes e
          relatórios — tudo em um único sistema feito para salões, barbearias
          e clínicas de estética.
        </p>

        <div className="hero-cta">
          <a
            href="#cadastro"
            className="btn btn-header"
            onClick={(e) => scrollTo(e, 'cadastro')}
          >
            Começar teste grátis
          </a>
          <a
            href="#funcoes"
            className="btn btn-ghost"
            onClick={(e) => scrollTo(e, 'funcoes')}
          >
            Ver funcionalidades
          </a>
        </div>

        <div className="hero-apps">
          <span className="hero-apps-label">Aplicativo Zlora</span>
          <span className="hero-apps-soon">Em breve nas lojas oficiais</span>
        </div>
      </div>
    </section>
  );
}