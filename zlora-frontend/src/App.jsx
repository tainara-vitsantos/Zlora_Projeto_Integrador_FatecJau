import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import CadastroPage from './pages/CadastroPage';

// Admin (Salão)
import DashboardLayout from './components/layout/DashboardLayout';
import VisaoGeral from './pages/dashboard/VisaoGeral';
import Agenda from './pages/dashboard/Agenda';
import Clientes from './pages/dashboard/Clientes';
import Servicos from './pages/dashboard/Servicos';
import Financeiro from './pages/dashboard/Financeiro';
import Configuracoes from './pages/dashboard/Configuracoes';

// Cliente Final
import ClientLayout from './components/layout/ClientLayout';
import MeusAgendamentos from './pages/cliente/MeusAgendamentos';
import Perfil from './pages/cliente/Perfil';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
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
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="config" element={<Configuracoes />} />
        </Route>

        {/* ROTAS DO CLIENTE (Só Cliente acessa) */}
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
      </Routes>
    </AuthProvider>
  );
}