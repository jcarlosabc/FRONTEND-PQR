import { BarChart3, FilePlus2, Inbox, LogIn, LogOut, MessageSquareText, Users } from "lucide-react";
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
          <span className="topbar-brand-icon">
            <MessageSquareText size={17} />
          </span>
          <span>
            <strong>PQR</strong>
            <small>Fundación Sersocial IPS</small>
          </span>
        </NavLink>
        <nav className="topbar-nav">
          <NavLink to="/" end className={({ isActive }) => `topbar-link${isActive ? " activo" : ""}`}>
            <Inbox size={16} />
            Inicio
          </NavLink>
          <NavLink to="/nueva" className={({ isActive }) => `topbar-link${isActive ? " activo" : ""}`}>
            <FilePlus2 size={16} />
            Nueva PQR
          </NavLink>
          {usuario && (
            <NavLink
              to="/estadisticas"
              className={({ isActive }) => `topbar-link${isActive ? " activo" : ""}`}
            >
              <BarChart3 size={16} />
              Estadísticas
            </NavLink>
          )}
          {usuario?.rol === "admin" && (
            <NavLink to="/usuarios" className={({ isActive }) => `topbar-link${isActive ? " activo" : ""}`}>
              <Users size={16} />
              Usuarios
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
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-secondary">
              <LogIn size={16} />
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
