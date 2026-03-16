import LoginForm from '../components/LoginForm';

export default function HomePage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Hygienix</h1>
      <p>Gestionale in italiano per disinfestazione, derattizzazione e sopralluoghi.</p>
      <LoginForm />
    </main>
  );
}
