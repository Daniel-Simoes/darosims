export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>Daros API</h1>
      <p>Next.js backend for the Daros IMS frontend.</p>
      <ul>
        <li><code>POST /api/auth/login</code> — Admin sign in</li>
        <li><code>GET /api/auth/me</code> — Current user (Bearer token)</li>
        <li><code>GET /api/documents</code> — List documents</li>
        <li><code>POST /api/documents</code> — Create document</li>
      </ul>
      <p>
        Users: <code>daniel@darosapp.com</code> or <code>rodrigo@daros.com</code> (password: <code>1234</code>)
      </p>
    </main>
  );
}
