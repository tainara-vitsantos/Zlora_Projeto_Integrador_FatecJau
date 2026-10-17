import { FaStar } from 'react-icons/fa';
import SectionTitle from '../ui/SectionTitle';

const DEPOIMENTOS = [
  {
    quote: 'Reduzi as faltas em quase 40% com os lembretes automáticos. Minha agenda nunca esteve tão organizada.',
    name: 'Camila Andrade',
    role: 'Studio Camila · São Paulo/SP',
    initials: 'CA',
  },
  {
    quote: 'O controle de comissões me economiza horas por mês. Antes era tudo em planilha e dava erro.',
    name: 'Rafael Moraes',
    role: 'Barbearia Moraes · Belo Horizonte/MG',
    initials: 'RM',
  },
  {
    quote: 'Meus clientes adoraram o app. Agendam a qualquer hora e eu recebo tudo organizado no sistema.',
    name: 'Juliana Pires',
    role: 'Clínica Bella · Curitiba/PR',
    initials: 'JP',
  },
];

export default function Testimonials() {
  return (
    <section className="section" id="depoimentos">
      <div className="container">
        <SectionTitle
          title="Quem usa,"
          highlight="recomenda"
          subtitle="Histórias de quem já transformou a gestão com a Zlora"
        />

        <div className="testimonials-grid">
          {DEPOIMENTOS.map(({ quote, name, role, initials }) => (
            <article className="testimonial-card" key={name}>
              <div className="testimonial-stars" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} aria-hidden="true" />
                ))}
              </div>
              <p className="testimonial-quote">“{quote}”</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" aria-hidden="true">
                  {initials}
                </div>
                <div>
                  <p className="testimonial-name">{name}</p>
                  <p className="testimonial-role">{role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}