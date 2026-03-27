# Frontend

Aplicación React con Vite. En Docker se sirve con Nginx y consume la API a través de `/api`.

## Desarrollo local

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173` y el proxy de Vite redirige `/api` al backend en `http://localhost:3001`.

## Build

```bash
npm run build
```

## Con Docker

Normalmente no hace falta levantar este proyecto por separado. Se construye desde el `docker-compose.yml` del backend y queda disponible en `http://localhost:3000`.
