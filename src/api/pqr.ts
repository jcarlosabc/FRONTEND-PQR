import { request } from "./client";
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

export function listarSeguimientos(id: number): Promise<SeguimientoItem[]> {
  return request<SeguimientoItem[]>(`/pqr/${id}/seguimiento`);
}

export function agregarSeguimiento(
  id: number,
  datos: { descripcion: string; tipo_accion: string },
): Promise<SeguimientoItem> {
  return request<SeguimientoItem>(`/pqr/${id}/seguimiento`, { method: "POST", body: datos });
}

export function obtenerEstadisticas(): Promise<EstadisticasResponse> {
  return request<EstadisticasResponse>("/estadisticas");
}
