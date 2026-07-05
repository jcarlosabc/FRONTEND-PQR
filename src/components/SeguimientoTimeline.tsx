import type { SeguimientoItem } from "../types";

const ETIQUETAS_ACCION: Record<string, string> = {
  comentario: "Comentario interno",
  cambio_estado: "Cambio de estado",
  cambio_prioridad: "Cambio de prioridad",
  asignacion: "Asignación de agente",
};

export function SeguimientoTimeline({ seguimientos }: { seguimientos: SeguimientoItem[] }) {
  if (seguimientos.length === 0) {
    return <div className="estado-vacio">Todavía no hay seguimientos registrados.</div>;
  }

  const ordenados = [...seguimientos].reverse();

  return (
    <div className="timeline">
      {ordenados.map((item) => (
        <div className="timeline-item" key={item.id}>
          <div className="timeline-meta">
            {ETIQUETAS_ACCION[item.tipo_accion] ?? item.tipo_accion} · {item.usuario_nombre ?? "Sistema"} ·{" "}
            {new Date(item.fecha_registro).toLocaleString("es-CO")}
          </div>
          <div className="timeline-texto">{item.descripcion}</div>
        </div>
      ))}
    </div>
  );
}
