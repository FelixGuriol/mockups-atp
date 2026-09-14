/* Edit Charge modal. Markup lives in partials/edit-charge.html; this file loads it,
   fills the placeholder values and wires the sub-tabs and close behaviour.
   The term period dropdowns are a popup of their own - see terms-modal.js. */

(function () {
  /* Charge level fields, filled once. */
  var TERM_FIELDS = ['chargeType', 'startsOn', 'startDate', 'endDateOverride', 'cycleDate',
    'scheduleCurrency', 'billingCurrency', 'initialCharge'];

  var lastFocus = null;

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function root() {
    return document.getElementById('charge-modal');
  }

  function isOpen() {
    var el = root();
    return !!el && !el.classList.contains('hidden');
  }

  /* Selects take the matching option, or gain one when the charge uses a value
     the partial does not list. Everything else is a plain text input. */
  function setField(scope, name, value) {
    var el = scope.querySelector('[data-field="' + name + '"]');
    if (!el) return;
    if (el.tagName !== 'SELECT') { el.value = value == null ? '' : value; return; }

    var matched = false;
    each(el.options, function (opt) {
      if (!matched && opt.text === value) { el.selectedIndex = opt.index; matched = true; }
    });
    if (!matched && value) {
      var opt = document.createElement('option');
      opt.text = value;
      el.insertBefore(opt, el.firstChild);
      el.selectedIndex = 0;
    }
  }

  function fillTerms(scope, charge) {
    scope.querySelector('[data-field="title"]').textContent =
      charge.name + (charge.share ? ' ' + charge.share : '');

    TERM_FIELDS.forEach(function (name) { setField(scope, name, charge.terms[name]); });

    each(scope.querySelectorAll('[data-toggle-field]'), function (group) {
      if (group.closest('template')) return;

      var value = charge.terms[group.dataset.toggleField];
      each(group.querySelectorAll('[data-yesno]'), function (btn) {
        btn.setAttribute('aria-pressed', String(btn.dataset.yesno === value));
      });
    });
  }

  /* The Rent Adjustments tab's tables create and edit their rows in a popup
     (adjustment-modal.js). A table's row template names its columns through [data-cell],
     so the popup asks for exactly those fields, whichever table it is. */
  function columnsOf(block) {
    var tpl = block.querySelector('[data-row]');
    var names = [];
    each(tpl.content.querySelectorAll('[data-cell]'), function (cell) {
      names.push(cell.dataset.cell);
    });
    return names;
  }

  /* Labels a table gives its own columns ("Abatement Amount"), for the popup to show. */
  function labelsOf(block) {
    var labels = {};
    each(block.querySelector('[data-row]').content.querySelectorAll('[data-label]'), function (cell) {
      labels[cell.dataset.cell] = cell.dataset.label;
    });
    return labels;
  }

  /* A suffix such as "%" is display only, so the popup gets the bare value. */
  function readRow(row) {
    var values = {};
    each(row.querySelectorAll('[data-cell]'), function (cell) {
      var text = cell.textContent.trim();
      var suffix = cell.dataset.suffix || '';
      values[cell.dataset.cell] = suffix && text.slice(-suffix.length) === suffix
        ? text.slice(0, -suffix.length) : text;
    });
    return values;
  }

  function writeRow(row, values) {
    each(row.querySelectorAll('[data-cell]'), function (cell) {
      var value = values[cell.dataset.cell];
      cell.textContent = value ? value + (cell.dataset.suffix || '') : '';
    });
  }

  /* What saving a row previews. A grace period suspends billing, so it shows the schedule
     it rewrites; abatements and reductions show both the escalations and the schedule. */
  function previewFor(block, title) {
    var noun = block.dataset.crudNoun.toLowerCase();
    var preview = {
      title: title,
      message: 'Save this ' + noun + '? The rows shown here will be updated.',
    };
    if (block.dataset.crud === 'grace') {
      preview.only = 'schedule';
      preview.rows = window.SCHEDULE_PREVIEW.sampleWithGrace();
    }
    return preview;
  }

  function editRow(row) {
    var block = row.closest('[data-crud]');
    var title = 'Edit ' + block.dataset.crudNoun;
    window.ADJUSTMENT_MODAL.open({
      title: title,
      fields: columnsOf(block),
      labels: labelsOf(block),
      values: readRow(row),
      preview: previewFor(block, title),
      onSave: function (values) { writeRow(row, values); },
    });
  }

  function addRow(block) {
    var title = 'Add New ' + block.dataset.crudNoun;
    window.ADJUSTMENT_MODAL.open({
      title: title,
      fields: columnsOf(block),
      labels: labelsOf(block),
      preview: previewFor(block, title),
      onSave: function (values) {
        var body = block.querySelector('[data-rows]');
        body.appendChild(block.querySelector('[data-row]').content.cloneNode(true));
        writeRow(body.lastElementChild, values);
      },
    });
  }

  function showPanel(id) {
    each(root().querySelectorAll('[data-panel]'), function (panel) {
      panel.hidden = panel.dataset.panel !== id;
    });
    each(root().querySelectorAll('[data-subtab]'), function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.subtab === id));
    });
  }

  function showLoadError(message) {
    root().innerHTML =
      '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
      '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
      '<p class="text-neutral-700 mb-1">' + message + '</p>' +
      '<p class="text-neutral-700 mb-4">Popups are loaded from <code>partials/</code>, which needs the folder ' +
      'served over HTTP. Run <code>python -m http.server 8000</code> in the project folder and reload.</p>' +
      '<button type="button" data-modal-close class="btn">Close</button></div>';
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

  function open(charge) {
    var el = root();
    lastFocus = document.activeElement;
    el.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-modal-close]')) return close();

      var rowEdit = e.target.closest('[data-crud-edit]');
      if (rowEdit) return editRow(rowEdit.closest('tr'));

      var rowDelete = e.target.closest('[data-crud-delete]');
      if (rowDelete) {
        var row = rowDelete.closest('tr');
        return row.parentNode.removeChild(row);
      }

      var rowAdd = e.target.closest('[data-crud-add]');
      if (rowAdd) return addRow(rowAdd.closest('[data-crud]'));

      /* Saving the charge previews everything it would create, then confirms. */
      if (e.target.closest('[data-charge-save]')) {
        return window.REBUILD_MODAL.open(charge.name, {
          title: 'Save Charge',
          message: 'Save this charge? The escalations and billing rows shown here will be created.',
          onSaved: close,
        });
      }

      var tab = e.target.closest('[data-subtab]');
      if (tab) return showPanel(tab.dataset.subtab);

      var yn = e.target.closest('[data-yesno]');
      if (yn) {
        each(yn.parentNode.querySelectorAll('[data-yesno]'), function (btn) {
          btn.setAttribute('aria-pressed', String(btn === yn));
        });

        var group = yn.closest('[data-toggle-field]');
        if (group) charge.terms[group.dataset.toggleField] = yn.dataset.yesno;

        window.CONDITIONS.apply(el);
      }
    };

    el.onchange = function (e) {
      if (e.target.closest('[data-field]')) window.CONDITIONS.apply(el);
    };

    window.loadPartial('edit-charge').then(function (fragment) {
      fillTerms(fragment, charge);
      window.CONDITIONS.apply(fragment);
      el.innerHTML = '';
      el.appendChild(fragment);
      showPanel('charge');
      el.querySelector('[data-modal-close]').focus();
    })['catch'](function (err) {
      showLoadError(err.message);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    /* Popups above this one close themselves. */
    if (window.ADJUSTMENT_MODAL && window.ADJUSTMENT_MODAL.isOpen()) return;
    if (window.REBUILD_MODAL && window.REBUILD_MODAL.isOpen()) return;
    if (window.CONFIRM_MODAL && window.CONFIRM_MODAL.isOpen()) return;
    close();
  });

  /* Warm the cache so the first open is instant. */
  document.addEventListener('DOMContentLoaded', function () {
    window.loadPartial('edit-charge')['catch'](function () {});
  });

  window.CHARGE_MODAL = { open: open, close: close, isOpen: isOpen };
})();
