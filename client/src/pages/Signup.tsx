import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function isStrongPassword(pw: string) {
  return /[A-Z]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw.length >= 8 && pw.length <= 16;
}

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.length < 20 || name.length > 60) return setError('Name must be 20–60 characters.');
    if (address.length < 1 || address.length > 400) return setError('Address must be ≤ 400 characters.');
    if (!isStrongPassword(password)) return setError('Password must be 8–16 chars incl. uppercase & special char.');

    try {
      await signup({ name, email, address, password });
      nav('/login');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={{maxWidth:520, margin:'40px auto'}}>
      <h2>Signup</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <form onSubmit={onSubmit}>
        <div><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} required /></div>
        <div><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div><label>Address</label><textarea value={address} onChange={e=>setAddress(e.target.value)} required /></div>
        <div><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        <button type="submit">Create account</button>
      </form>
    </div>
  );
};

export default Signup;
