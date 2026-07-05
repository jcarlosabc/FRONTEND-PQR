export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const ACCESS_KEY = "pqr_access_token";
const REFRESH_KEY = "pqr_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  params?: Record<string, string | undefined>;
}

function extraerMensaje(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const registro = body as Record<string, unknown>;
    if (typeof registro.detail === "string") return registro.detail;
    const primerCampo = Object.values(registro)[0];
    if (Array.isArray(primerCampo) && typeof primerCampo[0] === "string") {
      return primerCampo[0];
    }
    if (typeof primerCampo === "string") return primerCampo;
  }
  return `No se pudo completar la solicitud (código ${status}).`;
}

async function ejecutar(url: URL, method: string, headers: Record<string, string>, body: unknown) {
  return fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function refrescarToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const respuesta = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!respuesta.ok) {
    clearTokens();
    return false;
  }

  const datos = await respuesta.json();
  localStorage.setItem(ACCESS_KEY, datos.access);
  return true;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, params } = options;

  const url = new URL(`${API_URL}${path}`, window.location.origin);
  if (params) {
    for (const [clave, valor] of Object.entries(params)) {
      if (valor) url.searchParams.set(clave, valor);
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let respuesta = await ejecutar(url, method, headers, body);

  if (respuesta.status === 401 && auth && getRefreshToken()) {
    const renovado = await refrescarToken();
    if (renovado) {
      headers.Authorization = `Bearer ${getAccessToken()}`;
      respuesta = await ejecutar(url, method, headers, body);
    }
  }

  if (!respuesta.ok) {
    const cuerpoError = await respuesta.json().catch(() => null);
    throw new ApiError(respuesta.status, cuerpoError, extraerMensaje(cuerpoError, respuesta.status));
  }

  if (respuesta.status === 204) return undefined as T;
  return respuesta.json();
}
