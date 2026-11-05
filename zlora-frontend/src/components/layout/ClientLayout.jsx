import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiCalendar, FiUser, FiLogOut } from 'react-icons/fi';

const MENU_ITEMS = [
  { path: '/cliente/dashboard', label: 'Meus Agendamentos', icon: FiCalendar, end: true },
  { path: '/cliente/perfil', label: 'Meu Perfil', icon: FiUser },
];

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const iniciais = user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'CL';

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-brand">Zlora</NavLink>
        </div>
        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">Área do Cliente</h1>
          <div className="topbar-user">
            <div className="user-info">
              <p className="user-name">{user?.nome}</p>
              <p className="user-role">Cliente</p>
            </div>
            <div className="user-avatar">{iniciais}</div>
            <button onClick={handleLogout} className="btn-logout">
              <FiLogOut />
            </button>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}