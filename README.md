# Template Progetto CSR Full-Stack

## Struttura

```
progetto_template/
├── backend/          # Express + TypeScript + MySQL
│   ├── src/
│   │   ├── config/database.ts    # Pool di connessione MySQL
│   │   ├── middleware/auth.ts     # JWT: authenticate + requireRole
│   │   ├── routes/auth.ts         # Registrazione e Login (COMPLETO)
│   │   ├── routes/template-crud.ts # Template per route CRUD
│   │   ├── server.ts              # Entry point Express
│   │   └── seed.ts                # Script di inizializzazione DB
│   ├── .env, package.json, tsconfig.json
├── frontend/         # React 19 + Vite 8 + TypeScript
│   ├── src/
│   │   ├── context/AuthContext.tsx  # Stato autenticazione
│   │   ├── components/Navbar.tsx    # Navigazione
│   │   ├── pages/Login.tsx          # Pagina login (COMPLETO)
│   │   ├── pages/Register.tsx       # Pagina registrazione (COMPLETO)
│   │   ├── services/api.ts          # Axios + interceptors
│   │   ├── App.tsx                  # Routing + auth guard
│   │   └── App.css                  # Design system completo
│   ├── index.html, package.json, vite.config.ts
├── database/schema.sql              # Schema DB (placeholder)
└── postman_collection.json          # Collection Postman (placeholder)
```

## Cosa è già pronto

- **Autenticazione completa** (register + login) backend e frontend
- **Middleware JWT** con `authenticate` e `requireRole(role)`
- **Design system** CSS completo (dark theme purple-pink)
- **Routing** con `ProtectedRoute` e gestione ruoli
- **Servizio API** con Axios e interceptors
- **Pool di connessione** MySQL

## Cosa va implementato

Cercare i commenti `TODO:` nei file per sapere cosa implementare in base al documento d'esame.

## Come avviare

```bash
# Backend
cd backend
npm install
# Modificare .env con le proprie credenziali MySQL
npm run seed    # Crea tabelle e dati iniziali
npm run dev     # Avvia su porta 3001

# Frontend
cd frontend
npm install
npm run dev     # Avvia su porta 5173 (proxy API -> 3001)
```
