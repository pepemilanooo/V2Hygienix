'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { apiFetch } from '../../lib/api';

export default function Page() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/invoices')
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ padding: 24, flex: 1 }}>
        <h1>Fatture</h1>

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} className="card">
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
