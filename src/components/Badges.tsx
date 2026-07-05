import {
  AlertTriangle,
  CircleDot,
  Clock,
  FileText,
  Flag,
  MessageSquareWarning,
  MessageSquareX,
  OctagonAlert,
  Lock,
  CheckCircle2,
  TimerReset,
} from "lucide-react";
import type { ComponentType } from "react";
import type { EstadoPQR, PrioridadPQR, SlaEstado, TipoPQR } from "../types";

const ETIQUETAS_ESTADO: Record<EstadoPQR, string> = {
  recibida: "Recibida",
  en_gestion: "En gestión",
  resuelta: "Resuelta",
  cerrada: "Cerrada",
};

const ICONOS_ESTADO: Record<EstadoPQR, ComponentType<{ size?: number }>> = {
  recibida: CircleDot,
  en_gestion: Clock,
  resuelta: CheckCircle2,
  cerrada: Lock,
};

const ETIQUETAS_PRIORIDAD: Record<PrioridadPQR, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const ICONOS_PRIORIDAD: Record<PrioridadPQR, ComponentType<{ size?: number }>> = {
  baja: Flag,
  media: Flag,
  alta: AlertTriangle,
  urgente: OctagonAlert,
};

const ETIQUETAS_TIPO: Record<TipoPQR, string> = {
  peticion: "Petición",
  queja: "Queja",
  reclamo: "Reclamo",
};

const ICONOS_TIPO: Record<TipoPQR, ComponentType<{ size?: number }>> = {
  peticion: FileText,
  queja: MessageSquareWarning,
  reclamo: MessageSquareX,
};

export function EstadoBadge({ estado }: { estado: EstadoPQR }) {
  const Icono = ICONOS_ESTADO[estado];
  return (
    <span className="badge badge--solid" style={{ "--badge-color": `var(--estado-${estado})` } as React.CSSProperties}>
      <Icono size={13} />
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}

export function PrioridadBadge({ prioridad }: { prioridad: PrioridadPQR }) {
  const Icono = ICONOS_PRIORIDAD[prioridad];
  return (
    <span className="badge" style={{ "--badge-color": `var(--prioridad-${prioridad})` } as React.CSSProperties}>
      <Icono size={13} />
      {ETIQUETAS_PRIORIDAD[prioridad]}
    </span>
  );
}

export function TipoBadge({ tipo }: { tipo: TipoPQR }) {
  const Icono = ICONOS_TIPO[tipo];
  return (
    <span className="badge" style={{ "--badge-color": `var(--tipo-${tipo})` } as React.CSSProperties}>
      <Icono size={13} />
      {ETIQUETAS_TIPO[tipo]}
    </span>
  );
}

const ETIQUETAS_SLA: Record<SlaEstado, string> = {
  a_tiempo: "A tiempo",
  por_vencer: "Por vencer",
  vencida: "Vencida",
  cumplido: "Cumplido",
  incumplido: "Incumplido",
};

const ICONOS_SLA: Record<SlaEstado, ComponentType<{ size?: number }>> = {
  a_tiempo: CheckCircle2,
  por_vencer: TimerReset,
  vencida: AlertTriangle,
  cumplido: CheckCircle2,
  incumplido: AlertTriangle,
};

export function SlaBadge({ slaEstado }: { slaEstado: SlaEstado }) {
  const Icono = ICONOS_SLA[slaEstado];
  return (
    <span className="badge" style={{ "--badge-color": `var(--sla-${slaEstado})` } as React.CSSProperties}>
      <Icono size={13} />
      {ETIQUETAS_SLA[slaEstado]}
    </span>
  );
}

export { ETIQUETAS_ESTADO, ETIQUETAS_PRIORIDAD, ETIQUETAS_TIPO, ETIQUETAS_SLA };
