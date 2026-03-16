import './globals.css';

export const metadata = {
  title: 'Hygienix',
  description: 'Gestionale disinfestazione'
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
