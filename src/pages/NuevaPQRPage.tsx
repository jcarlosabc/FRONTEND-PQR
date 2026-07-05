import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { crearPQR } from "../api/pqr";

interface FormState {
  tipo: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  canal: string;
  nombre: string;
  apellido: string;
  identificacion: string;
  email: string;
  telefono: string;
}

const VACIO: FormState = {
  tipo: "peticion",
  titulo: "",
  descripcion: "",
  categoria: "",
  prioridad: "media",
  canal: "web",
  nombre: "",
  apellido: "",
  identificacion: "",
  email: "",
  telefono: "",
};

const CATEGORIAS = [
  "citas_medicas",
  "historias_clinicas",
  "facturacion",
  "afiliaciones",
  "atencion",
  "otro",
];

function validar(form: FormState): Partial<Record<keyof FormState, string>> {
  const errores: Partial<Record<keyof FormState, string>> = {};

  if (!form.titulo.trim()) errores.titulo = "El título es obligatorio.";
  else if (form.titulo.length > 150) errores.titulo = "Máximo 150 caracteres.";

  if (!form.descripcion.trim()) errores.descripcion = "Describe tu solicitud.";
  if (!form.categoria) errores.categoria = "Selecciona una categoría.";

  if (!form.nombre.trim()) errores.nombre = "Requerido.";
  if (!form.apellido.trim()) errores.apellido = "Requerido.";

  if (!form.identificacion.trim()) errores.identificacion = "Requerido.";
  else if (!/^\d{5,20}$/.test(form.identificacion.trim())) {
    errores.identificacion = "Solo números, entre 5 y 20 dígitos.";
  }

  if (!form.email.trim()) errores.email = "Requerido.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errores.email = "Correo inválido.";
  }

  return errores;
}

export function NuevaPQRPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [radicadoCreado, setRadicadoCreado] = useState<string | null>(null);

  function actualizar(campo: keyof FormState) {
    return (evento: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((previo) => ({ ...previo, [campo]: evento.target.value }));
    };
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    const erroresValidacion = validar(form);
    setErrores(erroresValidacion);
    setErrorGeneral(null);
    if (Object.keys(erroresValidacion).length > 0) return;

    setEnviando(true);
    try {
      const creada = await crearPQR({
        tipo: form.tipo,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria,
        prioridad: form.prioridad,
        canal: form.canal,
        solicitante: {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          identificacion: form.identificacion.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
        },
      });
      setRadicadoCreado(creada.radicado);
    } catch (err) {
      setErrorGeneral(err instanceof ApiError ? err.message : "No se pudo registrar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  if (radicadoCreado) {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <h2 className="card-title">Solicitud registrada</h2>
        <p style={{ fontSize: 14, color: "var(--ink-secondary)" }}>
          Guarda este número de radicado para hacer seguimiento a tu solicitud:
        </p>
        <p style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {radicadoCreado}
        </p>
        <div className="btn-fila">
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Buscar mi PQR
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setForm(VACIO);
              setRadicadoCreado(null);
            }}
          >
            Registrar otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Registrar nueva PQR</h1>
          <p>Cuéntanos tu petición, queja o reclamo. Te daremos un número de radicado para hacerle seguimiento.</p>
        </div>
      </div>

      {errorGeneral && <div className="alert alert-error">{errorGeneral}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="card">
          <h2 className="card-title">Detalle de la solicitud</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tipo">Tipo</label>
              <select id="tipo" value={form.tipo} onChange={actualizar("tipo")}>
                <option value="peticion">Petición</option>
                <option value="queja">Queja</option>
                <option value="reclamo">Reclamo</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="categoria">Categoría</label>
              <select id="categoria" value={form.categoria} onChange={actualizar("categoria")} className={errores.categoria ? "invalido" : ""}>
                <option value="">Selecciona…</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace("_", " ")}</option>
                ))}
              </select>
              {errores.categoria && <span className="error">{errores.categoria}</span>}
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="titulo">Título</label>
              <input id="titulo" value={form.titulo} onChange={actualizar("titulo")} className={errores.titulo ? "invalido" : ""} maxLength={150} />
              {errores.titulo && <span className="error">{errores.titulo}</span>}
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="descripcion">Descripción</label>
              <textarea id="descripcion" value={form.descripcion} onChange={actualizar("descripcion")} className={errores.descripcion ? "invalido" : ""} />
              {errores.descripcion && <span className="error">{errores.descripcion}</span>}
            </div>
            <div className="field">
              <label htmlFor="prioridad">Prioridad</label>
              <select id="prioridad" value={form.prioridad} onChange={actualizar("prioridad")}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="canal">Canal</label>
              <select id="canal" value={form.canal} onChange={actualizar("canal")}>
                <option value="web">Web</option>
                <option value="email">Correo electrónico</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Tus datos</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" value={form.nombre} onChange={actualizar("nombre")} className={errores.nombre ? "invalido" : ""} />
              {errores.nombre && <span className="error">{errores.nombre}</span>}
            </div>
            <div className="field">
              <label htmlFor="apellido">Apellido</label>
              <input id="apellido" value={form.apellido} onChange={actualizar("apellido")} className={errores.apellido ? "invalido" : ""} />
              {errores.apellido && <span className="error">{errores.apellido}</span>}
            </div>
            <div className="field">
              <label htmlFor="identificacion">Número de identificación</label>
              <input id="identificacion" value={form.identificacion} onChange={actualizar("identificacion")} className={errores.identificacion ? "invalido" : ""} />
              {errores.identificacion && <span className="error">{errores.identificacion}</span>}
              <span className="hint">Si ya nos has escrito antes, usa el mismo número.</span>
            </div>
            <div className="field">
              <label htmlFor="telefono">Teléfono (opcional)</label>
              <input id="telefono" value={form.telefono} onChange={actualizar("telefono")} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" type="email" value={form.email} onChange={actualizar("email")} className={errores.email ? "invalido" : ""} />
              {errores.email && <span className="error">{errores.email}</span>}
              <span className="hint">Te avisaremos aquí cuando cambie el estado de tu solicitud.</span>
            </div>
          </div>
        </div>

        <div className="btn-fila">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Enviando…" : "Registrar solicitud"}
          </button>
        </div>
      </form>
    </>
  );
}
