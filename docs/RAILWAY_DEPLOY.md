# Deploy su Railway

## 1. Crea il progetto
- New Project
- Deploy from GitHub repo oppure carica il repository creato da questo zip

## 2. Aggiungi PostgreSQL
Railway genererà automaticamente `DATABASE_URL`.

## 3. Servizio backend
- Root directory: `backend`
- Variabili ambiente:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `CORS_ORIGIN`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `AWS_S3_BUCKET`
  - `APP_BASE_URL`

## 4. Servizio frontend
- Root directory: `frontend`
- Variabili ambiente:
  - `NEXT_PUBLIC_API_URL`

## 5. Migrazioni
Apri shell del backend ed esegui:
```bash
npm run migrate
npm run seed
```

## 6. Primo login
Dopo il seed iniziale:
- email: `admin@hygienix.it`
- password: `Admin123!`
