import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

type User = { id: number; name: string; email: string; role: 'ADMIN'|'USER'|'OWNER'; address: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {name:string;email:string;address:string;password:string}) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const signup = async (data: {name:string;email:string;address:string;password:string}) => {
    await api.post('/auth/signup', data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return <Ctx.Provider value={{ user, token, login, logout, signup }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
