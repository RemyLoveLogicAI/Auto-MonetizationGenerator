import { Hono } from 'hono'
import type { AppEnv } from '../types/bindings'

export const adminRouter = new Hono<AppEnv>()

// Simple Admin UI for R2 ingestion (client-side calls /api/ingestR2)
adminRouter.get('/admin/ingest', (c) => {
  return c.render(
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <h1>R2 Ingestion</h1>
      <p style={{ color: '#444' }}>Paste an external URL. On submit, the worker will fetch and store it into your bound R2 bucket.</p>
      <div style={{ marginTop: '12px' }}>
        <input id="url" type="text" placeholder="https://..." style={{ width: '70%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <input id="key" type="text" placeholder="optional-key.ext" style={{ width: '28%', marginLeft: '8px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
      </div>
      <div style={{ marginTop: '12px' }}>
        <button id="go" style={{ padding: '8px 12px', background: '#2563eb', color: '#fff', borderRadius: '6px', border: 0 }}>Ingest</button>
      </div>
      <pre id="out" style={{ marginTop: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}></pre>
      <script src="/static/ingest.js"></script>
      <div className="signature-footer">Made by Jeremy Morgan-Jones Sr (LoveLogic AI LLC)</div>
    </div>
  )
})
