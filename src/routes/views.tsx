import { Hono } from 'hono'
import type { AppEnv } from '../types/bindings'

export const viewsRouter = new Hono<AppEnv>()

// Landing page route
viewsRouter.get('/', (c) => {
  return c.render(
    <div className="page-wrapper">
      <nav className="nav-header">
        <div className="nav-container">
          <div className="nav-brand">Auto-MonetizationGenerator</div>
          <ul className="nav-links">
            <li><a href="/api/health" className="nav-link">Health</a></li>
            <li><a href="/api/metrics" className="nav-link">Metrics</a></li>
            <li><a href="/dashboards" className="nav-link">Dashboards</a></li>
            <li><a href="/admin/ingest" className="nav-link">Admin</a></li>
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="container">
          <section className="section">
            <div className="section-header animate-fade-in-up">
              <h1 className="section-title">Auto-MonetizationGenerator</h1>
              <p className="section-subtitle">
                Advanced monetization platform with real-time analytics, 
                automated optimization, and comprehensive monitoring capabilities.
              </p>
            </div>
            
            <div className="dashboard-grid animate-slide-in-right">
              <div className="card">
                <h3>System Health</h3>
                <p>Monitor application performance, uptime, and system metrics in real-time.</p>
                <a href="/api/health" className="btn btn-primary">View Health Status</a>
              </div>
              
              <div className="card">
                <h3>Analytics Dashboard</h3>
                <p>Comprehensive metrics visualization with advanced filtering and insights.</p>
                <a href="/dashboards" className="btn btn-primary">Open Dashboard</a>
              </div>
              
              <div className="card">
                <h3>API Metrics</h3>
                <p>Access detailed performance metrics and system statistics via REST API.</p>
                <a href="/api/metrics" className="btn btn-secondary">View API</a>
              </div>
              
              <div className="card">
                <h3>Content Management</h3>
                <p>Manage R2 storage, ingest external content, and configure monetization rules.</p>
                <a href="/admin/ingest" className="btn btn-secondary">Admin Panel</a>
              </div>
            </div>
          </section>
          
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Platform Features</h2>
            </div>
            
            <div className="dashboard-grid">
              <div className="metric-card">
                <div className="metric-value">99.9%</div>
                <div className="metric-label">Uptime</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">&lt;50ms</div>
                <div className="metric-label">Response Time</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">24/7</div>
                <div className="metric-label">Monitoring</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-value">Auto</div>
                <div className="metric-label">Optimization</div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <div className="signature-footer">
        Made by Jeremy Morgan-Jones Sr (LoveLogic AI LLC)
      </div>
    </div>
  )
})

// Asset Library route
viewsRouter.get('/library', (c) => {
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
          function render(entries){
            var root = document.getElementById('assets');
            root.textContent = '';
            var ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            entries.forEach(function(e){
              var li = document.createElement('li');
              li.style.margin = '8px 0';
              var a = document.createElement('a');
              var href = String(e.url || '');
              var ok = href.indexOf('https://') === 0 || href.indexOf('http://') === 0 || href.charAt(0) === '/';
              a.setAttribute('href', ok ? href : '#');
              a.textContent = String(e.name || '');
              a.style.color = '#2563eb';
              a.style.textDecoration = 'underline';
              li.appendChild(a);
              var type = String(e.type || 'item').toUpperCase();
              var size = e.size ? ' (' + (e.size/1024/1024).toFixed(2) + ' MB)' : '';
              var meta = document.createElement('span');
              meta.style.color = '#6b7280';
              meta.textContent = ' [' + type + ']' + size;
              li.appendChild(meta);
              if (e.adult) {
                var badge = document.createElement('span');
                badge.textContent = ' ADULT';
                badge.style.color = '#b91c1c';
                badge.style.border = '1px solid #ef4444';
                badge.style.padding = '2px 6px';
                badge.style.borderRadius = '6px';
                li.appendChild(badge);
              }
              ul.appendChild(li);
            });
            root.appendChild(ul);
          }
          async function load(showAdult) {
            try {
              const res = await fetch('/api/assets');
              const data = await res.json();
              const entries = (data.entries || []).filter(e => showAdult || !e.adult);
              render(entries);
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

// CSV Explorer route with HTML entity escaping
viewsRouter.get('/csv', (c) => {
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
          function escapeHtml(str) {
            if (str === null || str === undefined) return '';
            return String(str)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
          }
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
            var thead = "<thead><tr>" + headers.map(function(h,i){return "<th style=\\\"text-align:left;border-bottom:1px solid #e5e7eb;padding:6px;\\\">"+escapeHtml(h)+"<br><small style=\\\"color:#6b7280\\\">"+escapeHtml(schema.types[i])+"</small></th>"}).join("") + "</tr></thead>";
            var body = "<tbody>" + rows.slice(1, 5001).map(function(r){
              return "<tr>" + r.map(function(c){return "<td style=\\\"padding:6px;border-bottom:1px solid #f3f4f6;\\\">"+escapeHtml(c)+"</td>"}).join("") + "</tr>";
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
viewsRouter.get('/dashboards', (c) => {
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
            var root = document.getElementById('list');
            root.textContent = '';
            var ul = document.createElement('ul');
            ul.style.listStyle = 'none';
            ul.style.padding = '0';
            ul.style.margin = '0';
            list.forEach(function(e){
              var li = document.createElement('li');
              li.style.margin = '6px 0';
              var a = document.createElement('a');
              var href = String(e.url || '');
              var ok = href.indexOf('https://') === 0 || href.indexOf('http://') === 0 || href.charAt(0) === '/';
              a.setAttribute('href', '#');
              a.setAttribute('data-url', ok ? href : 'about:blank');
              a.textContent = String((e.folder ? e.folder + ' / ' : '') + (e.name || ''));
              a.style.textDecoration = 'underline';
              a.style.color = '#2563eb';
              a.addEventListener('click', function(ev){
                ev.preventDefault();
                document.getElementById('frame').src = a.getAttribute('data-url');
              });
              li.appendChild(a);
              ul.appendChild(li);
            });
            root.appendChild(ul);
          }
          fetch('/static/assets/dashboards.json')
            .then(function(r){ return r.json(); })
            .then(function(j){ render(j.entries || []); })
            .catch(function(e){ document.getElementById('list').textContent = 'Failed to load dashboards: ' + e; });
        })();
      ` }} />
      <div className="signature-footer">Made by Jeremy Morgan-Jones Sr (LoveLogic AI LLC)</div>
    </div>
  )
})
