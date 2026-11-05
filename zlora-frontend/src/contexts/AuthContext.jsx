import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('@Zlora:user');
    const storedToken = localStorage.getItem('@Zlora:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email, senha) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.mensagem || 'E-mail ou senha incorretos.');
      }

      const usuarioLogado = {
        nome: data.usuario.nome,
        email: data.usuario.email,
        estabelecimento: data.usuario.estabelecimento,
        papel: data.usuario.papel,
        id: data.usuario.id,
        empresaId: data.usuario.empresaId,
      };

      setUser(usuarioLogado);
      localStorage.setItem('@Zlora:user', JSON.stringify(usuarioLogado));
      localStorage.setItem('@Zlora:token', data.token);

      return usuarioLogado; // <--- CORRIGIDO AQUI

    } catch (erro) {
      console.error('Erro no login:', erro);
      throw new Error(erro.message || 'Não foi possível fazer login. Tente novamente.');
    }
  };

  // ============================================
  // CADASTRO
  // ============================================
  const register = async (dadosFormulario) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: dadosFormulario.nome,
          nomecontato: dadosFormulario.nomecontato,
          telefone: dadosFormulario.telefone,
          email: dadosFormulario.email,
          senha: dadosFormulario.senha,
          conduso: dadosFormulario.conduso,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.mensagem || 'Não foi possível realizar o cadastro.');
      }

      const usuarioLogado = {
        nome: data.usuario.nome,
        email: data.usuario.email,
        estabelecimento: data.usuario.estabelecimento,
        papel: data.usuario.papel,
        id: data.usuario.id,
        empresaId: data.usuario.empresaId,
      };

      setUser(usuarioLogado);
      localStorage.setItem('@Zlora:user', JSON.stringify(usuarioLogado));
      localStorage.setItem('@Zlora:token', data.token);

      return usuarioLogado;

    } catch (erro) {
      console.error('Erro no cadastro:', erro);
      throw new Error(erro.message || 'Não foi possível realizar o cadastro. Tente novamente.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@Zlora:user');
    localStorage.removeItem('@Zlora:token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}