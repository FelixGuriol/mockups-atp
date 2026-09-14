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

  /* Grace period rows edit in place: the two date cells swap between text and inputs,
     and the row's own edit button doubles as its save button. */
  function graceValue(cell) {
    var input = cell.querySelector('input');
    return input ? input.value.trim() : cell.textContent.trim();
  }

  function setGraceEditing(row, editing) {
    each(row.querySelectorAll('[data-grace-cell]'), function (cell) {
      var value = graceValue(cell);
      if (editing) {
        cell.dataset.original = value;   /* kept so cancel can put it back */
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'f-input';
        input.placeholder = 'YYYY/MM/DD';
        input.value = value;
        cell.innerHTML = '';
        cell.appendChild(input);
      } else {
        cell.textContent = value;
      }
    });

    /* While a row is being edited its two buttons become save and cancel. */
    var edit = row.querySelector('[data-grace-edit]');
    if (edit) edit.textContent = editing ? 'save' : 'edit';

    var remove = row.querySelector('[data-grace-delete]');
    if (remove) remove.textContent = editing ? 'cancel' : 'delete';

    row.dataset.editing = editing ? 'true' : 'false';
  }

  /* Cancel restores what the row held before editing. A row that was never saved -
     one just added - has nothing to go back to, so it goes away. */
  function cancelGraceEditing(row) {
    if (row.dataset.isNew === 'true') {
      row.parentNode.removeChild(row);
      return;
    }

    each(row.querySelectorAll('[data-grace-cell]'), function (cell) {
      cell.textContent = cell.dataset.original || '';
    });
    setGraceEditing(row, false);
  }

  function addGraceRow(scope) {
    var tpl = scope.querySelector('[data-row="grace"]');
    var body = scope.querySelector('[data-rows="grace"]');
    if (!tpl || !body) return;

    body.appendChild(tpl.content.cloneNode(true));
    var row = body.lastElementChild;
    row.dataset.isNew = 'true';
    setGraceEditing(row, true);
    var first = row.querySelector('input');
    if (first) first.focus();
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

      var graceEdit = e.target.closest('[data-grace-edit]');
      if (graceEdit) {
        var editRow = graceEdit.closest('tr');
        var saving = editRow.dataset.editing === 'true';
        if (saving) editRow.dataset.isNew = 'false';
        return setGraceEditing(editRow, !saving);
      }

      /* Same button: cancel while editing, delete otherwise. */
      var graceDelete = e.target.closest('[data-grace-delete]');
      if (graceDelete) {
        var row = graceDelete.closest('tr');
        if (row.dataset.editing === 'true') return cancelGraceEditing(row);
        return row.parentNode.removeChild(row);
      }

      if (e.target.closest('[data-grace-add]')) return addGraceRow(el);

      /* Saving the charge previews everything it would create, then confirms. */
      if (e.target.closest('[data-charge-save]')) {
        return window.REBUILD_MODAL.open(charge.name, {
          title: 'Save Charge',
          message: 'Save this charge? The escalations and billing rows shown here will be created.',
          onSaved: close,
        });
      }

      /* Saving grace periods rebuilds the schedule, so it previews the result. */
      if (e.target.closest('[data-grace-save]')) {
        return window.REBUILD_MODAL.open('', {
          only: 'schedule',
          rows: window.SCHEDULE_PREVIEW.sampleWithGrace(),
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
