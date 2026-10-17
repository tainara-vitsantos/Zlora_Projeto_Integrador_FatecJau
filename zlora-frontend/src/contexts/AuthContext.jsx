import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

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

  // LOGIN MOCK
  const login = async (email, senha) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (senha !== '123456') {
      throw new Error('Senha incorreta. Para testar, use 123456.');
    }
    const fakeUser = { nome: 'Tainara', email };
    const fakeToken = 'token-falso-jwt-123';

    setUser(fakeUser);
    localStorage.setItem('@Zlora:user', JSON.stringify(fakeUser));
    localStorage.setItem('@Zlora:token', fakeToken);
  };

  // CADASTRO MOCK (NOVO)
  const register = async (dadosFormulario) => {
    // Simula a demora da rede (1.5 segundos)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simula um erro se o e-mail for o mesmo do teste
    if (dadosFormulario.email === 'teste@teste.com') {
      throw new Error('Este e-mail já está cadastrado no sistema.');
    }

    // Cria o usuário falso com base nos dados digitados no formulário
    const fakeUser = { 
      nome: dadosFormulario.nomecontato, // Nome do contato
      estabelecimento: dadosFormulario.nome, // Nome do salão
      email: dadosFormulario.email 
    };
    const fakeToken = 'token-falso-jwt-novo-usuario';

    // Já loga o usuário automaticamente após o cadastro
    setUser(fakeUser);
    localStorage.setItem('@Zlora:user', JSON.stringify(fakeUser));
    localStorage.setItem('@Zlora:token', fakeToken);
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
