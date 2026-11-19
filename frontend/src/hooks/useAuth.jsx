
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get('/user-auth/me');
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/user-auth/login', {
      email,
      password
    });
    setUser(response.data.user);
  };

  const register = async (name, email, password) => {
    return api.post('/user-auth/register', {
      name,
      email,
      password
    });
  };

  const logout = async () => {
    await api.post('/user-auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
