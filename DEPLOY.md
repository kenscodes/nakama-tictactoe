# Local and Production Deployment Guide

We split the project into two distinct pieces. The Frontend is configured to be perfectly 100% free via GitHub Pages, while the backend requires Nakama and PostgreSQL (which can easily be run locally, or dropped onto a cheap host like Render or DigitalOcean).

---

## 🏗️ 1. Deploying the Frontend (Free)
The frontend (`/frontend`) uses React, Vite, and tailwind and compiles to highly-optimized static HTML/JS files.

1. Create a repository on GitHub and push the `nakama-tictactoe` codebase master branch.
2. The included GitHub actions file (`.github/workflows/deploy.yml`) will automatically trigger.
3. Within 60 seconds, your front-end will be hosted for absolutely **$0** at `https://<yourusername>.github.io/nakama-tictactoe`.

*Note: You must go into your GitHub repository settings -> Pages -> Build and deployment -> Choose "GitHub Actions" instead of "Deploy from a branch".*

---

## 🎮 2. Running the Nakama Backend

Because Nakama is an extremely robust stateful server, it requires a Database cluster to track players, matchmaker tickets, and leaderboards. 

### Local Deployment (Easiest)
If you just want to run the authoritative server locally on your MacOS machine:
1. Open Terminal and navigate to the `/backend` folder.
2. Run `docker compose up -d --build`.
   > This automatically downloads CockroachDB (Database) and spins up Nakama, compiling our custom Tic-Tac-Toe TypeScript plugin and binding it to port `7350` and `7351`.
3. Open `http://localhost:7351` in your browser to access the Nakama Developer Console (admin/password).

### Production Cloud Deployment
If you want to host Nakama in the cloud so your friends can play the frontend:
1. **Render.com / DigitalOcean**: Create a new Web Service using Docker. Use the `/backend` folder as your root directory.
2. You must also instantiate a **PostgreSQL** or **CockroachDB** instance (Render offers a free Postgres tier) and link the `DATABASE_URL` environment variable to your Nakama Docker container.

---

> [!TIP]
> Before deploying your frontend, open `frontend/src/NakamaClient.ts` and change the `host` variable from `127.0.0.1` to the URL of your live cloud Nakama server (e.g., `nakama.my-custom-domain.com`), and set `useSSL = true;`.
