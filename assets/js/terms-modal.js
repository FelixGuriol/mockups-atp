/* Edit Terms modal. Markup lives in partials/edit-terms.html; this file loads it and
   renders one collapsible dropdown per term period. Opened from the card's gear menu,
   alongside - never on top of - the Edit Charge modal. */

(function () {
  /* Fields inside each term period dropdown, filled per period. */
  var PERIOD_FIELDS = ['termsStartDate', 'initialAmount', 'billingFrequency',
    'escalationType', 'escalationAmount', 'escalationFrequency', 'escalationAnniversary',
    'cpiIndex', 'cpiAdjustment', 'initialEscalationType', 'initialEscalationAmount'];

  var lastFocus = null;
  var currentCharge = null;

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function root() {
    return document.getElementById('terms-modal');
  }

  function isOpen() {
    var el = root();
    return !!el && !el.classList.contains('hidden');
  }

  /* Selects take the matching option, or gain one when the period uses a value
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

  /* "2025/01/01" -> "2024/12/31": a period ends the day before the next one starts. */
  function dayBefore(value) {
    var parts = String(value).split('/');
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    date.setDate(date.getDate() - 1);

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return date.getFullYear() + '/' + pad(date.getMonth() + 1) + '/' + pad(date.getDate());
  }

  /* Locks a text field and its calendar button. */
  function lockField(input) {
    if (!input) return;
    input.readOnly = true;
    var picker = input.parentNode.querySelector('.f-cal');
    if (picker) picker.disabled = true;
  }

  /* One dropdown per term period. The last one runs to the end date override, or
     open ended when there is none. */
  function fillTermPeriods(scope, charge) {
    var host = scope.querySelector('[data-rows="terms"]');
    var tpl = scope.querySelector('[data-row="terms"]');
    var periods = charge.termPeriods || [];

    host.innerHTML = '';

    periods.forEach(function (period, i) {
      var frag = tpl.content.cloneNode(true);
      var next = periods[i + 1];
      /* A hidden override must not drive the label, so honour the toggle. */
      var override = charge.terms.hasEndDateOverride === 'Yes' ? charge.terms.endDateOverride : '';
      var end = next ? dayBefore(next.termsStartDate) : (override || 'Open ended');

      frag.querySelector('[data-cell="label"]').textContent = 'Terms ' + (i + 1);
      frag.querySelector('[data-cell="range"]').textContent =
        period.termsStartDate + ' – ' + end;
      /* Every period starts collapsed. The first one begins where the charge begins,
         so its date is not editable. */
      if (i === 0) {
        lockField(frag.querySelector('[data-field="termsStartDate"]'));

        var amount = frag.querySelector('[data-field="initialAmount"]');
        if (amount) amount.disabled = true;

        /* Its No/Yes buttons go with it, so the first term's amount cannot be changed. */
        var amountToggle = frag.querySelector('[data-toggle-field="hasInitialAmount"]');
        if (amountToggle) {
          each(amountToggle.querySelectorAll('button'), function (btn) { btn.disabled = true; });
        }
      }

      PERIOD_FIELDS.forEach(function (name) { setField(frag, name, period[name]); });
      /* A period has more than one No/Yes group, so each reads its own field. */
      each(frag.querySelectorAll('[data-toggle-field]'), function (group) {
        var value = period[group.dataset.toggleField];
        each(group.querySelectorAll('[data-yesno]'), function (btn) {
          btn.setAttribute('aria-pressed', String(btn.dataset.yesno === value));
        });
      });

      host.appendChild(frag);
    });
  }

  function showLoadError(message) {
    root().innerHTML =
      '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
      '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
      '<p class="text-neutral-700 mb-1">' + message + '</p>' +
      '<p class="text-neutral-700 mb-4">Popups are loaded from <code>partials/</code>, which needs the folder ' +
      'served over HTTP. Run <code>python -m http.server 8000</code> in the project folder and reload.</p>' +
      '<button type="button" data-terms-close class="btn">Close</button></div>';
  }

  function close() {
    var el = root();
    if (!isOpen()) return;
    el.classList.add('hidden');
    el.innerHTML = '';
    document.body.classList.remove('overflow-hidden');
    currentCharge = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function open(charge) {
    var el = root();
    lastFocus = document.activeElement;
    currentCharge = charge;
    el.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-terms-close]')) return close();

      if (e.target.closest('[data-add-term]')) {
        return window.ADD_TERM_MODAL.open(charge.terms.scheduleCurrency === 'US Dollars' ? 'US$' : 'COP$');
      }

      /* Each button sits inside its own period, so it previews that period's range. */
      if (e.target.closest('[data-rebuild]')) {
        var scoped = e.target.closest('[data-scope]');
        var label = scoped ? scoped.querySelector('[data-cell="range"]').textContent : '';
        return window.REBUILD_MODAL.open(label);
      }

      var yn = e.target.closest('[data-yesno]');
      if (yn) {
        each(yn.parentNode.querySelectorAll('[data-yesno]'), function (btn) {
          btn.setAttribute('aria-pressed', String(btn === yn));
        });

        var holder = yn.closest('[data-scope]');
        var group = yn.closest('[data-toggle-field]');
        var periods = charge.termPeriods || [];
        var index = holder ? Array.prototype.indexOf.call(holder.parentNode.children, holder) : -1;
        if (group && periods[index]) periods[index][group.dataset.toggleField] = yn.dataset.yesno;

        window.CONDITIONS.apply(el);
      }
    };

    el.onchange = function (e) {
      if (e.target.closest('[data-field]')) window.CONDITIONS.apply(el);
    };

    window.loadPartial('edit-terms').then(function (fragment) {
      fragment.querySelector('[data-field="title"]').textContent =
        charge.name + (charge.share ? ' ' + charge.share : '');
      fillTermPeriods(fragment, charge);
      window.CONDITIONS.apply(fragment);
      el.innerHTML = '';
      el.appendChild(fragment);
      el.querySelector('[data-terms-close]').focus();
    })['catch'](function (err) {
      showLoadError(err.message);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    /* Popups above this one close themselves. */
    if (window.ADD_TERM_MODAL && window.ADD_TERM_MODAL.isOpen()) return;
    if (window.REBUILD_MODAL && window.REBUILD_MODAL.isOpen()) return;
    if (window.CONFIRM_MODAL && window.CONFIRM_MODAL.isOpen()) return;
    close();
  });

  /* Warm the cache so the first open is instant. */
  document.addEventListener('DOMContentLoaded', function () {
    window.loadPartial('edit-terms')['catch'](function () {});
  });

  /* Adds a term period to the charge on screen and redraws the dropdowns.
     Periods are kept in date order so each one still ends the day before the next. */
  function addTermPeriod(period) {
    if (!currentCharge) return;
    if (!currentCharge.termPeriods) currentCharge.termPeriods = [];

    currentCharge.termPeriods.push(period);
    currentCharge.termPeriods.sort(function (a, b) {
      return a.termsStartDate < b.termsStartDate ? -1 : a.termsStartDate > b.termsStartDate ? 1 : 0;
    });

    fillTermPeriods(root(), currentCharge);
    window.CONDITIONS.apply(root());
  }

  window.TERMS_MODAL = { open: open, close: close, isOpen: isOpen, addTermPeriod: addTermPeriod };
})();
