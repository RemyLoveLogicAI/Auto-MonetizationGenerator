// Admin R2 ingestion client logic. Served as a static file so the page needs no inline script.
(function () {
  var btn = document.getElementById('go');
  btn.addEventListener('click', function () {
    var url = (document.getElementById('url')).value;
    var key = (document.getElementById('key')).value;
    document.getElementById('out').textContent = 'Ingesting ' + url + ' ...';
    fetch('/api/ingestR2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, key: key || undefined })
    })
      .then(function (r) { return r.json(); })
      .then(function (j) { document.getElementById('out').textContent = JSON.stringify(j, null, 2); })
      .catch(function (e) { document.getElementById('out').textContent = String(e); });
  });
})();
