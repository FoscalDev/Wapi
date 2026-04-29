# WhatsApp Webhook Router Backend

## Requisitos
- Node.js 20+
- MongoDB

## Configuración
1. Copiar `.env.example` a `.env`.
2. Ajustar credenciales y tokens.

## Ejecutar
```bash
npm install
npm run start:dev
```

## Endpoints principales
- `GET /api/webhook/meta`
- `POST /api/webhook/meta`
- `POST /api/auth/login`
- `GET/POST/PATCH/DELETE /api/configs`
- `GET /api/logs/messages`
- `GET /api/logs/routing`
- `GET /api/dashboard/summary`
- `GET /api/health`

## Postman
Los ejemplos JSON para pruebas están en `docs/examples`.
