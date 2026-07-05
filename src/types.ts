export type TipoPQR = "peticion" | "queja" | "reclamo";
export type PrioridadPQR = "baja" | "media" | "alta" | "urgente";
export type EstadoPQR = "recibida" | "en_gestion" | "resuelta" | "cerrada";
export type CanalPQR = "web" | "email" | "presencial";
export type SlaEstado = "a_tiempo" | "por_vencer" | "vencida" | "cumplido" | "incumplido";
export type RolUsuario = "agente" | "supervisor" | "admin";

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
  agente_asignado_nombre: string | null;
  fecha_limite: string | null;
  sla_estado: SlaEstado;
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
  agente_asignado_id: number | null;
  agente_asignado_nombre: string | null;
  seguimientos: SeguimientoItem[];
  fecha_limite: string | null;
  sla_estado: SlaEstado;
  calificacion: number | null;
  comentario_calificacion: string;
  puede_calificarse: boolean;
  created_at: string;
  updated_at: string;
}

export interface PQRPublico {
  radicado: string;
  tipo: TipoPQR;
  categoria: string;
  prioridad: PrioridadPQR;
  estado: EstadoPQR;
  fecha_limite: string | null;
  sla_estado: SlaEstado;
  puede_calificarse: boolean;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasResponse {
  total: number;
  por_estado: { estado: EstadoPQR; total: number }[];
  por_tipo: { tipo: TipoPQR; total: number }[];
  por_prioridad: { prioridad: PrioridadPQR; total: number }[];
  vencidas: number;
  por_vencer: number;
  calificacion_promedio: number | null;
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
  rol: RolUsuario;
  is_active: boolean;
}
