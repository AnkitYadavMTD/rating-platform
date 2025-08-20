import React, { useState } from 'react';
import api from '../api/client';

function isStrongPassword(pw: string) {
  return /[A-Z]/.test(pw) && /[^A-Za-z0-9]/.test(pw) && pw.length >= 8 && pw.length <= 16;
}

const Profile: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    if (!isStrongPassword(newPassword)) return setErr('New password not strong enough');
    try {
      await api.post('/auth/password', { oldPassword, newPassword });
      setMsg('Password updated');
      setOldPassword(''); setNewPassword('');
    } catch (e:any) {
      setErr(e?.response?.data?.error || 'Failed');
    }
  };

  return (
    <div style={{maxWidth:520, margin:'20px auto'}}>
      <h2>Profile</h2>
      <form onSubmit={submit}>
        <div><label>Old Password</label><input type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} required /></div>
        <div><label>New Password</label><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required /></div>
        <button type="submit">Update Password</button>
      </form>
      {msg && <div style={{color:'green'}}>{msg}</div>}
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  );
};

export default Profile;
