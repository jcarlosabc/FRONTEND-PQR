import { request } from "./client";
import type { Usuario } from "../types";

export function listarUsuarios(): Promise<Usuario[]> {
  return request<Usuario[]>("/usuarios");
}

export interface NuevoUsuarioPayload {
  nombre: string;
  email: string;
  rol: string;
  password: string;
}

export function crearUsuario(payload: NuevoUsuarioPayload): Promise<Usuario> {
  return request<Usuario>("/usuarios", { method: "POST", body: payload });
}

export function actualizarUsuario(
  id: number,
  cambios: { rol?: string; is_active?: boolean },
): Promise<Usuario> {
  return request<Usuario>(`/usuarios/${id}`, { method: "PATCH", body: cambios });
}
