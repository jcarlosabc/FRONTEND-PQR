import { AlertCircle, AlertTriangle, CheckCircle2, CircleDot, Clock, Layers, Loader2, Lock, Star, TimerReset } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { obtenerEstadisticas } from "../api/pqr";
import type { EstadoPQR, EstadisticasResponse } from "../types";
import { ETIQUETAS_ESTADO, ETIQUETAS_PRIORIDAD, ETIQUETAS_TIPO } from "../components/Badges";

const ICONOS_ESTADO_TILE: Record<EstadoPQR, ComponentType<{ size?: number }>> = {
  recibida: CircleDot,
  en_gestion: Clock,
  resuelta: CheckCircle2,
  cerrada: Lock,
};

export function EstadisticasPage() {
  const [datos, setDatos] = useState<EstadisticasResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerEstadisticas()
      .then(setDatos)
      .catch(() => setError("No se pudieron cargar las estadísticas."));
  }, []);

  if (error)
    return (
      <div className="alert alert-error">
        <AlertCircle />
        {error}
      </div>
    );
  if (!datos)
    return (
      <p className="cargando">
        <Loader2 />
        Cargando…
      </p>
    );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Estadísticas</h1>
          <p>Panorama general de las PQR registradas en el sistema.</p>
        </div>
      </div>

      <div className="stat-tiles">
        <div className="stat-tile">
          <span className="stat-tile-icono">
            <Layers />
          </span>
          <div className="valor">{datos.total}</div>
          <div className="etiqueta">Total de PQR</div>
        </div>
        {datos.por_estado.map((item) => {
          const Icono = ICONOS_ESTADO_TILE[item.estado];
          return (
            <div className="stat-tile" key={item.estado} style={{ "--tile-color": `var(--estado-${item.estado})` } as React.CSSProperties}>
              <span className="stat-tile-icono">
                <Icono />
              </span>
              <div className="valor" style={{ color: `var(--estado-${item.estado})` }}>{item.total}</div>
              <div className="etiqueta">{ETIQUETAS_ESTADO[item.estado]}</div>
            </div>
          );
        })}
        <div className="stat-tile" style={{ "--tile-color": "var(--sla-vencida)" } as React.CSSProperties}>
          <span className="stat-tile-icono">
            <AlertTriangle />
          </span>
          <div className="valor" style={{ color: "var(--sla-vencida)" }}>{datos.vencidas}</div>
          <div className="etiqueta">Vencidas</div>
        </div>
        <div className="stat-tile" style={{ "--tile-color": "var(--sla-por_vencer)" } as React.CSSProperties}>
          <span className="stat-tile-icono">
            <TimerReset />
          </span>
          <div className="valor" style={{ color: "var(--sla-por_vencer)" }}>{datos.por_vencer}</div>
          <div className="etiqueta">Por vencer</div>
        </div>
        <div className="stat-tile" style={{ "--tile-color": "var(--prioridad-alta)" } as React.CSSProperties}>
          <span className="stat-tile-icono">
            <Star />
          </span>
          <div className="valor" style={{ color: "var(--prioridad-alta)" }}>
            {datos.calificacion_promedio ? datos.calificacion_promedio.toFixed(1) : "—"}
          </div>
          <div className="etiqueta">Calificación promedio</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card">
          <h2 className="card-title">Por tipo</h2>
          <BarraLista
            datos={datos.por_tipo.map((d) => ({ clave: d.tipo, etiqueta: ETIQUETAS_TIPO[d.tipo], total: d.total, color: `var(--tipo-${d.tipo})` }))}
          />
        </div>
        <div className="card">
          <h2 className="card-title">Por prioridad</h2>
          <BarraLista
            datos={datos.por_prioridad.map((d) => ({ clave: d.prioridad, etiqueta: ETIQUETAS_PRIORIDAD[d.prioridad], total: d.total, color: `var(--prioridad-${d.prioridad})` }))}
          />
        </div>
      </div>
    </>
  );
}

interface BarraDato {
  clave: string;
  etiqueta: string;
  total: number;
  color: string;
}

function BarraLista({ datos }: { datos: BarraDato[] }) {
  const maximo = Math.max(1, ...datos.map((d) => d.total));
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimado(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (datos.length === 0) {
    return (
      <div className="estado-vacio">
        <Layers />
        Sin datos todavía.
      </div>
    );
  }

  return (
    <div className="bar-list">
      {datos.map((item) => (
        <div className="bar-row" key={item.clave}>
          <span className="etiqueta">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block" }} />
            {item.etiqueta}
          </span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: animado ? `${(item.total / maximo) * 100}%` : "0%", background: item.color }}
            />
          </div>
          <span className="total">{item.total}</span>
        </div>
      ))}
    </div>
  );
}
