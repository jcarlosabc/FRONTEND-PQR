import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cerrarSesion as cerrarSesionApi, iniciarSesion as iniciarSesionApi, obtenerUsuarioActual } from "../api/auth";
import { getAccessToken } from "../api/client";
import type { Usuario } from "../types";

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      setCargando(false);
      return;
    }
    obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => cerrarSesionApi())
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(email: string, password: string) {
    await iniciarSesionApi(email, password);
    setUsuario(await obtenerUsuarioActual());
  }

  function cerrarSesion() {
    cerrarSesionApi();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return contexto;
}
