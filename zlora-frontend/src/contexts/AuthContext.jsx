import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// Configuração da URL da API (usa .env se existir, ou cai no localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao iniciar, recupera o usuário e o token salvos
  useEffect(() => {
    const storedUser = localStorage.getItem('@Zlora:user');
    const storedToken = localStorage.getItem('@Zlora:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ============================================
  // LOGIN REAL (integrado ao C#)
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
        // O back pode retornar { message: "..." } ou { mensagem: "..." }
        throw new Error(data.message || data.mensagem || 'E-mail ou senha incorretos.');
      }

      // O back retorna { token, usuario }
      const usuarioLogado = {
        nome: data.usuario.nome, // No login, o nome do contato vem como 'nome'
        email: data.usuario.email,
        estabelecimento: data.usuario.estabelecimento,
        papel: data.usuario.papel,
      };

      setUser(usuarioLogado);
      localStorage.setItem('@Zlora:user', JSON.stringify(usuarioLogado));
      localStorage.setItem('@Zlora:token', data.token);

      return { sucesso: true };

    } catch (erro) {
      console.error('Erro no login:', erro);
      throw new Error(erro.message || 'Não foi possível fazer login. Tente novamente.');
    }
  };

  // ============================================
  // CADASTRO REAL (integrado ao C#)
  // ============================================
  const register = async (dadosFormulario) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: dadosFormulario.nome,               // Nome do estabelecimento
          nomecontato: dadosFormulario.nomecontato, // Nome do contato
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

      // O back retorna { token, usuario }
      // (Exatamente como vimos no Swagger!)
      const usuarioLogado = {
        nome: data.usuario.nome, // No retorno, o nome do contato vem como 'nome'
        email: data.usuario.email,
        estabelecimento: data.usuario.estabelecimento,
        papel: data.usuario.papel,
        id: data.usuario.id,
        empresaId: data.usuario.empresaId,
      };

      // Já loga o usuário automaticamente após o cadastro
      setUser(usuarioLogado);
      localStorage.setItem('@Zlora:user', JSON.stringify(usuarioLogado));
      localStorage.setItem('@Zlora:token', data.token);

      return { sucesso: true };

    } catch (erro) {
      console.error('Erro no cadastro:', erro);
      throw new Error(erro.message || 'Não foi possível realizar o cadastro. Tente novamente.');
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
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