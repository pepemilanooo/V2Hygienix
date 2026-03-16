'use client';

import Sidebar from '../../components/Sidebar';

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ padding: 24, flex: 1 }}>
        <h1>Dashboard</h1>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div className="card"><strong>Interventi</strong><p>Modulo predisposto</p></div>
          <div className="card"><strong>Sopralluoghi</strong><p>Modulo predisposto</p></div>
          <div className="card"><strong>Documenti</strong><p>Archivio cliente predisposto</p></div>
        </div>
      </main>
    </div>
  );
}
