import React, { useEffect, useState } from 'react';
import api from '../api/client';

type Item = { id:number; name:string; address:string; overallRating:number; userRating:number|null };

const Stores: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState({ name:'', address:'' });
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/stores', { params: { name: q.name || undefined, address: q.address || undefined } });
      setItems(res.data.items);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const rate = async (id: number, value: number) => {
    await api.post(`/stores/${id}/rate`, { value });
    fetchData();
  };

  return (
    <div style={{maxWidth:900, margin:'20px auto'}}>
      <h2>Stores</h2>
      <div style={{display:'flex', gap:8}}>
        <input placeholder="Search name" value={q.name} onChange={e=>setQ({...q, name:e.target.value})} />
        <input placeholder="Search address" value={q.address} onChange={e=>setQ({...q, address:e.target.value})} />
        <button onClick={fetchData}>Search</button>
      </div>
      {error && <div style={{color:'red'}}>{error}</div>}
      <table width="100%" style={{marginTop:12}}>
        <thead>
          <tr><th>Name</th><th>Address</th><th>Overall</th><th>Your Rating</th><th>Action</th></tr>
        </thead>
        <tbody>
          {items.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>{s.overallRating ?? 0}</td>
              <td>{s.userRating ?? '-'}</td>
              <td>
                <select value={s.userRating ?? ''} onChange={e=>rate(s.id, Number(e.target.value))}>
                  <option value="" disabled>Rate</option>
                  {[1,2,3,4,5].map(v=> <option key={v} value={v}>{v}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Stores;
