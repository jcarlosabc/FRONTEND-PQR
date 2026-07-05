# PQR — Frontend

Interfaz web del sistema de gestión de PQR de Fundación Sersocial IPS.
Permite a los ciudadanos registrar una PQR y consultar su estado por
radicado, y a los agentes internos listar, gestionar y hacer seguimiento a
las solicitudes.

Este repositorio contiene únicamente el frontend. La API vive en el
repositorio `backend-pqr`, y la documentación de análisis y el
`docker-compose` del sistema completo viven en `pqr-sistema`.

## Stack

- React 19 + TypeScript, Vite
- react-router-dom para el enrutamiento
- CSS plano con un sistema de tokens propio (sin librería de UI)
- Sin gestor de estado global: el estado de sesión vive en un `AuthContext`
  y cada pantalla resuelve sus propios datos con `fetch`

## Requisitos

- Node.js 20 o superior
- El backend corriendo (ver `backend-pqr/README.md`)

## Cómo ejecutar el proyecto

Necesita el backend corriendo en paralelo (`backend-pqr`) — ver su
README para levantarlo, con o sin Docker.

### Opción A — Sin Docker (Node local)

```bash
git clone https://github.com/jcarlosabc/FRONTEND-PQR.git frontend-pqr
cd frontend-pqr

npm install
cp .env.example .env    # por defecto apunta a http://localhost:8000/api

npm run dev
```

La aplicación queda en `http://localhost:5173`.

### Opción B — Con Docker

Este repositorio (`frontend-pqr`) **no tiene** `docker-compose.yml` a
propósito — solo un `Dockerfile`. El frontend solo, aislado, no tiene con
quién hablar la API (nginx necesita un contenedor llamado `backend` en su
misma red para poder proxear `/api`), así que el `docker compose up` real
se corre **desde la carpeta `pqr-sistema`**, no desde aquí:

```bash
git clone https://github.com/jcarlosabc/BACKEND-PQR.git backend-pqr
git clone https://github.com/jcarlosabc/FRONTEND-PQR.git frontend-pqr
git clone <url-de-pqr-sistema> pqr-sistema

cd backend-pqr && cp .env.example .env && cd ..

cd pqr-sistema        # <- el docker-compose.yml está AQUÍ, en ningún otro lado
docker compose up -d --build
docker compose exec backend python manage.py seed_demo
```

Si corres `docker compose up` dentro de `frontend-pqr` o en la carpeta
que las contiene a las tres, vas a ver `no configuration file provided:
not found` — es correcto, ese archivo solo existe dentro de `pqr-sistema`.

La aplicación queda en `http://localhost:8080` (nginx sirviendo el build
de React + proxy a `/api`, `/admin` y `/static` hacia el backend).

Si solo quieres verificar que la imagen de este repo compila y sirve
(sin backend detrás, solo para ver el shell estático):

```bash
docker build -t pqr-frontend --build-arg VITE_API_URL=/api .
docker run -p 8081:80 pqr-frontend
```

## Variables de entorno

| Variable | Efecto |
|---|---|
| `VITE_API_URL` | Base de la API. En desarrollo, `http://localhost:8000/api`. En producción (detrás de nginx), `/api` (ruta relativa). |

## Pantallas

- **Inicio** (`/`): buscador público por radicado y, para agentes autenticados, listado con filtros por tipo, estado, prioridad y categoría.
- **Nueva PQR** (`/nueva`): formulario público de registro con validación en cliente.
- **Detalle** (`/pqr/:id`, requiere sesión): información completa, cambio de estado/prioridad respetando el flujo obligatorio, y seguimiento con historial.
- **Estadísticas** (`/estadisticas`, requiere sesión): conteos por estado, tipo y prioridad.
- **Login** (`/login`): acceso de agentes (JWT).

La creación de PQR y la búsqueda por radicado son las únicas rutas
públicas, reflejando el mismo límite de acceso que expone la API.

## Build de producción

```bash
npm run build
```

Genera archivos estáticos en `dist/`, listos para servir con cualquier
servidor web (nginx, Vercel, Netlify, un CDN). No requiere Node en tiempo
de ejecución.

## Calidad de código

```bash
npm run lint     # oxlint
npm run build    # tsc -b, falla si hay errores de tipos
```

## Estructura del proyecto

```
frontend-pqr/
  src/
    api/          cliente HTTP, autenticación, llamadas a la API de PQR
    context/       AuthContext (sesión JWT)
    components/    Layout, badges, timeline de seguimiento, rutas protegidas
    pages/         las 5 pantallas de la aplicación
    styles/        sistema de diseño (tokens + componentes)
```

## Solución de problemas comunes

**"No se pudo conectar con el servidor" al iniciar sesión**: primero
confirma que el backend responde por su cuenta —
`curl http://localhost:8000/api/auth/login` (o `:8080/api/...` si usas
Docker) debe dar una respuesta JSON, no un error de conexión. Si el
backend está bien, haz `Ctrl+Shift+R` en el navegador (recarga sin
caché) — es común quedarse con una versión vieja del bundle después de
un `docker compose up --build`.

**`no configuration file provided: not found`**: este repositorio no
tiene `docker-compose.yml` a propósito — ver la sección de Docker más
arriba, el comando se corre desde `pqr-sistema`.

## Uso de IA

Este proyecto usó Claude Code (Anthropic) como asistente de desarrollo
durante la construcción del frontend inicialmente, Luego el uso de agente propio COCODRILE para mejorar
diseño de interfaz, arquitectura de componentes y validaciones
