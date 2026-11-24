import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function salvarSessao(data) {
  if (!data?.token || !data?.usuario) {
    throw new Error('Resposta inválida do servidor.');
  }

  const usuarioLogado = {
    nome: data.usuario.nome,
    email: data.usuario.email,
    estabelecimento: data.usuario.estabelecimento,
    slug: data.usuario.slug,
    papel: data.usuario.papel,
    id: data.usuario.id,
    empresaId: data.usuario.empresaId,
  };

  localStorage.setItem('@Zlora:user', JSON.stringify(usuarioLogado));
  localStorage.setItem('@Zlora:token', data.token);

  return usuarioLogado;
}

async function lerResposta(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.mensagem ||
      'Não foi possível concluir a solicitação.'
    );
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('@Zlora:user');
      const storedToken = localStorage.getItem('@Zlora:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.removeItem('@Zlora:user');
        localStorage.removeItem('@Zlora:token');
      }
    } catch {
      localStorage.removeItem('@Zlora:user');
      localStorage.removeItem('@Zlora:token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await lerResposta(response);
      const usuarioLogado = salvarSessao(data);

      setUser(usuarioLogado);

      return usuarioLogado;
    } catch (erro) {
      throw new Error(
        erro.message || 'Não foi possível fazer login. Tente novamente.'
      );
    }
  };

  const register = async (dadosFormulario) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: dadosFormulario.nome,
          nomecontato: dadosFormulario.nomecontato,
          telefone: dadosFormulario.telefone,
          email: dadosFormulario.email,
          senha: dadosFormulario.senha,
          conduso: dadosFormulario.conduso,
        }),
      });

      const data = await lerResposta(response);
      const usuarioLogado = salvarSessao(data);

      setUser(usuarioLogado);

      return usuarioLogado;
    } catch (erro) {
      throw new Error(
        erro.message || 'Não foi possível realizar o cadastro. Tente novamente.'
      );
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem('@Zlora:user');
    localStorage.removeItem('@Zlora:token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}