// Asset Library client logic. Served as a static file so the page needs no inline script.
(function () {
  function render(entries) {
    var root = document.getElementById('assets');
    root.textContent = '';
    var ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    entries.forEach(function (e) {
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
      var size = e.size ? ' (' + (e.size / 1024 / 1024).toFixed(2) + ' MB)' : '';
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
