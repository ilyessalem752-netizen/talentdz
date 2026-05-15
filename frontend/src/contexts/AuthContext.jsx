import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) fetchMe();
    else setLoading(false);
  }, [fetchMe]);

 const login = async (email, password) => {
  const { data } = await api.post('/auth/login', {
    email,
    password
  });

  const token = data.accessToken || data.token;

  if (token) {
    localStorage.setItem('accessToken', token);
  }

  setUser(data.user);

  return {
    ...data.user,
    token
  };
};
  

  const registerStudent = async (formData) => {
    const { data } = await api.post('/auth/register/student', formData);
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    await fetchMe();
    return data.user;
  };

  const registerCompany = async (formData) => {
    const { data } = await api.post('/auth/register/company', formData);
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    await fetchMe();
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('accessToken');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = () => fetchMe();

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, registerStudent, registerCompany, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
