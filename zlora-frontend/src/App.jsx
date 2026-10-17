import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import CadastroPage from './pages/CadastroPage';

// Importações do Dashboard
import DashboardLayout from './components/layout/DashboardLayout';
import VisaoGeral from './pages/dashboard/VisaoGeral';
import Agenda from './pages/dashboard/Agenda';
import Clientes from './pages/dashboard/Clientes';
import Servicos from './pages/dashboard/Servicos';
import Financeiro from './pages/dashboard/Financeiro';
import Configuracoes from './pages/dashboard/Configuracoes';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        
        {/* Rotas Protegidas com Layout Aninhado */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          {/* A tela que aparece ao acessar apenas /dashboard */}
          <Route index element={<VisaoGeral />} />
          
          {/* Sub-rotas do menu lateral */}
          <Route path="agenda" element={<Agenda />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="config" element={<Configuracoes />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}