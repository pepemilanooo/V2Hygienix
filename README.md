# Hygienix SaaS

MVP monorepo per gestionale disinfestazione **Hygienix**.

## Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **Storage**: AWS S3 (stub predisposto)
- **PDF**: PDFKit (stub predisposto)

## Moduli inclusi
- Autenticazione JWT
- Utenti (`admin`, `tecnico`)
- Clienti con campi opzionali `consulente` e `numero_consulente`
- Sedi cliente
- Cartellino sede
- Trappole / punti esca
- Interventi
- Foto intervento
- Firme intervento
- Sopralluoghi
- Preventivi e fatture
- Archivio documenti cliente

## Struttura
```text
backend/
frontend/
database/
docs/
```

## Avvio locale

### Database
Creare un database PostgreSQL e impostare `DATABASE_URL`.

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Deploy Railway
Vedi `docs/RAILWAY_DEPLOY.md`.
