import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { actualizarUsuario, crearUsuario, listarUsuarios } from "../api/usuarios";
import type { RolUsuario, Usuario } from "../types";

const ROLES: RolUsuario[] = ["agente", "supervisor", "admin"];

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function recargar() {
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => setError("No se pudo cargar la lista de usuarios."));
  }

  useEffect(recargar, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Usuarios internos</h1>
          <p>Crea agentes, supervisores y administradores, y activa o desactiva su acceso.</p>
        </div>
      </div>

      <FormularioNuevoUsuario onCreado={recargar} />

      {error && (
        <div className="alert alert-error">
          <AlertCircle />
          {error}
        </div>
      )}

      {!usuarios && !error && (
        <p className="cargando">
          <Loader2 />
          Cargando…
        </p>
      )}

      {usuarios && (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <FilaUsuario key={usuario.id} usuario={usuario} onActualizado={recargar} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FilaUsuario({ usuario, onActualizado }: { usuario: Usuario; onActualizado: () => void }) {
  const [rol, setRol] = useState<RolUsuario>(usuario.rol);
  const [guardando, setGuardando] = useState(false);

  async function guardarRol() {
    if (rol === usuario.rol) return;
    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, { rol });
      onActualizado();
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo() {
    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, { is_active: !usuario.is_active });
      onActualizado();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <tr>
      <td>{usuario.nombre}</td>
      <td>{usuario.email}</td>
      <td>
        <div style={{ display: "flex", gap: 6 }}>
          <select value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={guardarRol}
            disabled={guardando || rol === usuario.rol}
          >
            Guardar
          </button>
        </div>
      </td>
      <td>
        <span className="badge" style={{ "--badge-color": usuario.is_active ? "var(--estado-resuelta)" : "var(--ink-muted)" } as React.CSSProperties}>
          {usuario.is_active ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td>
        <button type="button" className="btn btn-secondary" onClick={alternarActivo} disabled={guardando}>
          {usuario.is_active ? "Desactivar" : "Activar"}
        </button>
      </td>
    </tr>
  );
}

function FormularioNuevoUsuario({ onCreado }: { onCreado: () => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolUsuario>("agente");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await crearUsuario({ nombre, email, rol, password });
      setNombre("");
      setEmail("");
      setRol("agente");
      setPassword("");
      onCreado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el usuario.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="card">
      <h2 className="card-title">Crear usuario</h2>
      {error && (
        <div className="alert alert-error">
          <AlertCircle />
          {error}
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="usuario-nombre">Nombre</label>
          <input id="usuario-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="usuario-email">Correo</label>
          <input id="usuario-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="usuario-rol">Rol</label>
          <select id="usuario-rol" value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="usuario-password">Contraseña</label>
          <input
            id="usuario-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
      </div>
      <div className="btn-fila">
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          <UserPlus size={16} />
          {enviando ? "Creando…" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
