import React, { useEffect, useState } from 'react';
import api from '../api/client';

type User = { id:number; name:string; email:string; address:string; role:'ADMIN'|'USER'|'OWNER' };
type Store = { id:number; name:string; email?:string; address:string; rating:number };

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({ totalUsers:0, totalStores:0, totalRatings:0 });
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [userQ, setUserQ] = useState({ name:'', email:'', address:'', role:'' });
  const [storeQ, setStoreQ] = useState({ name:'', email:'', address:'' });

  const fetchAll = async () => {
    const [m, u, s] = await Promise.all([
      api.get('/admin/metrics'),
      api.get('/admin/users', { params: { ...userQ, role: userQ.role || undefined } }),
      api.get('/admin/stores', { params: storeQ })
    ]);
    setMetrics(m.data);
    setUsers(u.data.items);
    setStores(s.data.items);
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div style={{maxWidth:1100, margin:'20px auto'}}>
      <h2>Admin Dashboard</h2>
      <div style={{display:'flex', gap:16}}>
        <div>Total Users: {metrics.totalUsers}</div>
        <div>Total Stores: {metrics.totalStores}</div>
        <div>Total Ratings: {metrics.totalRatings}</div>
      </div>

      <h3 style={{marginTop:20}}>Users</h3>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Name" value={userQ.name} onChange={e=>setUserQ({...userQ, name:e.target.value})} />
        <input placeholder="Email" value={userQ.email} onChange={e=>setUserQ({...userQ, email:e.target.value})} />
        <input placeholder="Address" value={userQ.address} onChange={e=>setUserQ({...userQ, address:e.target.value})} />
        <select value={userQ.role} onChange={e=>setUserQ({...userQ, role:e.target.value})}>
          <option value="">Any Role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
          <option value="OWNER">OWNER</option>
        </select>
        <button onClick={fetchAll}>Filter</button>
      </div>
      <table width="100%" style={{marginTop:8}}>
        <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr></thead>
        <tbody>
          {users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td>{u.role}</td></tr>)}
        </tbody>
      </table>

      <h3 style={{marginTop:20}}>Stores</h3>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Name" value={storeQ.name} onChange={e=>setStoreQ({...storeQ, name:e.target.value})} />
        <input placeholder="Email" value={storeQ.email} onChange={e=>setStoreQ({...storeQ, email:e.target.value})} />
        <input placeholder="Address" value={storeQ.address} onChange={e=>setStoreQ({...storeQ, address:e.target.value})} />
        <button onClick={fetchAll}>Filter</button>
      </div>
      <table width="100%" style={{marginTop:8}}>
        <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr></thead>
        <tbody>
          {stores.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.email || '-'}</td><td>{s.address}</td><td>{s.rating ?? 0}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
