import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiGrid, FiCalendar, FiUsers, FiScissors, FiDollarSign, FiSettings, FiLogOut 
} from 'react-icons/fi';

const MENU_ITEMS = [
  { path: '/dashboard', label: 'Visão Geral', icon: FiGrid, end: true },
  { path: '/dashboard/agenda', label: 'Agenda', icon: FiCalendar },
  { path: '/dashboard/clientes', label: 'Clientes', icon: FiUsers },
  { path: '/dashboard/servicos', label: 'Serviços', icon: FiScissors },
  { path: '/dashboard/financeiro', label: 'Financeiro', icon: FiDollarSign },
  { path: '/dashboard/config', label: 'Configurações', icon: FiSettings },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const iniciais = user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'ZL';

  return (
    <div className="dashboard-wrapper">
      {/* SIDEBAR */}
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

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <h1 className="topbar-title">
            {user?.estabelecimento || 'Meu Estabelecimento'}
          </h1>
          
          <div className="topbar-user">
            <div className="user-info">
              <p className="user-name">{user?.nome || 'Usuário'}</p>
              <p className="user-role">Administrador</p>
            </div>
            <div className="user-avatar">{iniciais}</div>
            
            <button onClick={handleLogout} className="btn-logout" title="Sair">
              <FiLogOut />
              <span style={{ display: 'none' }}>Sair</span>
            </button>
          </div>
        </header>

        {/* PÁGINA ATUAL (Rota filha) */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}