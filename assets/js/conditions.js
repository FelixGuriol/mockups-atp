/* Shared show/hide rules for popup forms.

   [data-when-field="x"] [data-when-value="A|B"]  show this element only when field x
                                                  holds one of those values
   [data-toggle-field="x"]                        names a No/Yes button group so it can
                                                  be read like a field
   [data-scope]                                   an island (one term period, say) that
                                                  repeats the same hooks; lookups stay
                                                  inside it */

(function () {
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* Current value of a field, whether it is an input, a select or a No/Yes group. */
  function valueOf(scope, name) {
    var el = scope.querySelector('[data-field="' + name + '"]');
    if (el) return el.tagName === 'SELECT' ? (el.options[el.selectedIndex] || {}).text || '' : el.value;

    var group = scope.querySelector('[data-toggle-field="' + name + '"]');
    if (group) {
      var pressed = group.querySelector('[aria-pressed="true"]');
      return pressed ? pressed.dataset.yesno : '';
    }
    return '';
  }

  function apply(scope) {
    each(scope.querySelectorAll('[data-when-field]'), function (el) {
      var local = el.closest('[data-scope]') || scope;
      var wanted = el.dataset.whenValue.split('|');
      el.hidden = wanted.indexOf(valueOf(local, el.dataset.whenField)) === -1;
    });
  }

  /* Every [data-field] value in a scope, plus any named No/Yes groups. */
  function read(scope) {
    var values = {};
    each(scope.querySelectorAll('[data-field]'), function (el) {
      values[el.dataset.field] = el.tagName === 'SELECT'
        ? (el.options[el.selectedIndex] || {}).text || ''
        : el.value;
    });
    each(scope.querySelectorAll('[data-toggle-field]'), function (group) {
      var pressed = group.querySelector('[aria-pressed="true"]');
      values[group.dataset.toggleField] = pressed ? pressed.dataset.yesno : '';
    });
    return values;
  }

  window.CONDITIONS = { apply: apply, valueOf: valueOf, read: read, each: each };
})();
