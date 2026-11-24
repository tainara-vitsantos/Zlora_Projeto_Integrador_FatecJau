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

        <div className="features-grid">
          {FEATURES.map(({ title, icon: Icon }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">
                <Icon />
              </div>
              <h3 className="feature-title">{title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}