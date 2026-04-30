# 🕹️ Global Server-Authoritative Tic-Tac-Toe!

This is a globally scaled, hyper-optimized Server-Authoritative Multiplayer Tic-Tac-Toe game. We built this natively on the official **Heroic Labs Nakama** game engine, leveraging a robust TypeScript match-handler that runs inside a CockroachDB pipeline. The frontend is an ultralight React 19 + Vite bundle that communicates strictly through Binary WebSocket envelopes for lightning fast TTFB.

## App Features
- **Server Authoritative Logic**: The client does not possess the capacity to cheat. The server holds the absolute state, validating all grid bounds, turn limits, and win parameters.
- **Glassmorphism UI**: Built with pure TailwindCSS v4 with natively layered shadow domes.
- **120s Auto-Forfeiture**: If your opponent completely disconnects, Nakama's tick-engine natively expires them and gracefully yields the victory token to you.
- **Global Leaderboards**: Tracks lifetime wins, persistently recording actual Human Usernames against your native Device UUID bindings.

## 🚀 How to Host This For Free

We completely decoupled this architecture so it scales infinitely for $0. 

### 1. Frontend (GitHub Pages)
This repository contains a `.github/workflows/deploy.yml` script! Merely pushing this repository to GitHub will automatically trigger a Vite static-site generation runner and immediately deploy your gorgeous React lobby to your user namespace `https://<yourusername>.github.io` for free!

### 2. Backend (Render.com)
The backend requires a PostgreSQL or CockroachDB module to persist Matchmaker Tickets and Session telemetry.
1. Make a free Render workspace.
2. Select **Docker Deployment** and point it to the `/backend` folder.
3. Link a Free PostgreSQL managed Database inside Render, and inject its `DATABASE_URL` as an Environment Variable into the container.
4. Modify `frontend/src/NakamaClient.ts` to switch the active endpoints from `localhost` to the shiny secure URL you got from Render, and flip `useSSL = true`!

---

## 🛠️ Local Development (Running Right Now)
To test the multiplayer sockets yourself without deploying:

**Terminal 1:** Boot the CockroachDB / NodeJS Engine
```bash
cd backend
docker-compose down -v && docker-compose up -d --build
```
**Terminal 2:** Boot the React Server
```bash
cd frontend
npm ci
npm run dev
```

Finally, open heavily incognito Tabs to `http://localhost:5173` to safely test Nakama socket generation without Cookie overrides!
