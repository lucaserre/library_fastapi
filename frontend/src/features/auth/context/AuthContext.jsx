// src/features/auth/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicialização: Verifica se já existe um token ao abrir o app
    const token = localStorage.getItem('access_token');
    if (token) {
      // Futuramente, podemos fazer uma chamada a uma rota '/me' no FastAPI 
      // para buscar os dados reais do usuário logado usando o token.
      setIsAuthenticated(true);
      setUser({ username: 'Usuario' }); // Mock inicial temporário
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
    setUser({ username: 'Usuario' });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para consumir o contexto de forma limpa nas features
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}