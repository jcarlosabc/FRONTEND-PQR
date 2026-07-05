import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { buscarPorRadicado, listarPQR, type FiltrosPQR } from "../api/pqr";
import type { PQRListItem, PQRPublico } from "../types";
import { EstadoBadge, PrioridadBadge, TipoBadge } from "../components/Badges";

const FILTRO_VACIO: FiltrosPQR = { tipo: "", estado: "", prioridad: "", categoria: "" };

export function ListadoPage() {
  const { usuario } = useAuth();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Peticiones, quejas y reclamos</h1>
          <p>Consulta el estado de una PQR por su radicado o, si eres agente, gestiona el listado completo.</p>
        </div>
      </div>

      <BuscadorRadicado />

      {usuario ? (
        <div style={{ marginTop: 24 }}>
          <ListadoInterno />
        </div>
      ) : (
        <div className="card" style={{ marginTop: 20 }}>
          <p style={{ margin: 0, color: "var(--ink-secondary)", fontSize: 14 }}>
            <Link to="/login">Inicia sesión</Link> como agente para ver el listado completo con filtros.
          </p>
        </div>
      )}
    </>
  );
}

function BuscadorRadicado() {
  const [radicado, setRadicado] = useState("");
  const [resultado, setResultado] = useState<PQRPublico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function buscar(evento: FormEvent) {
    evento.preventDefault();
    if (!radicado.trim()) return;
    setBuscando(true);
    setError(null);
    setResultado(null);
    try {
      const datos = await buscarPorRadicado(radicado.trim());
      setResultado(datos);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404
        ? "No existe ninguna PQR con ese número de radicado."
        : "No se pudo completar la búsqueda.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="card">
      <h2 className="card-title">Buscar por radicado</h2>
      <form onSubmit={buscar} className="buscador-radicado">
        <input
          placeholder="Ej: PQR-2026-000001"
          value={radicado}
          onChange={(e) => setRadicado(e.target.value)}
          aria-label="Número de radicado"
        />
        <button type="submit" className="btn btn-primary" disabled={buscando}>
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {error && <div className="alert alert-error" style={{ marginTop: 14 }}>{error}</div>}

      {resultado && (
        <div className="resultado-radicado">
          <dl>
            <dt>Radicado</dt>
            <dd>{resultado.radicado}</dd>
            <dt>Tipo</dt>
            <dd><TipoBadge tipo={resultado.tipo} /></dd>
            <dt>Categoría</dt>
            <dd>{resultado.categoria}</dd>
            <dt>Prioridad</dt>
            <dd><PrioridadBadge prioridad={resultado.prioridad} /></dd>
            <dt>Estado</dt>
            <dd><EstadoBadge estado={resultado.estado} /></dd>
            <dt>Última actualización</dt>
            <dd>{new Date(resultado.updated_at).toLocaleString("es-CO")}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}

function ListadoInterno() {
  const [filtros, setFiltros] = useState<FiltrosPQR>(FILTRO_VACIO);
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<{ results: PQRListItem[]; next: string | null; previous: string | null; count: number } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    listarPQR({ ...filtros, page: String(pagina) })
      .then((respuesta) => {
        if (!cancelado) setDatos(respuesta);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar el listado de PQR.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [filtros, pagina]);

  function actualizarFiltro(campo: keyof FiltrosPQR, valor: string) {
    setPagina(1);
    setFiltros((previo) => ({ ...previo, [campo]: valor }));
  }

  return (
    <div>
      <div className="filtros">
        <select value={filtros.tipo} onChange={(e) => actualizarFiltro("tipo", e.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          <option value="peticion">Petición</option>
          <option value="queja">Queja</option>
          <option value="reclamo">Reclamo</option>
        </select>
        <select value={filtros.estado} onChange={(e) => actualizarFiltro("estado", e.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="recibida">Recibida</option>
          <option value="en_gestion">En gestión</option>
          <option value="resuelta">Resuelta</option>
          <option value="cerrada">Cerrada</option>
        </select>
        <select value={filtros.prioridad} onChange={(e) => actualizarFiltro("prioridad", e.target.value)} aria-label="Filtrar por prioridad">
          <option value="">Toda prioridad</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
        <input
          placeholder="Filtrar por categoría"
          value={filtros.categoria}
          onChange={(e) => actualizarFiltro("categoria", e.target.value)}
          aria-label="Filtrar por categoría"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {cargando && <p className="cargando">Cargando PQR…</p>}

      {!cargando && datos && datos.results.length === 0 && (
        <div className="estado-vacio">No hay PQR que coincidan con estos filtros.</div>
      )}

      {!cargando && datos && datos.results.length > 0 && (
        <>
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Radicado</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Solicitante</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {datos.results.map((pqr) => (
                  <tr key={pqr.id}>
                    <td>
                      <Link className="radicado" to={`/pqr/${pqr.id}`}>{pqr.radicado}</Link>
                    </td>
                    <td>{pqr.titulo}</td>
                    <td><TipoBadge tipo={pqr.tipo} /></td>
                    <td><PrioridadBadge prioridad={pqr.prioridad} /></td>
                    <td><EstadoBadge estado={pqr.estado} /></td>
                    <td>{pqr.solicitante_nombre}</td>
                    <td>{new Date(pqr.updated_at).toLocaleDateString("es-CO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="btn-fila" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{datos.count} resultado(s)</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" disabled={!datos.previous} onClick={() => setPagina((p) => p - 1)}>
                Anterior
              </button>
              <button className="btn btn-secondary" disabled={!datos.next} onClick={() => setPagina((p) => p + 1)}>
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
