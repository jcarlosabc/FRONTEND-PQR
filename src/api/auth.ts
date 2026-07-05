import { request, setTokens, clearTokens } from "./client";
import type { Usuario } from "../types";

export async function iniciarSesion(email: string, password: string): Promise<void> {
  const datos = await request<{ access: string; refresh: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setTokens(datos.access, datos.refresh);
}

export function cerrarSesion(): void {
  clearTokens();
}

export function obtenerUsuarioActual(): Promise<Usuario> {
  return request<Usuario>("/auth/me");
}
