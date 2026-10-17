import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaWhatsapp,
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaTwitter,
} from 'react-icons/fa';
import { SITE } from '../../data/site';

const REDES = [
  { key: 'facebook',  Icon: FaFacebookF, label: 'Facebook da Zlora' },
  { key: 'youtube',   Icon: FaYoutube,   label: 'YouTube da Zlora' },
  { key: 'instagram', Icon: FaInstagram, label: 'Instagram da Zlora' },
  { key: 'twitter',   Icon: FaTwitter,   label: 'Twitter da Zlora' },
];

export default function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand-block">
            <span className="footer-brand">Zlora</span>
            <p className="footer-brand-desc">
              Gestão e agendamento para salões de beleza, barbearias, clínicas
              de estética e profissionais da beleza.
            </p>
          </div>

          <div className="footer-contact-block">
            <h3 className="footer-block-title">Fale com a gente</h3>
            <ul className="footer-contact-list">
              <li className="contact-line">
                <FaMapMarkerAlt aria-hidden="true" />
                {SITE.endereco}
              </li>
              <li className="contact-line">
                <FaEnvelope aria-hidden="true" />
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li className="contact-line">
                <FaWhatsapp aria-hidden="true" />
                Telefone a confirmar
              </li>
            </ul>
          </div>

          <div className="footer-social-block">
            <h3 className="footer-block-title">Siga a Zlora</h3>
            <div className="social-icons">
              {REDES.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={SITE.redes[key]}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Zlora. Todos os direitos reservados.</p>
          <ul className="footer-legal">
            <li><a href="#termos" data-todo>Termos de Uso</a></li>
            <li><a href="#privacidade" data-todo>Privacidade</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}