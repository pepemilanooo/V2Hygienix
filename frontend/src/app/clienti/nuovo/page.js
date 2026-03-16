'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { apiFetch } from '../../../lib/api';

export default function NuovoClientePage() {
  const [form, setForm] = useState({ ragione_sociale: '', consulente: '', numero_consulente: '' });
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const data = await apiFetch('/clients', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    setMessage(`Creato cliente: ${data.ragione_sociale}`);
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ padding: 24, flex: 1 }}>
        <h1>Nuovo cliente</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
          <input placeholder="Ragione sociale" value={form.ragione_sociale} onChange={(e) => setForm({ ...form, ragione_sociale: e.target.value })} />
          <input placeholder="Consulente" value={form.consulente} onChange={(e) => setForm({ ...form, consulente: e.target.value })} />
          <input placeholder="Numero consulente" value={form.numero_consulente} onChange={(e) => setForm({ ...form, numero_consulente: e.target.value })} />
          <button type="submit">Salva</button>
        </form>
        {message ? <p>{message}</p> : null}
      </main>
    </div>
  );
}
