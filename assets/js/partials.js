/* Loads HTML fragments from partials/ once, then hands out a fresh clone per call.
   Requires the folder to be served over HTTP - fetch is blocked on file:// URLs. */

(function () {
  var cache = {};

  function loadPartial(name) {
    if (!cache[name]) {
      /* no-cache forces revalidation: without it a browser can serve a stale copy of
         an edited partial from its heuristic cache, and the hooks stop matching. */
      var pending = fetch('partials/' + name + '.html', { cache: 'no-cache' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status + ' loading ' + name + '.html');
          return res.text();
        })
        .then(function (html) {
          var tpl = document.createElement('template');
          tpl.innerHTML = html.trim();
          return tpl;
        });

      /* Drop a failed load so the next open can retry. */
      pending['catch'](function () { delete cache[name]; });
      cache[name] = pending;
    }

    return cache[name].then(function (tpl) { return tpl.content.cloneNode(true); });
  }

  window.loadPartial = loadPartial;
})();
