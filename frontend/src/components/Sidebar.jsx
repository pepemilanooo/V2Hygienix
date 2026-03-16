'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['Dashboard', '/dashboard'],
  ['Clienti', '/clienti'],
  ['Utenti', '/utenti'],
  ['Interventi', '/interventi'],
  ['Sopralluoghi', '/sopralluoghi'],
  ['Preventivi', '/preventivi'],
  ['Fatture', '/fatture']
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{ width: 220, padding: 20, borderRight: '1px solid #ddd', minHeight: '100vh' }}>
      <h2>Hygienix</h2>
      <nav style={{ display: 'grid', gap: 10 }}>
        {items.map(([label, href]) => (
          <Link key={href} href={href} style={{ fontWeight: pathname === href ? 700 : 400 }}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
