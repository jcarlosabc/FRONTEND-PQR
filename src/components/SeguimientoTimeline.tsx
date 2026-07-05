import { History, MessageSquare, UserCog, type LucideIcon } from "lucide-react";
import type { SeguimientoItem } from "../types";

const ETIQUETAS_ACCION: Record<string, string> = {
  comentario: "Comentario interno",
  cambio_estado: "Cambio de estado",
  cambio_prioridad: "Cambio de prioridad",
  asignacion: "Asignación de agente",
};

const ICONOS_ACCION: Record<string, LucideIcon> = {
  comentario: MessageSquare,
  cambio_estado: History,
  cambio_prioridad: History,
  asignacion: UserCog,
};

export function SeguimientoTimeline({ seguimientos }: { seguimientos: SeguimientoItem[] }) {
  if (seguimientos.length === 0) {
    return (
      <div className="estado-vacio">
        <History />
        Todavía no hay seguimientos registrados.
      </div>
    );
  }

  const ordenados = [...seguimientos].reverse();

  return (
    <div className="timeline">
      {ordenados.map((item) => {
        const Icono = ICONOS_ACCION[item.tipo_accion] ?? History;
        return (
          <div className="timeline-item" key={item.id}>
            <span className="timeline-icono">
              <Icono />
            </span>
            <div className="timeline-meta">
              {ETIQUETAS_ACCION[item.tipo_accion] ?? item.tipo_accion} · {item.usuario_nombre ?? "Sistema"} ·{" "}
              {new Date(item.fecha_registro).toLocaleString("es-CO")}
            </div>
            <div className="timeline-texto">{item.descripcion}</div>
          </div>
        );
      })}
    </div>
  );
}
