import logoZlora from '../../assets/logo.png';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 992 && open) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleNav = (e, id) => {
    e.preventDefault();
    setOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
      }, 100);
    } else {
      scrollTo(e, id);
    }
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
            href="/"
            onClick={(e) => handleNav(e, 'home')}
            aria-label="Zlora — ir para o início"
            style={{ padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <img 
              src={logoZlora} 
              alt="Zlora" 
              style={{ height: '60px', objectFit: 'contain' }} 
            />
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

          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="menuPrincipal">
            <ul className="navbar-nav">
              {LINKS.map(({ id, label }) => (
                <li className="nav-item" key={id}>
                  <a
                    className={`nav-link ${active === id && location.pathname === '/' ? 'active' : ''}`}
                    href={`#${id}`}
                    onClick={(e) => handleNav(e, id)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="navbar-actions">
              <button
                onClick={() => { setOpen(false); navigate('/login'); }}
                className="btn btn-nav-ghost"
              >
                Acessar
              </button>
              
              <button
                onClick={() => { setOpen(false); navigate('/cadastro'); }}
                className="btn btn-nav-cta"
              >
                Teste grátis
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}