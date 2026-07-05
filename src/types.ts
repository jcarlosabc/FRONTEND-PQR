export type TipoPQR = "peticion" | "queja" | "reclamo";
export type PrioridadPQR = "baja" | "media" | "alta" | "urgente";
export type EstadoPQR = "recibida" | "en_gestion" | "resuelta" | "cerrada";
export type CanalPQR = "web" | "email" | "presencial";

export interface Solicitante {
  id?: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  email: string;
  telefono: string;
}

export interface SeguimientoItem {
  id: number;
  descripcion: string;
  tipo_accion: string;
  usuario_nombre: string | null;
  fecha_registro: string;
}

export interface PQRListItem {
  id: number;
  radicado: string;
  tipo: TipoPQR;
  titulo: string;
  categoria: string;
  prioridad: PrioridadPQR;
  estado: EstadoPQR;
  canal: CanalPQR;
  solicitante_nombre: string;
  created_at: string;
  updated_at: string;
}

export interface PQRDetail {
  id: number;
  radicado: string;
  tipo: TipoPQR;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: PrioridadPQR;
  estado: EstadoPQR;
  canal: CanalPQR;
  solicitante: Solicitante;
  agente_asignado_nombre: string | null;
  seguimientos: SeguimientoItem[];
  created_at: string;
  updated_at: string;
}

export interface PQRPublico {
  radicado: string;
  tipo: TipoPQR;
  categoria: string;
  prioridad: PrioridadPQR;
  estado: EstadoPQR;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasResponse {
  total: number;
  por_estado: { estado: EstadoPQR; total: number }[];
  por_tipo: { tipo: TipoPQR; total: number }[];
  por_prioridad: { prioridad: PrioridadPQR; total: number }[];
}

export interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "agente" | "supervisor" | "admin";
}
