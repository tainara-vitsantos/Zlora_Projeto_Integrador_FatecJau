import SectionTitle from '../ui/SectionTitle';
import { FEATURES } from '../../data/features';

export default function Funcionalidades() {
  return (
    <section className="section light-bg" id="funcoes">
      <div className="container">
        <SectionTitle
          title="Tudo o que o seu"
          highlight="negócio precisa"
          subtitle="Funcionalidades pensadas para o dia a dia de quem vive de beleza"
        />

        <div className="features-grid" role="list">
          {FEATURES.map(({ code, title, icon: Icon }) => (
            <a key={code} className="feature-bg" href="#" role="listitem">
              <span className="icon-box" aria-hidden="true">
                <Icon />
              </span>
              <h3 className="feature-title">{title}</h3>
              <span className="feature-details">{code}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}