import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

export function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? "Correo o contraseña incorrectos." : "No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="card login-card">
        <h1>Ingreso de agentes</h1>
        <p className="subtitulo">Gestión interna de PQR — Fundación Sersocial IPS</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={manejarEnvio} className="form-grid una-columna">
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <div className="credenciales-demo">
          Demo: agente@sersocial.demo / Agente1234!
          <br />
          Créalas con <code>python manage.py seed_demo</code> en el backend.
        </div>
      </div>
    </div>
  );
}
