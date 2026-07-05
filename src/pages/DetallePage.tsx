import { AlertCircle, ArrowRight, Loader2, MessageSquarePlus, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { agregarSeguimiento, asignarAgente, cambiarEstado, obtenerPQR } from "../api/pqr";
import { listarUsuarios } from "../api/usuarios";
import type { EstadoPQR, PQRDetail, PrioridadPQR, Usuario } from "../types";
import { EstadoBadge, PrioridadBadge, SlaBadge, TipoBadge } from "../components/Badges";
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

  if (cargando)
    return (
      <p className="cargando">
        <Loader2 />
        Cargando…
      </p>
    );
  if (error || !pqr)
    return (
      <div className="alert alert-error">
        <AlertCircle />
        {error ?? "PQR no encontrada."}
      </div>
    );

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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <EstadoBadge estado={pqr.estado} />
          <PrioridadBadge prioridad={pqr.prioridad} />
          <TipoBadge tipo={pqr.tipo} />
          <SlaBadge slaEstado={pqr.sla_estado} />
        </div>
      </div>

      <div className="detalle-layout">
        <div className="detalle-principal">
          <div className="card">
            <h2 className="card-title">Detalle</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{pqr.descripcion}</p>
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

          <div className="card">
            <h2 className="card-title">Seguimiento</h2>
            <FormularioSeguimiento pqrId={pqr.id} onCreado={recargar} />
            <div style={{ marginTop: 20 }}>
              <SeguimientoTimeline seguimientos={pqr.seguimientos} />
            </div>
          </div>
        </div>

        <div className="detalle-lateral">
          <AccionesEstado pqr={pqr} onActualizado={setPqr} />

          <div className="card">
            <h2 className="card-title">Información</h2>
            <dl className="resultado-radicado" style={{ marginTop: 0, paddingTop: 0, border: "none" }}>
              <dt>Categoría</dt>
              <dd>{pqr.categoria}</dd>
              <dt>Canal</dt>
              <dd>{pqr.canal}</dd>
              <dt>Agente asignado</dt>
              <dd>{pqr.agente_asignado_nombre ?? "Sin asignar"}</dd>
              <dt>Plazo de respuesta</dt>
              <dd>{pqr.fecha_limite ? new Date(pqr.fecha_limite).toLocaleDateString("es-CO") : "—"}</dd>
              {pqr.calificacion && (
                <>
                  <dt>Calificación del ciudadano</dt>
                  <dd>{pqr.calificacion} / 5{pqr.comentario_calificacion && ` — "${pqr.comentario_calificacion}"`}</dd>
                </>
              )}
            </dl>
          </div>

          <ReasignarPQR pqr={pqr} onActualizado={setPqr} />
        </div>
      </div>
    </>
  );
}

function ReasignarPQR({ pqr, onActualizado }: { pqr: PQRDetail; onActualizado: (p: PQRDetail) => void }) {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [seleccion, setSeleccion] = useState<number | "">("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esSupervisorOAdmin = usuario?.rol === "supervisor" || usuario?.rol === "admin";

  useEffect(() => {
    if (!esSupervisorOAdmin) return;
    listarUsuarios()
      .then((lista) => setUsuarios(lista.filter((u) => u.is_active)))
      .catch(() => setError("No se pudo cargar la lista de usuarios."));
  }, [esSupervisorOAdmin]);

  if (!esSupervisorOAdmin) return null;

  async function reasignar() {
    if (seleccion === "") return;
    setEnviando(true);
    setError(null);
    try {
      onActualizado(await asignarAgente(pqr.id, Number(seleccion)));
      setSeleccion("");
    } catch {
      setError("No se pudo reasignar la PQR.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">Reasignar</h2>
      {error && (
        <div className="alert alert-error">
          <AlertCircle />
          {error}
        </div>
      )}
      <div className="field">
        <label htmlFor="reasignar-select">Asignar a</label>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            id="reasignar-select"
            value={seleccion}
            onChange={(e) => setSeleccion(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Selecciona un usuario…</option>
            {usuarios?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.rol})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={reasignar}
            disabled={enviando || seleccion === ""}
          >
            <Users size={16} />
            Reasignar
          </button>
        </div>
      </div>
    </div>
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
      {error && (
        <div className="alert alert-error">
          <AlertCircle />
          {error}
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label>Estado</label>
          {siguiente ? (
            <button type="button" className="btn btn-primary" onClick={avanzarEstado} disabled={enviando}>
              {enviando ? <Loader2 size={16} className="icono-spin" /> : <ArrowRight size={16} />}
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
      {error && (
        <div className="alert alert-error">
          <AlertCircle />
          {error}
        </div>
      )}
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
          {enviando ? <Loader2 size={16} className="icono-spin" /> : <MessageSquarePlus size={16} />}
          {enviando ? "Guardando…" : "Agregar seguimiento"}
        </button>
      </div>
    </form>
  );
}
