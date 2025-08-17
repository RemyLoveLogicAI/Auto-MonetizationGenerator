import { Hono } from 'hono'
import { renderer } from './renderer'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files from public/ via /static/*
app.use('/static/*', serveStatic({ root: './public' }))

app.use(renderer)

app.get('/', (c) => {
  return c.render(
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <h1>Reflective Reinforcement Learning (RRL)</h1>
      <p style={{ marginTop: '8px', color: '#444' }}>A demo portal serving README + media assets.</p>

      <section style={{ marginTop: '20px' }}>
        <h2>README</h2>
        <div id="readme" class="prose" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', overflowX: 'auto' }}>Loading…</div>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2>Demo Video</h2>
        <video controls width="720" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <source src="/static/rrl_demo_video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>

      <section style={{ marginTop: '24px' }}>
        <h2>Podcast</h2>
        <audio controls style={{ width: '100%' }}>
          <source src="/static/rrl_podcast.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </section>

      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        ;(async () => {
          try {
            const res = await fetch('/static/README.md')
            const text = await res.text()
            const html = marked.parse(text)
            document.getElementById('readme').innerHTML = html
          } catch (e) {
            document.getElementById('readme').textContent = 'Failed to load README: ' + e
          }
        })()
      ` }} />
    </div>
  )
})

export default app
