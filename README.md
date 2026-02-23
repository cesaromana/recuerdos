# Recuerdos

App web tipo diario para guardar, revisar y organizar recuerdos por fecha. Incluye autenticación, creación/edición de recuerdos, búsqueda, un resumen y páginas adicionales como mapa y ajustes. Está construida con **React + TypeScript** y se ejecuta con **Vite**.


## Funcionalidades
- Login y rutas protegidas (si no estás autenticado, redirige a `/login`).
- Crear, ver y editar recuerdos asociados a una fecha.
- Secciones principales:
  - Home
  - Crear recuerdo
  - Ver recuerdo
  - Editar recuerdo
  - Mapa
  - Búsqueda
  - Resumen
  - Ajustes
- PWA (Service Worker + Manifest).

## Stack
- React 19 + TypeScript
- Vite
- React Router DOM
- date-fns
- (Opcional / backend) Vercel Blob y Vercel Postgres

## Requisitos
- Node.js (recomendado: versión moderna LTS)

## Instalación
```bash
npm install
```

## Scripts
```bash
npm run dev      # levanta Vite en modo desarrollo
npm run build    # compila para producción
npm run preview  # preview del build
```

## Variables de entorno
El proyecto lee variables con Vite. Crea un archivo `.env` (o `.env.local`) en la raíz.

Ejemplo:
```bash
GEMINI_API_KEY=tu_api_key_aqui
```

> Nota: la configuración actual expone `GEMINI_API_KEY` al cliente (se define en `vite.config.ts`). Si esa clave debe ser secreta, conviene mover el consumo a un endpoint/serverless.

## Estructura (alto nivel)
- `App.tsx`: ruteo principal + rutas protegidas + providers (Auth/Theme).
- `pages/`: pantallas de la app (Login, Home, Create, View, Edit, etc).
- `components/`: componentes reutilizables (ej: `Header`).
- `context/`: contextos (Auth/Theme).
- `service-worker.js` + `manifest.json`: soporte PWA.

