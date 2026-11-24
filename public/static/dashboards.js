// Dashboard viewer client logic. Served as a static file so the page needs no inline script.
(function () {
  function render(list) {
    var root = document.getElementById('list');
    root.textContent = '';
    var ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    list.forEach(function (e) {
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
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        document.getElementById('frame').src = a.getAttribute('data-url');
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }
  fetch('/static/assets/dashboards.json')
    .then(function (r) { return r.json(); })
    .then(function (j) { render(j.entries || []); })
    .catch(function (e) { document.getElementById('list').textContent = 'Failed to load dashboards: ' + e; });
})();
