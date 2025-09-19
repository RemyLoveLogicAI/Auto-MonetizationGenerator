# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

- Install dependencies:
  ```bash
  npm install
  ```
- Build and bundle:
  ```bash
  npm run build
  ```
- Start local development server:
  ```bash
  # Kill any process on port 3000
  fuser -k 3000/tcp 2>/dev/null || true
  # Start Hono via PM2
  pm2 start ecosystem.config.cjs
  ```
- Test local server:
  ```bash
  curl http://localhost:3000
  ```
- Deploy to Cloudflare Pages:
  ```bash
  npx wrangler pages publish ./
  ```

## High-Level Architecture

```text
Auto-MonetizationGenerator/
├── public/               # Static assets served (README.md, video, podcast)
├── src/                  # Hono server handlers and routing
├── ecosystem.config.cjs  # PM2 process manager config
├── wrangler.toml         # Cloudflare Pages deployment config
├── package.json          # Scripts and dependencies
└── README.md             # Project overview and instructions
```

- **public/**: contains user-uploaded README and media files.
- **src/**: Hono route definitions (`GET /`, `GET /api/*`).
- **PM2**: manages the local Hono process via `ecosystem.config.cjs`.
- **Wrangler**: deployment via Cloudflare Pages using `wrangler.toml`.

> For customization, update `src/` routes and redeploy with Wrangler Pages.