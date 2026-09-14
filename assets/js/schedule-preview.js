/* Escalations / Schedule preview tables, shared by the Rebuild Schedule popup and
   step 2 of the Add New Term popup.

   mount(host, rows)  renders partials/schedule-preview.html into host
   build(period, cur) turns a term configuration into preview rows
   SAMPLE             fixed placeholder rows, used where there is no entered config */

(function () {
  var ESCALATION_CELLS = ['dateFrom', 'dateTo', 'billingFrequency', 'chargeAmount',
    'escalationType', 'escalationAmount'];

  /* billingBatch is deliberately absent: that column always renders empty. */
  var SCHEDULE_CELLS = ['billOnDate', 'periodFrom', 'periodTo', 'Total'];

  var FREQUENCY_MONTHS = { Monthly: 1, Quarterly: 3, 'Semi-Annual': 6, Annual: 12 };

  /* Stand-in published rates, used when a CPI term carries no adjustment of its own. */
  var CPI_RATES = ['13.12%', '9.28%', '5.20%'];

  var BASE_AMOUNT = 1844302;
  var ESCALATION_CYCLES = 3;
  var SCHEDULE_ROWS = 12;

  /* ---------- dates ---------- */

  function parseDate(value) {
    var parts = String(value).split('/');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function format(date) {
    return date.getFullYear() + '/' + pad(date.getMonth() + 1) + '/' + pad(date.getDate());
  }

  /* Clamps to the last day of the target month, so 31 Jan + 1 month is 28 Feb. */
  function addMonths(date, count) {
    var moved = new Date(date.getFullYear(), date.getMonth() + count, 1);
    var lastDay = new Date(moved.getFullYear(), moved.getMonth() + 1, 0).getDate();
    moved.setDate(Math.min(date.getDate(), lastDay));
    return moved;
  }

  function dayBefore(date) {
    var moved = new Date(date.getTime());
    moved.setDate(moved.getDate() - 1);
    return moved;
  }

  function money(symbol, amount) {
    var parts = amount.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return symbol + parts.join('.');
  }

  function asPercent(value) {
    var text = String(value == null ? '' : value).trim();
    if (!text) return '';
    return /%$/.test(text) ? text : text + '%';
  }

  /* CPI escalates by a published index, so its amount is always a percentage: the term's
     own CPI adjustment when it has one, otherwise a stand-in rate for that cycle. */
  function escalationAmountFor(period, cycle) {
    switch (period.escalationType) {
      case 'CPI':
        return asPercent(period.cpiAdjustment) || CPI_RATES[cycle % CPI_RATES.length];
      case 'Percentage':
        return asPercent(period.escalationAmount);
      case 'Fixed':
        return period.escalationAmount || '';
      default:
        return '';
    }
  }

  function parseMoney(text) {
    var value = parseFloat(String(text).replace(/[^0-9.\-]/g, ''));
    return {
      symbol: String(text).replace(/[-\d.,\s]/g, ''),
      value: isNaN(value) ? 0 : value,
    };
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /* ---------- rows from an entered term configuration ---------- */

  function build(period, symbol) {
    var currency = symbol || 'COP$';
    var start = parseDate(period.termsStartDate);
    if (isNaN(start.getTime())) return { escalations: [], schedule: [] };

    var billingMonths = FREQUENCY_MONTHS[period.billingFrequency] || 1;
    var escalationMonths = Number(period.escalationFrequency) || 12;

    var escalations = [];
    for (var i = 0; i < ESCALATION_CYCLES; i++) {
      var from = addMonths(start, i * escalationMonths);
      var to = dayBefore(addMonths(start, (i + 1) * escalationMonths));
      escalations.push({
        dateFrom: format(from),
        dateTo: format(to),
        billingFrequency: period.billingFrequency,
        chargeAmount: money(currency, BASE_AMOUNT),
        escalationType: period.escalationType,
        escalationAmount: escalationAmountFor(period, i),
        /* Nothing of this term exists yet, so every row it creates is new. */
        state: 'New',
      });
    }

    var schedule = [];
    for (var j = 0; j < SCHEDULE_ROWS; j++) {
      var periodFrom = addMonths(start, j * billingMonths);
      var periodTo = dayBefore(addMonths(start, (j + 1) * billingMonths));
      schedule.push({
        billOnDate: format(periodFrom),
        periodFrom: format(periodFrom),
        periodTo: format(periodTo),
        Total: money(currency, BASE_AMOUNT),
        /* The opening period is billed pro rata, so it carries the escalation popover. */
        prorated: j === 0,
        state: 'New',
      });
    }

    return { escalations: escalations, schedule: schedule };
  }

  /* ---------- fixed placeholder rows ---------- */

  var SAMPLE = {
    escalations: [
      { dateFrom: '2022/02/26', dateTo: '2022/02/27', billingFrequency: 'Monthly', chargeAmount: 'COP$1,750,000.00', escalationType: 'CPI', escalationAmount: '13.12%', state: 'Remove' },
      { dateFrom: '2022/02/28', dateTo: '2022/12/31', billingFrequency: 'Monthly', chargeAmount: 'COP$1,844,302.00', escalationType: 'CPI', escalationAmount: '13.12%', state: 'Unmodified' },
      { dateFrom: '2023/01/01', dateTo: '2023/12/31', billingFrequency: 'Monthly', chargeAmount: 'COP$2,086,274.42', escalationType: 'CPI', escalationAmount: '9.28%', state: 'Modified' },
      { dateFrom: '2024/01/01', dateTo: '2024/12/31', billingFrequency: 'Monthly', chargeAmount: 'COP$2,279,880.69', escalationType: 'Fixed', escalationAmount: 'COP$-2,279,880.69', state: 'New' },
      { dateFrom: '2025/01/01', dateTo: '2025/12/31', billingFrequency: 'Monthly', chargeAmount: 'COP$0.00', escalationType: 'None', escalationAmount: '', state: 'Unmodified', otherTerm: true },
      { dateFrom: '2026/01/01', dateTo: '2026/06/30', billingFrequency: 'Monthly', chargeAmount: 'COP$0.00', escalationType: 'None', escalationAmount: '', state: 'New', otherTerm: true },
    ],
    schedule: [
      { billOnDate: '2022/02/01', periodFrom: '2022/02/26', periodTo: '2022/02/28', Total: 'COP$307,383.67', prorated: true, state: 'Modified' },
      { billOnDate: '2022/03/01', periodFrom: '2022/03/01', periodTo: '2022/03/31', Total: 'COP$1,844,302.00', state: 'Unmodified' },
      { billOnDate: '2022/04/01', periodFrom: '2022/04/01', periodTo: '2022/04/30', Total: 'COP$1,844,302.00', state: 'Unmodified' },
      { billOnDate: '2022/05/01', periodFrom: '2022/05/01', periodTo: '2022/05/31', Total: 'COP$1,844,302.00', state: 'Modified' },
      { billOnDate: '2022/06/01', periodFrom: '2022/06/01', periodTo: '2022/06/30', Total: 'COP$1,844,302.00', state: 'Unmodified' },
      { billOnDate: '2022/07/01', periodFrom: '2022/07/01', periodTo: '2022/07/31', Total: 'COP$1,844,302.00', state: 'Remove' },
      { billOnDate: '2022/08/01', periodFrom: '2022/08/01', periodTo: '2022/08/31', Total: 'COP$1,844,302.00', state: 'New' },
      { billOnDate: '2022/09/01', periodFrom: '2022/09/01', periodTo: '2022/09/30', Total: 'COP$1,844,302.00', state: 'New' },
      { billOnDate: '2022/10/01', periodFrom: '2022/10/01', periodTo: '2022/10/31', Total: 'COP$1,844,302.00', state: 'Unmodified' },
      { billOnDate: '2022/11/01', periodFrom: '2022/11/01', periodTo: '2022/11/30', Total: 'COP$1,844,302.00', state: 'Unmodified' },
      { billOnDate: '2022/12/01', periodFrom: '2022/12/01', periodTo: '2022/12/31', Total: 'COP$1,844,302.00', state: 'New', otherTerm: true },
      { billOnDate: '2023/01/01', periodFrom: '2023/01/01', periodTo: '2023/01/31', Total: 'COP$1,947,951.77', state: 'New', otherTerm: true },
    ],
  };

  /* ---------- proration ---------- */

  /* The slices of each escalation that fall inside one billing period. A prorated row
     is billed across these, so the popover lists them with their own dates. */
  function escalationParts(row, escalations) {
    var from = parseDate(row.periodFrom);
    var to = parseDate(row.periodTo);
    var parts = [];

    escalations.forEach(function (e) {
      var start = parseDate(e.dateFrom);
      var end = parseDate(e.dateTo);
      if (end < from || start > to) return;

      var partFrom = start > from ? start : from;
      var partTo = end < to ? end : to;

      /* The slice is billed pro rata: its share of the month at that escalation's rate. */
      var days = Math.round((partTo - partFrom) / 86400000) + 1;
      var rate = parseMoney(e.chargeAmount);

      parts.push({
        from: format(partFrom),
        to: format(partTo),
        /* chargeLabel stands in for the figure when a slice is not really billed. */
        amount: e.chargeLabel || e.chargeAmount,
        scheduleCharge: money(rate.symbol, rate.value * days / daysInMonth(partFrom)),
        escalationType: e.escalationType,
      });
    });

    return parts;
  }

  /* Grace periods suspend the charge, so every period bills zero except the first and
     the last. The rows are copied, never mutated - SAMPLE is shared. */
  function sampleWithGrace() {
    /* Zeroes one money field from the second entry on. `keepLast` spares the final one,
       and `label` is what the popover shows in place of a zero. */
    function suspend(list, field, keepLast, label) {
      var last = list.length - 1;

      return list.map(function (item, index) {
        if (index === 0 || (keepLast && index === last)) return item;

        var copy = {};
        Object.keys(item).forEach(function (key) { copy[key] = item[key]; });
        copy[field] = money(parseMoney(item[field]).symbol, 0);
        /* Suspending a row changes it rather than creating or dropping it. */
        copy.state = 'Modified';
        if (label) copy.chargeLabel = label;
        return copy;
      });
    }

    return {
      /* Zeroed here too, so a prorated row's popover shows the graced slices as 0
         in both its Escalation Amount and its derived Schedule Charge. */
      escalations: suspend(SAMPLE.escalations, 'chargeAmount', true, 'GRACE PERIOD'),
      /* Only the opening period is billed; every later one, the last included, is zero. */
      schedule: suspend(SAMPLE.schedule, 'Total', false),
    };
  }

  /* ---------- rendering ---------- */

  function fillRows(scope, name, rows, cells, yearField) {
    var tbody = scope.querySelector('[data-rows="' + name + '"]');
    var tpl = scope.querySelector('[data-row="' + name + '"]');

    rows.forEach(function (r, index) {
      var row = tpl.content.cloneNode(true);
      var tr = row.firstElementChild;
      var state = r.state || 'Unmodified';
      if (tr) {
        tr.dataset.year = String(r[yearField] || '').slice(0, 4);
        tr.dataset.state = state;
        /* Rows of another term are hidden until the All terms switch is on. */
        tr.dataset.otherTerm = r.otherTerm ? 'true' : '';
      }

      var badge = row.querySelector('[data-cell="state"]');
      if (badge) {
        badge.textContent = state;
        badge.className = 'state state-' + state.toLowerCase();
      }

      cells.forEach(function (key) {
        var cell = row.querySelector('[data-cell="' + key + '"]');
        if (cell) cell.textContent = r[key] == null ? '' : r[key];
      });

      var flag = row.querySelector('[data-flag="prorated"]');
      if (flag) {
        var box = flag.querySelector('input');
        if (box) box.checked = !!r.prorated;

        /* Only a prorated row has parts worth explaining, so only it gets the popover. */
        if (r.prorated) {
          flag.setAttribute('data-prorated-row', index);
          flag.setAttribute('tabindex', '0');
          flag.classList.add('rb-prorated');
        }
      }

      tbody.appendChild(row);
    });
  }

  /* ---------- filters and year pagination ---------- */

  /* Each table keeps its own filters and its own year page. The two work together: the
     year buttons list only the years the filters leave behind, so a page is never empty
     while rows are still showing. */
  function tableView(host, name) {
    var tbody = host.querySelector('[data-rows="' + name + '"]');
    if (!tbody) return null;

    var rows = [];
    window.CONDITIONS.each(tbody.querySelectorAll('tr'), function (tr) { rows.push(tr); });

    var view = {
      name: name,
      rows: rows,
      pager: host.querySelector('[data-pager="' + name + '"]'),
      empty: host.querySelector('[data-empty="' + name + '"]'),
      years: [],
      year: null,
      /* On by default, matching the switch in the partial. */
      showOlder: true,
      allTerms: false,
    };

    refresh(view);
    return view;
  }

  function passesFilters(tr, view) {
    /* Off, the table shows only what the save leaves behind. */
    if (!view.showOlder && tr.dataset.state === 'Remove') return false;
    if (!view.allTerms && tr.dataset.otherTerm === 'true') return false;
    return true;
  }

  function refresh(view) {
    var kept = view.rows.filter(function (tr) { return passesFilters(tr, view); });

    view.years = [];
    kept.forEach(function (tr) {
      var year = tr.dataset.year;
      if (year && view.years.indexOf(year) === -1) view.years.push(year);
    });
    view.years.sort();

    /* Stay on the current year while the filters still leave rows in it. */
    if (view.years.indexOf(view.year) === -1) view.year = view.years[0] || null;

    view.rows.forEach(function (tr) {
      tr.hidden = !passesFilters(tr, view) || (view.year && tr.dataset.year !== view.year);
    });

    if (view.empty) view.empty.hidden = kept.length > 0;
    renderPager(view);
  }

  function renderPager(view) {
    if (!view.pager) return;

    if (!view.years.length) {
      view.pager.innerHTML = '';
      view.pager.hidden = true;
      return;
    }

    var index = view.years.indexOf(view.year);
    var first = index === 0;
    var last = index === view.years.length - 1;

    function step(target, label, disabled) {
      return '<button type="button" data-page="' + target + '"' +
        (disabled ? ' disabled' : '') + '>' + label + '</button>';
    }

    view.pager.hidden = false;
    view.pager.innerHTML =
      step('first', 'First', first) +
      step('prev', 'Prev', first) +
      view.years.map(function (year) {
        return '<button type="button" data-page-year="' + year + '" aria-current="' +
          (year === view.year) + '">' + year + '</button>';
      }).join('') +
      step('next', 'Next', last) +
      step('last', 'Last', last);
  }

  function pageTo(view, target) {
    var index = view.years.indexOf(view.year);

    if (target === 'first') view.year = view.years[0];
    else if (target === 'last') view.year = view.years[view.years.length - 1];
    else if (target === 'prev') view.year = view.years[Math.max(0, index - 1)];
    else if (target === 'next') view.year = view.years[Math.min(view.years.length - 1, index + 1)];
    else if (view.years.indexOf(target) !== -1) view.year = target;
    else return;

    refresh(view);
  }

  /* The tables sit in a horizontally scrolling box, which clips absolutely positioned
     children, so the popover is position:fixed and placed against the cell's rect. */
  function attachProrationPopover(panel, schedule, escalations) {
    var existing = panel.querySelector('.pop');
    if (existing) existing.parentNode.removeChild(existing);

    var pop = document.createElement('div');
    pop.className = 'pop';
    pop.setAttribute('role', 'tooltip');
    pop.hidden = true;
    panel.appendChild(pop);

    function render(parts) {
      if (!parts.length) return '<p class="pop-title">No escalation covers this period.</p>';

      return '<p class="pop-title">Escalations within this billing period</p>' +
        '<table class="pop-table"><thead><tr>' +
        '<th>From</th><th>To</th><th class="rb-num">Escalation Amount</th><th class="rb-num">Schedule Charge</th>' +
        '</tr></thead><tbody>' +
        parts.map(function (part) {
          return '<tr><td>' + part.from + '</td><td>' + part.to + '</td>' +
            '<td class="rb-num">' + part.amount + '</td>' +
            '<td class="rb-num">' + part.scheduleCharge + '</td></tr>';
        }).join('') +
        '</tbody></table>';
    }

    var MARGIN = 8;   /* breathing room against the viewport edge */
    var GAP = 6;      /* between the cell and the popover */

    /* The popover is only as big as its content, but never bigger than the room around
       the cell: it opens on whichever side has more space and scrolls if it still cannot
       fit. Two parts stay compact; twenty stay on screen. */
    function show(cell) {
      var row = schedule[Number(cell.dataset.proratedRow)];
      if (!row) return;

      pop.innerHTML = render(escalationParts(row, escalations));
      pop.hidden = false;
      pop.style.left = '0px';
      pop.style.top = '0px';
      pop.style.maxHeight = 'none';

      var box = cell.getBoundingClientRect();
      var spaceBelow = window.innerHeight - box.bottom - GAP - MARGIN;
      var spaceAbove = box.top - GAP - MARGIN;
      var openBelow = spaceBelow >= spaceAbove;

      /* Cap the height before measuring, so a long list reports its clamped size. */
      pop.style.maxHeight = Math.max(80, openBelow ? spaceBelow : spaceAbove) + 'px';

      var width = pop.offsetWidth;
      var height = pop.offsetHeight;
      var left = box.left + box.width / 2 - width / 2;
      var top = openBelow ? box.bottom + GAP : box.top - GAP - height;

      pop.style.left = Math.max(MARGIN, Math.min(left, window.innerWidth - width - MARGIN)) + 'px';
      pop.style.top = Math.max(MARGIN, top) + 'px';
    }

    function hide() { pop.hidden = true; }

    /* Assigned, not added, so re-mounting never stacks handlers. */
    panel.onmouseover = function (e) {
      var cell = e.target.closest('[data-prorated-row]');
      if (cell) show(cell);
    };
    panel.onmouseout = function (e) {
      var cell = e.target.closest('[data-prorated-row]');
      if (cell && !cell.contains(e.relatedTarget)) hide();
    };
    panel.onfocusin = function (e) {
      var cell = e.target.closest('[data-prorated-row]');
      if (cell) show(cell);
    };
    panel.onfocusout = hide;
  }

  /* options.only limits the preview to one of the two tables. */
  function mount(host, rows, options) {
    var only = options && options.only;

    return window.loadPartial('schedule-preview').then(function (fragment) {
      fillRows(fragment, 'escalations', rows.escalations, ESCALATION_CELLS, 'dateFrom');
      fillRows(fragment, 'schedule', rows.schedule, SCHEDULE_CELLS, 'periodFrom');

      if (only) {
        window.CONDITIONS.each(fragment.querySelectorAll('[data-preview-panel]'), function (section) {
          if (section.dataset.previewPanel !== only) section.parentNode.removeChild(section);
        });
      }

      host.innerHTML = '';
      host.appendChild(fragment);

      var panel = host.closest('.modal-panel') || host;
      attachProrationPopover(panel, rows.schedule, rows.escalations);

      var views = {};
      ['escalations', 'schedule'].forEach(function (name) {
        var view = tableView(host, name);
        if (view) views[name] = view;
      });

      function viewFor(el, attribute) {
        var owner = el.closest('[' + attribute + ']');
        return owner ? views[owner.getAttribute(attribute)] : null;
      }

      /* Assigned, not added, so re-mounting never stacks handlers. */
      panel.onclick = function (e) {
        var pageButton = e.target.closest('[data-page], [data-page-year]');
        if (!pageButton) return;

        var view = viewFor(pageButton, 'data-pager');
        if (view) pageTo(view, pageButton.dataset.page || pageButton.dataset.pageYear);
      };

      panel.onchange = function (e) {
        var toggle = e.target.closest('[data-filter]');
        if (!toggle) return;

        var view = viewFor(toggle, 'data-tools');
        if (!view) return;

        if (toggle.dataset.filter === 'older') view.showOlder = toggle.checked;
        else view.allTerms = toggle.checked;
        refresh(view);
      };
    });
  }

  window.SCHEDULE_PREVIEW = {
    mount: mount,
    build: build,
    money: money,
    asPercent: asPercent,
    SAMPLE: SAMPLE,
    sampleWithGrace: sampleWithGrace,
  };
})();
