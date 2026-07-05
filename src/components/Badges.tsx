import type { EstadoPQR, PrioridadPQR, TipoPQR } from "../types";

const ETIQUETAS_ESTADO: Record<EstadoPQR, string> = {
  recibida: "Recibida",
  en_gestion: "En gestión",
  resuelta: "Resuelta",
  cerrada: "Cerrada",
};

const ETIQUETAS_PRIORIDAD: Record<PrioridadPQR, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const ETIQUETAS_TIPO: Record<TipoPQR, string> = {
  peticion: "Petición",
  queja: "Queja",
  reclamo: "Reclamo",
};

export function EstadoBadge({ estado }: { estado: EstadoPQR }) {
  return (
    <span className="badge" style={{ color: `var(--estado-${estado})` }}>
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}

export function PrioridadBadge({ prioridad }: { prioridad: PrioridadPQR }) {
  return (
    <span className="badge" style={{ color: `var(--prioridad-${prioridad})` }}>
      {ETIQUETAS_PRIORIDAD[prioridad]}
    </span>
  );
}

export function TipoBadge({ tipo }: { tipo: TipoPQR }) {
  return (
    <span className="badge" style={{ color: `var(--tipo-${tipo})` }}>
      {ETIQUETAS_TIPO[tipo]}
    </span>
  );
}

export { ETIQUETAS_ESTADO, ETIQUETAS_PRIORIDAD, ETIQUETAS_TIPO };
