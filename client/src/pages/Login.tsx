import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      nav('/');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Login</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <form onSubmit={onSubmit}>
        <div><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
