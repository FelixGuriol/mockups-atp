/* Rebuild Schedule popup. Opens from the Rebuild Schedule button in a term period
   (and from the Schedule sub-tab), previews the escalations and the billing schedule
   the rebuild would create, and closes on Save. */

(function () {
  var lastFocus = null;

  function root() {
    return document.getElementById('rebuild-modal');
  }

  function isOpen() {
    var el = root();
    return !!el && !el.classList.contains('hidden');
  }

  function close() {
    var el = root();
    if (!isOpen()) return;
    el.classList.add('hidden');
    el.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  /* `range` is the term period's date range, or empty when rebuilding the whole charge. */
  function open(range, options) {
    var el = root();
    lastFocus = document.activeElement;
    el.classList.remove('hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-rebuild-close]')) return close();
      if (e.target.closest('[data-rebuild-save]')) {
        return window.CONFIRM_MODAL.open({
          message: (options && options.message) ||
            'Save this schedule? The escalations and billing rows shown here will be created.',
          onConfirm: function () {
            close();
            if (options && options.onSaved) options.onSaved();
          },
        });
      }
    };

    window.loadPartial('rebuild-schedule').then(function (fragment) {
      fragment.querySelector('[data-cell="title"]').textContent =
        (options && options.title) || 'Rebuild Schedule';
      fragment.querySelector('[data-cell="range"]').textContent = range || '';
      el.innerHTML = '';
      el.appendChild(fragment);
      el.querySelector('[data-rebuild-close]').focus();
      return window.SCHEDULE_PREVIEW.mount(el.querySelector('[data-preview-host]'),
        (options && options.rows) || window.SCHEDULE_PREVIEW.SAMPLE, options);
    })['catch'](function (err) {
      el.innerHTML =
        '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
        '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
        '<p class="text-neutral-700 mb-4">' + err.message + '</p>' +
        '<button type="button" data-rebuild-close class="btn">Close</button></div>';
    });
  }

  /* Topmost popup, so it takes Escape first. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    if (window.CONFIRM_MODAL && window.CONFIRM_MODAL.isOpen()) return;
    close();
  });

  window.REBUILD_MODAL = { open: open, close: close, isOpen: isOpen };
})();
