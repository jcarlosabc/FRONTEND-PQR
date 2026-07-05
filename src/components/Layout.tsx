import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function salir() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <>
      <header className="topbar">
        <NavLink to="/" className="topbar-brand">
          PQR <small>Fundación Sersocial IPS</small>
        </NavLink>
        <nav className="topbar-nav">
          <NavLink to="/" end className={({ isActive }) => `topbar-link${isActive ? " activo" : ""}`}>
            Inicio
          </NavLink>
          <NavLink to="/nueva" className={({ isActive }) => `topbar-link${isActive ? " activo" : ""}`}>
            Nueva PQR
          </NavLink>
          {usuario && (
            <NavLink
              to="/estadisticas"
              className={({ isActive }) => `topbar-link${isActive ? " activo" : ""}`}
            >
              Estadísticas
            </NavLink>
          )}
        </nav>
        <div className="topbar-usuario">
          {usuario ? (
            <>
              <span>
                <strong>{usuario.nombre}</strong> · {usuario.rol}
              </span>
              <button type="button" className="btn btn-secondary" onClick={salir}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-secondary">
              Iniciar sesión
            </NavLink>
          )}
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
