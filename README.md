# WhatsApp Webhook Router

Middleware full-stack para enrutar eventos de WhatsApp Business (Meta) por `phone_number_id` hacia aplicaciones internas, con logging, trazabilidad y reintentos.

## Estructura
- `backend`: API NestJS + MongoDB (retries persistidos en MongoDB)
- `frontend`: panel React para operación y monititoreo

## Levantar servicios
```bash
docker compose up -d
```

## Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

## Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
