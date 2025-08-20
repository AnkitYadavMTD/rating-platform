import React, { useEffect, useState } from 'react';
import api from '../api/client';

type Rater = { id:number; name:string; email:string; value:number; ratedAt:string };
type Store = { id:number; name:string; address:string };

const OwnerDashboard: React.FC = () => {
  const [avg, setAvg] = useState<number>(0);
  const [store, setStore] = useState<Store | null>(null);
  const [raters, setRaters] = useState<Rater[]>([]);

  const load = async () => {
    const res = await api.get('/owner/summary');
    setAvg(res.data.avgRating);
    setStore(res.data.store);
    setRaters(res.data.raters);
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{maxWidth:900, margin:'20px auto'}}>
      <h2>Owner Dashboard</h2>
      <div>Store: {store ? `${store.name} — ${store.address}` : '-'}</div>
      <div>Average Rating: {avg}</div>
      <h3 style={{marginTop:12}}>Raters</h3>
      <table width="100%">
        <thead><tr><th>Name</th><th>Email</th><th>Rating</th><th>Rated At</th></tr></thead>
        <tbody>
          {raters.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{r.value}</td><td>{new Date(r.ratedAt).toLocaleString()}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
};

export default OwnerDashboard;
