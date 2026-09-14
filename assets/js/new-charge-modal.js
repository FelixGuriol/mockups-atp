/* New Charge popup, opened by the Add button above the cards. Markup lives in
   partials/new-charge.html: the charge's own fields, then the first term it starts with.
   The term's start date and amount are not asked for - they come from the charge.

   Save previews the escalations and billing rows the first term would create, then asks
   for a change reason; confirming adds the charge to the list on screen. */

(function () {
  var lastFocus = null;

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function root() {
    return document.getElementById('new-charge-modal');
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

  /* A charge starting on "Other" needs a date of its own; off a lease milestone it
     takes the milestone's date, so there is nothing to fill in. */
  function invalidField(el, values) {
    if (values.startsOn === 'Other' && !values.startDate) {
      return el.querySelector('[data-field="startDate"]');
    }
    return null;
  }

  function save(el) {
    var entered = window.CONDITIONS.read(el);
    var missing = invalidField(el, entered);

    el.querySelector('[data-new-error]').hidden = !missing;
    if (missing) return missing.focus();

    /* The first term's start date and amount come from the charge. */
    var values = window.CHARGE_LIST.resolve(entered);
    var symbol = values.currency === 'US Dollars' ? 'US$' : 'COP$';
    var preview = window.SCHEDULE_PREVIEW.build(values, symbol);

    window.REBUILD_MODAL.open(values.chargeType, {
      title: 'Create Charge',
      rows: preview,
      message: 'Create this charge? The escalations and billing rows shown here will be created.',
      onSaved: function () {
        window.CHARGE_LIST.add(values);
        close();
      },
    });
  }

  function open() {
    var el = root();
    lastFocus = document.activeElement;
    el.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-new-close]')) return close();
      if (e.target.closest('[data-new-save]')) return save(el);

      var yn = e.target.closest('[data-yesno]');
      if (yn) {
        each(yn.parentNode.querySelectorAll('[data-yesno]'), function (btn) {
          btn.setAttribute('aria-pressed', String(btn === yn));
        });
        window.CONDITIONS.apply(el);
      }
    };

    el.onchange = function (e) {
      if (e.target.closest('[data-field]')) window.CONDITIONS.apply(el);
    };

    window.loadPartial('new-charge').then(function (fragment) {
      window.CONDITIONS.apply(fragment);
      el.innerHTML = '';
      el.appendChild(fragment);
      el.querySelector('[data-field="chargeType"]').focus();
    })['catch'](function (err) {
      el.innerHTML =
        '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
        '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
        '<p class="text-neutral-700 mb-4">' + err.message + '</p>' +
        '<button type="button" data-new-close class="btn">Close</button></div>';
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    /* Popups above this one close themselves. */
    if (window.REBUILD_MODAL && window.REBUILD_MODAL.isOpen()) return;
    if (window.CONFIRM_MODAL && window.CONFIRM_MODAL.isOpen()) return;
    close();
  });

  window.NEW_CHARGE_MODAL = { open: open, close: close, isOpen: isOpen };
})();
