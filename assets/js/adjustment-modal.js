/* Rent Adjustment row popup. Opens over Edit Charge to create or edit one row of the
   Rent Adjustments tables; markup lives in partials/adjustment-row.html.

   ADJUSTMENT_MODAL.open({
     title:  'Edit Rent Abatement',
     fields: ['fromDate', 'endDate', 'amount', ...],   the columns of that table
     labels: { amount: 'Abatement Amount' },           optional, per-table field names
     values: { fromDate: '2025/03/01', ... },           empty when creating
     preview: { title, message, rows, only },           optional; Save previews first
     onSave: function (values) { ... },                 runs once the change is confirmed
   }) */

(function () {
  var lastFocus = null;

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function root() {
    return document.getElementById('adjustment-modal');
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

  /* An adjustment is either an amount or a percentage, never both. */
  var EXCLUSIVE = { amount: 'percentage', percentage: 'amount' };

  /* Filling one in locks the other; clearing it frees the other again. */
  function lockExclusive(el) {
    Object.keys(EXCLUSIVE).forEach(function (name) {
      var input = el.querySelector('[data-field="' + name + '"]');
      var other = el.querySelector('[data-field="' + EXCLUSIVE[name] + '"]');
      if (!input || !other) return;
      other.disabled = input.value.trim() !== '' && other.value.trim() === '';
    });
  }

  /* Every row covers a period, so both dates are required and must run forwards.
     Dates are YYYY/MM/DD, which compare correctly as plain strings. */
  function problem(values) {
    if (!values.fromDate || !values.endDate) return 'Enter a from date and an end date.';
    if (values.endDate < values.fromDate) return 'The end date cannot be before the from date.';
    if (values.amount && values.percentage) return 'Enter an amount or a percentage, not both.';
    return '';
  }

  function save(el, options) {
    var values = {};
    options.fields.forEach(function (name) {
      var input = el.querySelector('[data-field="' + name + '"]');
      values[name] = input ? input.value.trim() : '';
    });

    var message = problem(values);
    var error = el.querySelector('[data-adjust-error]');
    error.textContent = message;
    error.hidden = !message;
    if (message) {
      var first = el.querySelector('[data-field="' + (values.fromDate ? 'endDate' : 'fromDate') + '"]');
      if (first) first.focus();
      return;
    }

    /* Held here: close() drops the popup, but the callbacks still need them. */
    var onSave = options.onSave;
    function commit() {
      close();
      if (onSave) onSave(values);
    }

    if (!options.preview) return commit();

    /* The row only lands once its schedule preview is saved and the change confirmed. */
    var preview = {};
    Object.keys(options.preview).forEach(function (key) { preview[key] = options.preview[key]; });
    preview.onSaved = commit;
    window.REBUILD_MODAL.open(values.fromDate + ' – ' + values.endDate, preview);
  }

  function open(options) {
    var el = root();
    lastFocus = document.activeElement;
    el.classList.remove('hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-adjust-close]')) return close();
      if (e.target.closest('[data-adjust-save]')) return save(el, options);
    };

    el.oninput = function (e) {
      var other = EXCLUSIVE[e.target.dataset && e.target.dataset.field];
      if (!other) return;
      if (e.target.value.trim() !== '') el.querySelector('[data-field="' + other + '"]').value = '';
      lockExclusive(el);
    };

    window.loadPartial('adjustment-row').then(function (fragment) {
      fragment.querySelector('[data-cell="title"]').textContent = options.title || '';

      /* Only the columns of the table being edited appear, under that table's names. */
      each(fragment.querySelectorAll('[data-adjust-field]'), function (block) {
        var name = block.dataset.adjustField;
        block.hidden = options.fields.indexOf(name) === -1;

        var label = block.querySelector('[data-label-text]');
        if (label && options.labels && options.labels[name]) label.textContent = options.labels[name];
      });

      options.fields.forEach(function (name) {
        var input = fragment.querySelector('[data-field="' + name + '"]');
        if (input) input.value = (options.values && options.values[name]) || '';
      });

      el.innerHTML = '';
      el.appendChild(fragment);
      lockExclusive(el);
      el.querySelector('[data-field="fromDate"]').focus();
    })['catch'](function (err) {
      el.innerHTML =
        '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
        '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
        '<p class="text-neutral-700 mb-4">' + err.message + '</p>' +
        '<button type="button" data-adjust-close class="btn">Close</button></div>';
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    /* The preview and confirmation open above this popup and close themselves. */
    if (window.REBUILD_MODAL && window.REBUILD_MODAL.isOpen()) return;
    if (window.CONFIRM_MODAL && window.CONFIRM_MODAL.isOpen()) return;
    close();
  });

  window.ADJUSTMENT_MODAL = { open: open, close: close, isOpen: isOpen };
})();
