import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MinhaAgenda from './pages/profissional/MinhaAgenda';

// Páginas Públicas
import Home from './pages/Home';
import Login from './pages/Login';
import CadastroPage from './pages/CadastroPage';
import PublicSalon from './pages/PublicSalon';

// Admin (Salão)
import DashboardLayout from './components/layout/DashboardLayout';
import VisaoGeral from './pages/dashboard/VisaoGeral';
import Agenda from './pages/dashboard/Agenda';
import Clientes from './pages/dashboard/Clientes';
import Servicos from './pages/dashboard/Servicos';
import Profissionais from './pages/dashboard/Profissionais'; // <-- NOVA IMPORTAÇÃO
import Financeiro from './pages/dashboard/Financeiro';
import Configuracoes from './pages/dashboard/Configuracoes';

// Cliente Final (Logado)
import ClientLayout from './components/layout/ClientLayout';
import MeusAgendamentos from './pages/cliente/MeusAgendamentos';
import Perfil from './pages/cliente/Perfil';

//Profissional
import MeuPerfil from './pages/profissional/MeuPerfil';
import ProfissionalLayout from './components/layout/ProfissionalLayout';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ROTAS PÚBLICAS DO SISTEMA */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        
        {/* ROTAS DO SALÃO (Só Administrador acessa) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute role="administrador">
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<VisaoGeral />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="profissionais" element={<Profissionais />} /> {/* <-- NOVA ROTA */}
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="config" element={<Configuracoes />} />
        </Route>

        {/* ROTAS DO CLIENTE FINAL (Só Cliente logado acessa) */}
        <Route 
          path="/cliente" 
          element={
            <ProtectedRoute role="cliente">
              <ClientLayout />
            </ProtectedRoute>
          } 
        >
          <Route path="dashboard" element={<MeusAgendamentos />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>



{/* ÁREA DO PROFISSIONAL */}
<Route
  path="/profissional"
  element={
    <ProtectedRoute role="profissional">
      <ProfissionalLayout />
    </ProtectedRoute>
  }
>
  <Route path="agenda" element={<MinhaAgenda />} />
  <Route path="perfil" element={<MeuPerfil />} />
</Route>

        {/* ROTA PÚBLICA DO SALÃO */}
        <Route path="/:slug" element={<PublicSalon />} />
      </Routes>
    </AuthProvider>
  );

  
}