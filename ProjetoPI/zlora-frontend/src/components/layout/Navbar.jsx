import { useEffect, useState } from 'react';
import { useScrolled } from '../../hooks/useScrolled';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { useActiveSection } from '../../hooks/useActiveSection';

const LINKS = [
  { id: 'home',         label: 'Home' },
  { id: 'sobre',        label: 'Sobre' },
  { id: 'funcoes',      label: 'Funcionalidades' },
  { id: 'precos',       label: 'Preços' },
  { id: 'depoimentos',  label: 'Depoimentos' },
  { id: 'faq',          label: 'FAQ' },
];

const SECTION_IDS = LINKS.map((l) => l.id);

export default function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const scrollTo = useSmoothScroll();
  const active = useActiveSection(SECTION_IDS);

  // Fecha o menu mobile ao redimensionar para desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992 && open) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  // Trava o scroll do body com menu mobile aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleNav = (e, id) => {
    scrollTo(e, id);
    setOpen(false);
  };

  return (
    <header
      className={`nav-menu fixed-top ${scrolled ? 'is-scrolling' : ''} ${open ? 'is-open' : ''}`}
      id="nav-menu"
    >
      <div className="container">
        <nav className="navbar" aria-label="Navegação principal">
          <a
            className="navbar-brand"
            href="#home"
            onClick={(e) => handleNav(e, 'home')}
            aria-label="Zlora — ir para o início"
          >
            Zlora
          </a>

          <button
            className="navbar-toggler"
            type="button"
            aria-expanded={open}
            aria-controls="menuPrincipal"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className={`collapse navbar-collapse ${open ? 'show' : ''}`}
            id="menuPrincipal"
          >
            <ul className="navbar-nav">
              {LINKS.map(({ id, label }) => (
                <li className="nav-item" key={id}>
                  <a
                    className={`nav-link ${active === id ? 'active' : ''}`}
                    href={`#${id}`}
                    onClick={(e) => handleNav(e, id)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="navbar-actions">
              <a
                href="#acessar"
                className="btn btn-nav-ghost"
                data-todo
                onClick={(e) => e.preventDefault()}
              >
                Acessar
              </a>
              <a
                href="#cadastro"
                className="btn btn-nav-cta"
                onClick={(e) => handleNav(e, 'cadastro')}
              >
                Teste grátis
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}