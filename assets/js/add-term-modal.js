/* Add New Term popup. Opens on top of the Edit Terms popup; on save it hands the
   new period to TERMS_MODAL, which reorders the periods and redraws the dropdowns. */

(function () {
  var lastFocus = null;
  var currency = 'COP$';

  function root() {
    return document.getElementById('term-modal');
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

  function showStep(el, step) {
    window.CONDITIONS.each(el.querySelectorAll('[data-step]'), function (section) {
      section.hidden = section.dataset.step !== step;
    });
    window.CONDITIONS.each(el.querySelectorAll('[data-step-btn]'), function (btn) {
      btn.hidden = btn.dataset.stepBtn !== step;
    });
    var label = el.querySelector('[data-cell="step"]');
    if (label) {
      label.textContent = step === '1' ? 'Step 1 of 2 - configuration' : 'Step 2 of 2 - preview';
    }

    var body = el.querySelector('.flex-1');
    if (body) body.scrollTop = 0;
  }

  /* Step 1 must hold a start date before its preview means anything. */
  function validate(el) {
    var startDate = el.querySelector('[data-field="termsStartDate"]');
    var ok = !!startDate.value.trim();
    el.querySelector('[data-term-error]').hidden = ok;
    if (!ok) startDate.focus();
    return ok;
  }

  function next(el) {
    if (!validate(el)) return;
    var period = window.CONDITIONS.read(el);
    window.SCHEDULE_PREVIEW.mount(el.querySelector('[data-preview-host]'),
      window.SCHEDULE_PREVIEW.build(period, currency));
    showStep(el, '2');
  }

  function save(el) {
    if (!validate(el)) return showStep(el, '1');

    window.CONFIRM_MODAL.open({
      message: 'Add this term? The schedule shown in the preview will be created.',
      onConfirm: function () {
        window.TERMS_MODAL.addTermPeriod(window.CONDITIONS.read(el));
        close();
      },
    });
  }

  function open(symbol) {
    var el = root();
    currency = symbol || 'COP$';
    lastFocus = document.activeElement;
    el.classList.remove('hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-term-close]')) return close();
      if (e.target.closest('[data-term-next]')) return next(el);
      if (e.target.closest('[data-term-back]')) return showStep(el, '1');
      if (e.target.closest('[data-term-save]')) return save(el);

      var yn = e.target.closest('[data-yesno]');
      if (yn) {
        window.CONDITIONS.each(yn.parentNode.querySelectorAll('[data-yesno]'), function (btn) {
          btn.setAttribute('aria-pressed', String(btn === yn));
        });
        window.CONDITIONS.apply(el);
      }
    };

    el.onchange = function (e) {
      if (e.target.closest('[data-field]')) window.CONDITIONS.apply(el);
    };

    window.loadPartial('add-term').then(function (fragment) {
      window.CONDITIONS.apply(fragment);
      el.innerHTML = '';
      el.appendChild(fragment);
      showStep(el, '1');
      el.querySelector('[data-field="termsStartDate"]').focus();
    })['catch'](function (err) {
      el.innerHTML =
        '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
        '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
        '<p class="text-neutral-700 mb-4">' + err.message + '</p>' +
        '<button type="button" data-term-close class="btn">Close</button></div>';
    });
  }

  /* This popup sits on top, so it takes Escape first. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !isOpen()) return;
    if (window.REBUILD_MODAL && window.REBUILD_MODAL.isOpen()) return;
    if (window.CONFIRM_MODAL && window.CONFIRM_MODAL.isOpen()) return;
    close();
  });

  window.ADD_TERM_MODAL = { open: open, close: close, isOpen: isOpen };
})();
