/* Confirmation popup with a change reason. Opens on top of a preview popup; the caller
   hands it an action to run once a reason has been entered.

   CONFIRM_MODAL.open({ message: '...', onConfirm: function (reason) { ... } }) */

(function () {
  var lastFocus = null;
  var pending = null;

  function root() {
    return document.getElementById('confirm-modal');
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
    pending = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  function accept(el) {
    var input = el.querySelector('[data-field="changeReason"]');
    var reason = input ? input.value.trim() : '';

    if (!reason) {
      el.querySelector('[data-confirm-error]').hidden = false;
      if (input) input.focus();
      return;
    }

    /* Held before close(), which clears it. */
    var action = pending;
    close();
    if (action) action(reason);
  }

  function open(options) {
    var el = root();
    pending = options && options.onConfirm;
    lastFocus = document.activeElement;
    el.classList.remove('hidden');

    el.onclick = function (e) {
      if (e.target === el || e.target.closest('[data-confirm-close]')) return close();
      if (e.target.closest('[data-confirm-accept]')) return accept(el);
    };

    window.loadPartial('confirm-change').then(function (fragment) {
      fragment.querySelector('[data-cell="message"]').textContent =
        (options && options.message) || 'This change will be saved.';

      el.innerHTML = '';
      el.appendChild(fragment);
      el.querySelector('[data-field="changeReason"]').focus();
    })['catch'](function (err) {
      el.innerHTML =
        '<div class="bg-white max-w-md m-auto my-16 p-6 border border-neutral-300 shadow-2xl text-sm">' +
        '<p class="font-semibold text-neutral-900 mb-2">Could not load the popup</p>' +
        '<p class="text-neutral-700 mb-4">' + err.message + '</p>' +
        '<button type="button" data-confirm-close class="btn">Close</button></div>';
    });
  }

  /* Topmost popup of all, so it takes Escape first. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close();
  });

  window.CONFIRM_MODAL = { open: open, close: close, isOpen: isOpen };
})();
