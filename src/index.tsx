import { Hono } from 'hono'
import { renderer } from './renderer'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'
import { health } from './health'

const app = new Hono()

// Serve static files from public/ via /static/*
app.use('/static/*', serveStatic({ root: './public' }))

app.use(renderer)

// CORS for API
app.use('/api/*', cors())

app.get('/', (c) => {
  return c.render(
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <h1>Reflective Reinforcement Learning (RRL)</h1>
      <p style={{ marginTop: '8px', color: '#444' }}>A demo portal serving README + media assets.</p>
      <p style={{ marginTop: '8px' }}>
        <a href="/library" style={{ color: '#2563eb', textDecoration: 'underline', marginRight: '12px' }}>Browse Asset Library</a>
        <a href="/dashboards" style={{ color: '#2563eb', textDecoration: 'underline', marginRight: '12px' }}>Dashboards</a>
        <a href="/csv" style={{ color: '#2563eb', textDecoration: 'underline' }}>CSV Explorer</a>
      </p>
      <p style={{ marginTop: '8px' }}><a href="/library" style={{ color: '#2563eb', textDecoration: 'underline' }}>Browse Asset Library</a></p>

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

// Asset Library route
app.get('/library', (c) => {
  return c.render(
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <h1>Asset Library</h1>
      <p style={{ marginTop: '8px', color: '#444' }}>Local and external archives available for browsing and download.</p>
      <label style={{ display: 'block', marginTop: '12px' }}>
        <input id="toggleAdult" type="checkbox" style={{ marginRight: '8px' }} /> Show adult content
      </label>
      <div id="assets" style={{ marginTop: '16px' }}>Loading…</div>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          async function load(showAdult) {
            try {
              const res = await fetch('/api/assets');
              const data = await res.json();
              const entries = data.entries || [];
              const list = entries.filter(e => showAdult || !e.adult);
              const html = ['<ul style="list-style:none;padding:0;">',
                ...list.map(e => {
                  const label = e.type === 'zip' ? 'ZIP' : (e.type === 'folder' ? 'FOLDER' : (e.type || 'ITEM').toUpperCase());
                  const size = e.size ? ' (' + (e.size/1024/1024).toFixed(2) + ' MB)' : '';
                  const badge = e.adult ? ' <span style="color:#b91c1c;border:1px solid #ef4444;padding:2px 6px;border-radius:6px;">ADULT</span>' : '';
                  return '<li style="margin:8px 0;"><a href="' + e.url + '" style="color:#2563eb;text-decoration:underline;">' + e.name + '</a> <span style="color:#6b7280">[' + label + ']</span>' + size + badge + '</li>';
                }),
              '</ul>'].join('');
              document.getElementById('assets').innerHTML = html;
            } catch (e) {
              document.getElementById('assets').textContent = 'Failed to load manifest: ' + e;
            }
          }
          const cb = document.getElementById('toggleAdult');
          if (cb) {
            cb.addEventListener('change', () => load(cb.checked));
          }
          load(false);
        })();
      ` }} />
    </div>
  )
})

// R2 object proxy (streams files from R2)
app.get('/api/r2/:key{.+}', async (c) => {
  const env: any = (c as any).env || (c as any).executionCtx?.env || (c as any).get('env');
  if (!env || !env.R2) return c.text('R2 not configured', 501)
  const key = c.req.param('key')
  const obj = await env.R2.get(key)
  if (!obj) return c.notFound()
  const headers: Record<string, string> = {}
  const ct = (obj as any).httpMetadata?.contentType
  if (ct) headers['Content-Type'] = ct
  return new Response(obj.body as any, { headers })
})

// Aggregated assets listing: merge static manifest with R2 objects if available
app.get('/api/assets', async (c) => {
  try {
    const origin = new URL(c.req.url).origin
    let staticEntries: any[] = []
    try {
      const res = await fetch(origin + '/static/assets/assets.json')
      if (res.ok) {
        const j = await res.json()
        staticEntries = Array.isArray(j.entries) ? j.entries : []
      }
    } catch {}

    let r2Entries: any[] = []
    const env: any = (c as any).env || (c as any).executionCtx?.env || (c as any).get('env')
    if (env && env.R2) {
      const list = await env.R2.list()
      r2Entries = list.objects.map((o: any) => ({
        type: 'r2',
        name: o.key,
        size: o.size,
        url: '/api/r2/' + o.key
      }))
    }

    return c.json({ generatedAt: new Date().toISOString(), entries: [...staticEntries, ...r2Entries] })
  } catch (e: any) {
    return c.json({ error: String(e) }, 500)
  }
})

// Ingest external URL into R2 (edge-side copy)
app.post('/api/ingestR2', async (c) => {
  const env: any = (c as any).env || (c as any).executionCtx?.env || (c as any).get('env')
  if (!env || !env.R2) return c.text('R2 not configured', 501)
  const { url, key } = await c.req.json()
  if (!url) return c.text('Missing url', 400)
  const res = await fetch(url)
  if (!res.ok) return c.text('Fetch failed: ' + res.status + ' ' + res.statusText, 502)
  const filename = key || (url.split('/').pop() || ('upload-' + Date.now()))
  const contentType = res.headers.get('content-type') || 'application/octet-stream'
  const sizeHeader = res.headers.get('content-length')

  // Prefer streaming in production (requires known length via FixedLengthStream)
  try {
    // @ts-ignore - FixedLengthStream is a Workers runtime global in production
    const FLS = (globalThis as any).FixedLengthStream
    if (sizeHeader && res.body && typeof FLS === 'function') {
      const total = Number(sizeHeader)
      // Guard against unreasonable values
      if (!Number.isNaN(total) && total > 0) {
        const { readable, writable } = new FLS(total)
        // Start piping without awaiting to avoid buffering
        // Note: In CF Workers, pipeTo returns a promise, but R2.put can consume readable concurrently
        // We still await the pipe to complete before finishing
        const piping = res.body.pipeTo(writable)
        await env.R2.put(filename, readable, { httpMetadata: { contentType } })
        await piping
        return c.json({ ok: true, key: filename, size: total, streamed: true, url: '/api/r2/' + filename })
      }
    }
  } catch (e) {
    // Ignore and fall back to buffering
  }

  // Fallback: buffer (suitable for smaller files/local dev)
  const buf = await res.arrayBuffer()
  await env.R2.put(filename, buf, { httpMetadata: { contentType } })
  return c.json({ ok: true, key: filename, size: buf.byteLength, streamed: false, url: '/api/r2/' + filename })
})

// CSV Explorer route
app.get('/csv', (c) => {
  const u = new URL(c.req.url)
  const src = u.searchParams.get('src') || '/static/assets/REVENUE_TRACKING_SYSTEM.csv'
  return c.render(
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <h1>CSV Explorer</h1>
      <p style={{ marginTop: '8px', color: '#444' }}>Parse and explore CSVs client-side. Default source can be overridden via ?src=URL</p>
      <div style={{ marginTop: '12px' }}>
        <input id="src" type="text" value={src} style={{ width: '80%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <button id="load" style={{ marginLeft: '8px', padding: '8px 12px', background: '#2563eb', color: '#fff', borderRadius: '6px', border: 0 }}>Load</button>
      </div>
      <div id="status" style={{ marginTop: '12px', color: '#6b7280' }}>Idle</div>
      <div style={{ marginTop: '10px' }}>
        <input id="filter" type="text" placeholder="Filter rows (case-insensitive)" style={{ width: '60%', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
      </div>
      <div id="table" style={{ marginTop: '12px', overflowX: 'auto' }}></div>
      <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          function detectSchema(rows){
            if (!rows || rows.length < 2) return { headers: [], types: [] };
            var headers = rows[0].map(function(h){ return String(h); });
            var cols = headers.length;
            var types = new Array(cols).fill('string');
            for (var c=0;c<cols;c++){
              var seenNum = 0, seenDate = 0, seenStr = 0;
              for (var r=1;r<Math.min(rows.length, 200); r++){
                var v = rows[r][c];
                if (v === null || v === undefined || v === '') continue;
                var s = String(v).trim();
                if (!isNaN(Number(s))) { seenNum++; continue; }
                var d = new Date(s); if (!isNaN(d.getTime())) { seenDate++; continue; }
                seenStr++;
              }
              types[c] = (seenNum>0 && seenStr===0) ? 'number' : (seenDate>0 && seenStr===0 ? 'date' : 'string');
            }
            return { headers: headers, types: types };
          }
          function renderTable(rows){
            if (!rows || !rows.length) { document.getElementById("table").innerHTML = "<em>No rows.</em>"; return; }
            var schema = detectSchema(rows);
            var headers = schema.headers;
            var thead = "<thead><tr>" + headers.map(function(h,i){return "<th style=\\\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\\\">"+h+"<br><small style=\\\"color:#6b7280\\\">"+schema.types[i]+"</small></th>"}).join("") + "</tr></thead>";
            var body = "<tbody>" + rows.slice(1, 5001).map(function(r){
              return "<tr>" + r.map(function(c){return "<td style=\\\"padding:6px;border-bottom:1px solid #f3f4f6;\\\">"+String(c)+"</td>"}).join("") + "</tr>";
            }).join("") + "</tbody>";
            document.getElementById("table").innerHTML = "<table style=\\\"border-collapse:collapse;min-width:900px;\\\">" + thead + body + "</table>";
          }
          var ALL_ROWS = [];
          function applyFilter(){
            var q = (document.getElementById('filter')).value.toLowerCase();
            var rows = ALL_ROWS;
            if (q) {
              rows = [rows[0]].concat(rows.slice(1).filter(function(r){
                return r.some(function(c){ return String(c).toLowerCase().indexOf(q) !== -1; });
              }));
            }
            renderTable(rows);
          }
          function load(){
            var src = (document.getElementById("src")).value;
            document.getElementById("status").textContent = "Loading " + src + "...";
            fetch(src).then(function(res){
              if(!res.ok) throw new Error("HTTP "+res.status);
              return res.text();
            }).then(function(text){
              var parsed = (window).Papa.parse(text, { header:false });
              ALL_ROWS = parsed.data;
              renderTable(ALL_ROWS);
              document.getElementById("status").textContent = "Loaded " + (parsed.data.length||0) + " rows.";
            }).catch(function(e){
              document.getElementById("status").textContent = "Failed: " + e;
            });
          }
          var btn = document.getElementById("load");
          if (btn) btn.addEventListener("click", load);
          var filter = document.getElementById('filter');
          if (filter) filter.addEventListener('input', applyFilter);
          // Auto-load initial
          load();
        })();
      ` }} />
    </div>
  )
})

// Dashboards viewer with sidebar
app.get('/dashboards', (c) => {
  return c.render(
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial' }}>
      <aside style={{ width: '340px', borderRight: '1px solid #e5e7eb', padding: '16px' }}>
        <h2 style={{ margin: 0 }}>Dashboards</h2>
        <div id="list" style={{ marginTop: '12px' }}>Loading…</div>
      </aside>
      <main style={{ flex: 1, padding: '16px' }}>
        <div id="viewer" style={{ height: '85vh', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <iframe id="frame" src="about:blank" style={{ width: '100%', height: '100%', border: 0 }}></iframe>
        </div>
      </main>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          function render(list){
            var html = '<ul style="list-style:none;padding:0;margin:0">' + list.map(function(e){
              var label = (e.folder? e.folder + ' / ' : '') + e.name;
              return '<li style="margin:6px 0"><a data-url="'+e.url+'" href="#" style="text-decoration:underline;color:#2563eb">'+label+'</a></li>';
            }).join('') + '</ul>';
            document.getElementById('list').innerHTML = html;
            document.querySelectorAll('#list a').forEach(function(a){
              a.addEventListener('click', function(ev){ ev.preventDefault(); var u = a.getAttribute('data-url'); (document.getElementById('frame')).src = u; });
            });
          }
          fetch('/static/assets/dashboards.json').then(function(r){return r.json()}).then(function(j){ render(j.entries||[]); });
        })();
      ` }} />
    </div>
  )
})

// Health check endpoint for monitoring
app.get('/api/health', health)

// Simple Admin UI for R2 ingestion (client-side calls /api/ingestR2)
app.get('/admin/ingest', (c) => {
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
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var btn = document.getElementById('go');
          btn.addEventListener('click', function(){
            var url = (document.getElementById('url')).value;
            var key = (document.getElementById('key')).value;
            document.getElementById('out').textContent = 'Ingesting ' + url + ' ...';
            fetch('/api/ingestR2', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ url:url, key:key||undefined }) })
              .then(function(r){ return r.json(); })
              .then(function(j){ document.getElementById('out').textContent = JSON.stringify(j, null, 2); })
              .catch(function(e){ document.getElementById('out').textContent = String(e); });
          });
        })();
      ` }} />
    </div>
  )
})

export default app
