/* Update End Date popup, opened from a charge card's gear menu. Markup lives in
   partials/end-date.html; it edits only the charge's End Date Override.

   END_DATE_MODAL.open(charge, { onSave: function () { ... } })  onSave runs after the
                                                                 charge has been updated

   Save previews the rows the new end date removes (or, when it moves later, creates)
   and asks for a change reason before the charge is touched. */

(function () {
  /* The date the popup proposes when it opens, whatever the charge holds now. */
  var DEFAULT_END_DATE = '2026/05/31';

  var lastFocus = null;

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function root() {
    return document.getElementById('end-date-modal');
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
    document.body.classList.remove('overflow-hidden');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function save(el, charge, options) {
    var values = window.CONDITIONS.read(el);
    var hasOverride = values.hasEndDateOverride === 'Yes';
    var date = (values.endDateOverride || '').trim();

    /* Yes means there is an end date, so it has to be filled in. */
    var missing = hasOverride && !date;
    el.querySelector('[data-end-error]').hidden = !missing;
    if (missing) return el.querySelector('[data-field="endDateOverride"]').focus();

    var newEnd = hasOverride ? date : '';
    var oldEnd = charge.terms.hasEndDateOverride === 'Yes' ? (charge.terms.endDateOverride || '') : '';

    function apply() {
      charge.terms.hasEndDateOverride = hasOverride ? 'Yes' : 'No';
      /* A date left behind a No would still read as an end date elsewhere, so it goes. */
      charge.terms.endDateOverride = newEnd;
      close();
      if (options && options.onSave) options.onSave(charge);
    }

    /* Nothing moves, so there is nothing to preview. */
    if (newEnd === oldEnd) return close();

    /* The change only lands once its preview is saved and the change reason confirmed. */
    var change = window.SCHEDULE_PREVIEW.endDateChange(charge, newEnd);
    window.REBUILD_MODAL.open((oldEnd || 'No end date') + ' → ' + (newEnd || 'No end date'), {
      title: 'Update End Date',
      rows: change,
      message: change.removing
        ? 'Update the end date? The rows shown here will be removed.'
        : 'Update the end date? The rows shown here will be created.',
      onSaved: apply,
    });
  }

  function open(charge, options) {
    var el = root();
    lastFocus = document.activeElement;
    el.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-end-close]')) return close();
      if (e.target.closest('[data-end-save]')) return save(el, charge, options);

      var yn = e.target.closest('[data-yesno]');
      if (yn) {
        each(yn.parentNode.querySelectorAll('[data-yesno]'), function (btn) {
          btn.setAttribute('aria-pressed', String(btn === yn));
        });
        window.CONDITIONS.apply(el);
      }
    };

    window.loadPartial('end-date').then(function (fragment) {
      fragment.querySelector('[data-cell="charge"]').textContent =
        charge.name + (charge.share ? ' ' + charge.share : '');

      /* Opens on Yes with the default date showing; the preview still names the charge's
         current end date beside the new one. */
      each(fragment.querySelectorAll('[data-yesno]'), function (btn) {
        btn.setAttribute('aria-pressed', String(btn.dataset.yesno === 'Yes'));
      });
      fragment.querySelector('[data-field="endDateOverride"]').value = DEFAULT_END_DATE;

      window.CONDITIONS.apply(fragment);
      el.innerHTML = '';
      el.appendChild(fragment);
      el.querySelector('[data-field="endDateOverride"]').focus();
    })['catch'](function (err) {
      el.innerHTML =
        '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
        '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
        '<p class="text-neutral-700 mb-4">' + err.message + '</p>' +
        '<button type="button" data-end-close class="btn">Close</button></div>';
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    /* The preview and confirmation open above this popup and close themselves. */
    if (window.REBUILD_MODAL && window.REBUILD_MODAL.isOpen()) return;
    if (window.CONFIRM_MODAL && window.CONFIRM_MODAL.isOpen()) return;
    close();
  });

  window.END_DATE_MODAL = { open: open, close: close, isOpen: isOpen };
})();
