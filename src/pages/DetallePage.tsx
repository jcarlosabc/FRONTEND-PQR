import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { agregarSeguimiento, cambiarEstado, obtenerPQR } from "../api/pqr";
import type { EstadoPQR, PQRDetail, PrioridadPQR } from "../types";
import { EstadoBadge, PrioridadBadge, TipoBadge } from "../components/Badges";
import { SeguimientoTimeline } from "../components/SeguimientoTimeline";

const SIGUIENTE_ESTADO: Partial<Record<EstadoPQR, { valor: EstadoPQR; etiqueta: string }>> = {
  recibida: { valor: "en_gestion", etiqueta: "Pasar a en gestión" },
  en_gestion: { valor: "resuelta", etiqueta: "Marcar como resuelta" },
  resuelta: { valor: "cerrada", etiqueta: "Cerrar PQR" },
};

const PRIORIDADES: PrioridadPQR[] = ["baja", "media", "alta", "urgente"];

export function DetallePage() {
  const { id } = useParams();
  const [pqr, setPqr] = useState<PQRDetail | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function recargar() {
    if (!id) return;
    setCargando(true);
    obtenerPQR(Number(id))
      .then(setPqr)
      .catch(() => setError("No se pudo cargar la PQR."))
      .finally(() => setCargando(false));
  }

  useEffect(recargar, [id]);

  if (cargando) return <p className="cargando">Cargando…</p>;
  if (error || !pqr) return <div className="alert alert-error">{error ?? "PQR no encontrada."}</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{pqr.titulo}</h1>
          <p>
            Radicado <strong>{pqr.radicado}</strong> · registrada el{" "}
            {new Date(pqr.created_at).toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card">
          <h2 className="card-title">Detalle</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <TipoBadge tipo={pqr.tipo} />
            <PrioridadBadge prioridad={pqr.prioridad} />
            <EstadoBadge estado={pqr.estado} />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{pqr.descripcion}</p>
          <dl className="resultado-radicado" style={{ marginTop: 0, paddingTop: 0, border: "none" }}>
            <dt>Categoría</dt>
            <dd>{pqr.categoria}</dd>
            <dt>Canal</dt>
            <dd>{pqr.canal}</dd>
            <dt>Agente asignado</dt>
            <dd>{pqr.agente_asignado_nombre ?? "Sin asignar"}</dd>
          </dl>
        </div>

        <div className="card">
          <h2 className="card-title">Solicitante</h2>
          <dl className="resultado-radicado" style={{ marginTop: 0, paddingTop: 0, border: "none" }}>
            <dt>Nombre</dt>
            <dd>{pqr.solicitante.nombre} {pqr.solicitante.apellido}</dd>
            <dt>Identificación</dt>
            <dd>{pqr.solicitante.identificacion}</dd>
            <dt>Correo</dt>
            <dd>{pqr.solicitante.email}</dd>
            <dt>Teléfono</dt>
            <dd>{pqr.solicitante.telefono || "—"}</dd>
          </dl>
        </div>
      </div>

      <AccionesEstado pqr={pqr} onActualizado={setPqr} />

      <div className="card">
        <h2 className="card-title">Seguimiento</h2>
        <FormularioSeguimiento pqrId={pqr.id} onCreado={recargar} />
        <div style={{ marginTop: 20 }}>
          <SeguimientoTimeline seguimientos={pqr.seguimientos} />
        </div>
      </div>
    </>
  );
}

function AccionesEstado({ pqr, onActualizado }: { pqr: PQRDetail; onActualizado: (p: PQRDetail) => void }) {
  const [prioridad, setPrioridad] = useState<PrioridadPQR>(pqr.prioridad);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siguiente = SIGUIENTE_ESTADO[pqr.estado];

  async function avanzarEstado() {
    if (!siguiente) return;
    setEnviando(true);
    setError(null);
    try {
      onActualizado(await cambiarEstado(pqr.id, { estado: siguiente.valor }));
    } catch {
      setError("No se pudo cambiar el estado.");
    } finally {
      setEnviando(false);
    }
  }

  async function guardarPrioridad() {
    if (prioridad === pqr.prioridad) return;
    setEnviando(true);
    setError(null);
    try {
      onActualizado(await cambiarEstado(pqr.id, { prioridad }));
    } catch {
      setError("No se pudo cambiar la prioridad.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">Acciones</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-grid">
        <div className="field">
          <label>Estado</label>
          {siguiente ? (
            <button type="button" className="btn btn-primary" onClick={avanzarEstado} disabled={enviando}>
              {siguiente.etiqueta}
            </button>
          ) : (
            <span className="hint">La PQR está cerrada; no admite más cambios de estado.</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="prioridad-select">Prioridad</label>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              id="prioridad-select"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadPQR)}
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={guardarPrioridad}
              disabled={enviando || prioridad === pqr.prioridad}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormularioSeguimiento({ pqrId, onCreado }: { pqrId: number; onCreado: () => void }) {
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    if (!descripcion.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      await agregarSeguimiento(pqrId, { descripcion: descripcion.trim(), tipo_accion: "comentario" });
      setDescripcion("");
      onCreado();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo agregar el seguimiento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="field">
        <label htmlFor="seguimiento">Agregar comentario interno</label>
        <textarea
          id="seguimiento"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe la gestión realizada…"
        />
      </div>
      <div className="btn-fila">
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Guardando…" : "Agregar seguimiento"}
        </button>
      </div>
    </form>
  );
}
