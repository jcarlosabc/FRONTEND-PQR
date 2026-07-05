import { API_URL, ApiError, getAccessToken, request } from "./client";
import type {
  EstadisticasResponse,
  Paginado,
  PQRDetail,
  PQRListItem,
  PQRPublico,
  SeguimientoItem,
  Solicitante,
} from "../types";

export interface FiltrosPQR {
  tipo?: string;
  estado?: string;
  prioridad?: string;
  categoria?: string;
  q?: string;
  vencidas?: string;
  page?: string;
}

export function listarPQR(filtros: FiltrosPQR): Promise<Paginado<PQRListItem>> {
  return request<Paginado<PQRListItem>>("/pqr", { params: { ...filtros } });
}

export function obtenerPQR(id: number): Promise<PQRDetail> {
  return request<PQRDetail>(`/pqr/${id}`);
}

export interface NuevaPQRPayload {
  tipo: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  canal: string;
  solicitante: Solicitante;
}

export function crearPQR(payload: NuevaPQRPayload): Promise<PQRDetail> {
  return request<PQRDetail>("/pqr", { method: "POST", body: payload, auth: false });
}

export function buscarPorRadicado(radicado: string): Promise<PQRPublico> {
  return request<PQRPublico>("/pqr/buscar", { params: { radicado }, auth: false });
}

export function cambiarEstado(
  id: number,
  cambios: { estado?: string; prioridad?: string },
): Promise<PQRDetail> {
  return request<PQRDetail>(`/pqr/${id}/estado`, { method: "PATCH", body: cambios });
}

export function asignarAgente(id: number, agenteId: number): Promise<PQRDetail> {
  return request<PQRDetail>(`/pqr/${id}/asignar`, {
    method: "PATCH",
    body: { agente_id: agenteId },
  });
}

export function listarSeguimientos(id: number): Promise<SeguimientoItem[]> {
  return request<SeguimientoItem[]>(`/pqr/${id}/seguimiento`);
}

export function agregarSeguimiento(
  id: number,
  datos: { descripcion: string; tipo_accion: string },
): Promise<SeguimientoItem> {
  return request<SeguimientoItem>(`/pqr/${id}/seguimiento`, { method: "POST", body: datos });
}

export function calificarPQR(datos: {
  radicado: string;
  calificacion: number;
  comentario?: string;
}): Promise<PQRPublico> {
  return request<PQRPublico>("/pqr/calificar", { method: "POST", body: datos, auth: false });
}

export function obtenerEstadisticas(): Promise<EstadisticasResponse> {
  return request<EstadisticasResponse>("/estadisticas");
}

export async function descargarPQRCsv(filtros: FiltrosPQR): Promise<void> {
  const url = new URL(`${API_URL}/pqr/exportar`, window.location.origin);
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) url.searchParams.set(clave, valor);
  }

  const token = getAccessToken();
  const respuesta = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!respuesta.ok) {
    throw new ApiError(respuesta.status, null, "No se pudo generar el archivo CSV.");
  }

  const blob = await respuesta.blob();
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = "pqr.csv";
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
