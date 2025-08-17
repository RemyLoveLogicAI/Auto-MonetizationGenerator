# webapp - RRL Demo Portal

This is a lightweight Cloudflare Pages + Hono site that renders the uploaded RRL README.md and embeds the provided video and podcast as a quick sharable preview.

- Backend: Hono (Cloudflare Pages)
- Static: public/static/* (README.md, rrl_demo_video.mp4, rrl_podcast.mp3)
- Dev server: Wrangler Pages via PM2 on port 3000

Routes
- GET /           → Landing page (renders README via Marked on client)
- GET /static/*   → Static assets (served from public/static)
- GET /api/hello  → Add your APIs as needed

Local dev
1) npm run build
2) fuser -k 3000/tcp 2>/dev/null || true
3) pm2 start ecosystem.config.cjs
4) curl http://localhost:3000

Deploy
- Use Wrangler Pages deploy with your Cloudflare account.
