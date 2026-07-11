# Gestione Richieste Rimborso Spese Aziendali

Full-stack app per gestire richieste di rimborso spese (dipendenti + amministrativi).

## Stack

- **Frontend**: React 19 + Vite 8 + TypeScript
- **Backend**: Express + TypeScript
- **Database**: MySQL (mysql2)

## Avvio locale

```bash
# Backend
cd backend
npm install
# Modifica backend/.env con le tue credenziali MySQL
npm run seed    # Crea DB e dati di test
npm run dev     # Porta 3001 (o successiva se occupata)

# Frontend
cd frontend
npm install
npm run dev     # Porta 5173 (o successiva se occupata)
```

## Credenziali test (password: password123)

| Email | Ruolo |
|-------|-------|
| mario.rossi@azienda.com | Dipendente |
| giuseppe.verdi@azienda.com | Dipendente |
| laura.bianchi@azienda.com | Responsabile amministrativo |

## Deploy gratis (senza carta di credito)

### 1. Database → TiDB Serverless
1. Iscriviti su https://tidbcloud.com (no carta)
2. Crea cluster, scegli la tier **Serverless** (5GB gratis)
3. In `Connect` → `Connect with JDBC` copia la connection string
4. Usala per popolare le env var del backend

### 2. Backend → Koyeb
1. Iscriviti su https://koyeb.com (no carta)
2. Crea **Web Service** → collega GitHub repo `richiesta_rimborso`
3. Directory: `backend`
4. Build: `npm run build`
5. Start command: `npm start`
6. **Environment variables** (da TiDB):
   - `PORT=3001`
   - `DB_HOST=...`
   - `DB_USER=...`
   - `DB_PASSWORD=...`
   - `DB_NAME=rimborsi_spese`
   - `JWT_SECRET=cambia-questo-valore`
7. Deploy → ottieni URL tipo `https://tuo-backend.koyeb.app`

### 3. Frontend → Vercel (o Netlify)
1. Iscriviti su https://vercel.com (no carta)
2. Crea **New Project** → importa GitHub repo
3. Root: `frontend`
4. **Environment variable**: `VITE_API_URL=https://tuo-backend.koyeb.app`
5. Deploy → ottieni URL tipo `https://richiesta-rimborso.vercel.app`

### 4. Seeding del DB remoto
```bash
cd backend
# Modifica .env con le credenziali TiDB (invece di localhost)
npm run seed
```

## API

Documentazione Postman: `postman_collection.json`
