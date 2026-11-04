// CSV Explorer client logic. Served as a static file so the page needs no inline script.
(function () {
  function detectSchema(rows) {
    if (!rows || rows.length < 2) return { headers: [], types: [] };
    var headers = rows[0].map(function (h) { return String(h); });
    var cols = headers.length;
    var types = new Array(cols).fill('string');
    for (var c = 0; c < cols; c++) {
      var seenNum = 0, seenDate = 0, seenStr = 0;
      for (var r = 1; r < Math.min(rows.length, 200); r++) {
        var v = rows[r][c];
        if (v === null || v === undefined || v === '') continue;
        var s = String(v).trim();
        if (!isNaN(Number(s))) { seenNum++; continue; }
        var d = new Date(s); if (!isNaN(d.getTime())) { seenDate++; continue; }
        seenStr++;
      }
      types[c] = (seenNum > 0 && seenStr === 0) ? 'number' : (seenDate > 0 && seenStr === 0 ? 'date' : 'string');
    }
    return { headers: headers, types: types };
  }

  function renderTable(rows) {
    var root = document.getElementById('table');
    root.textContent = '';
    if (!rows || !rows.length) {
      var empty = document.createElement('em');
      empty.textContent = 'No rows.';
      root.appendChild(empty);
      return;
    }
    var schema = detectSchema(rows);
    var table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.minWidth = '900px';

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    schema.headers.forEach(function (h, i) {
      var th = document.createElement('th');
      th.style.textAlign = 'left';
      th.style.borderBottom = '1px solid #e5e7eb';
      th.style.padding = '6px';
      th.textContent = String(h);
      var small = document.createElement('small');
      small.style.color = '#6b7280';
      small.textContent = schema.types[i];
      th.appendChild(document.createElement('br'));
      th.appendChild(small);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    rows.slice(1, 5001).forEach(function (r) {
      if (!r) return;
      var tr = document.createElement('tr');
      r.forEach(function (cell) {
        var td = document.createElement('td');
        td.style.padding = '6px';
        td.style.borderBottom = '1px solid #f3f4f6';
        td.textContent = (cell === null || cell === undefined) ? '' : String(cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    root.appendChild(table);
  }

  var ALL_ROWS = [];

  function applyFilter() {
    var q = (document.getElementById('filter')).value.toLowerCase();
    var rows = ALL_ROWS;
    if (q) {
      rows = [rows[0]].concat(rows.slice(1).filter(function (r) {
        return r.some(function (c) { return String(c).toLowerCase().indexOf(q) !== -1; });
      }));
    }
    renderTable(rows);
  }

  function load() {
    var src = document.getElementById('src').value;
    document.getElementById('status').textContent = 'Loading ' + src + '...';
    fetch(src).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    }).then(function (text) {
      var parsed = window.Papa.parse(text, { header: false });
      ALL_ROWS = parsed.data;
      renderTable(ALL_ROWS);
      document.getElementById('status').textContent = 'Loaded ' + (parsed.data.length || 0) + ' rows.';
    }).catch(function (e) {
      document.getElementById('status').textContent = 'Failed: ' + e;
    });
  }

  var btn = document.getElementById('load');
  if (btn) btn.addEventListener('click', load);
  var filter = document.getElementById('filter');
  if (filter) filter.addEventListener('input', applyFilter);
  // Auto-load initial
  load();
})();
