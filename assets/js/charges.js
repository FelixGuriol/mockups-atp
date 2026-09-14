/* Charge Schedule tab: placeholder charge data rendered as cards or as a table.
   The gear on each card opens a menu: "Edit Charge" opens the modal in charge-modal.js,
   "Edit Terms" the one in terms-modal.js. */

/* Escalation rows for the Renta Torre charge. */
var RENTA_TORRE_SCHEDULE = [
  { startDate: '2025/01/01', endDate: '2026/06/30', amount: 'US$0.01',     escalationType: 'Fixed', escalationAmt: 'US$891.45',  billingFrequency: 'Monthly' },
  { startDate: '2026/07/01', endDate: '2026/12/31', amount: 'US$891.46',   escalationType: 'Fixed', escalationAmt: 'US$118.86',  billingFrequency: 'Monthly', current: true },
  { startDate: '2027/01/01', endDate: '2027/06/30', amount: 'US$1,010.32', escalationType: 'Fixed', escalationAmt: 'US$59.43',   billingFrequency: 'Monthly' },
  { startDate: '2027/07/01', endDate: '2027/12/31', amount: 'US$1,069.75', escalationType: 'Fixed', escalationAmt: 'US$208.01',  billingFrequency: 'Monthly' },
  { startDate: '2028/01/01', endDate: '2028/12/31', amount: 'US$1,277.76', escalationType: 'Fixed', escalationAmt: 'US$0.00',    billingFrequency: 'Monthly' },
  { startDate: '2029/01/01', endDate: '2029/12/31', amount: 'US$1,277.76', escalationType: 'Fixed', escalationAmt: 'US$-89.14',  billingFrequency: 'Monthly' },
  { startDate: '2030/01/01', endDate: '2030/12/31', amount: 'US$1,188.62', escalationType: 'Fixed', escalationAmt: 'US$0.00',    billingFrequency: 'Monthly' },
  { startDate: '2031/01/01', endDate: '2031/12/31', amount: 'US$1,188.62', escalationType: 'Fixed', escalationAmt: 'US$-59.44',  billingFrequency: 'Monthly' },
  { startDate: '2032/01/01', endDate: '2032/12/31', amount: 'US$1,129.18', escalationType: 'Fixed', escalationAmt: 'US$0.00',    billingFrequency: 'Monthly' },
  { startDate: '2033/01/01', endDate: '2033/12/31', amount: 'US$1,129.18', escalationType: 'Fixed', escalationAmt: 'US$0.00',    billingFrequency: 'Monthly' },
  { startDate: '2034/01/01', endDate: '2034/12/31', amount: 'US$1,129.18', escalationType: 'Fixed', escalationAmt: 'US$0.00',    billingFrequency: 'Monthly' },
];

var CHARGES = [
  {
    type: 'Rent Charge',
    subtitle: 'Charge schedule summary',
    name: 'Renta Torre',
    share: '100.00%',
    badge: null,
    row: { charge: 'US$ 891.46', frequency: 'Monthly', start: '2025/01/01', escalation: '0.00% CPI', status: 'Active' },
    terms: {
      chargeType: 'Renta Torre 100.00%',
      startsOn: 'Other',
      startDate: '2025/01/01',
      hasEndDateOverride: 'Yes',
      endDateOverride: '2034/12/31',
      currency: 'US Dollars',
      initialCharge: '0.01',
      billingFrequency: 'Monthly',
      escalationType: 'CPI',
      escalationAmount: '',
      escalatesWithCommencement: 'No',
      escalationFrequency: '12',
      escalationAnniversary: '2027/01/01',
      cpiIndex: 'IPC For USA',
    },
    termPeriods: [
      {
        termsStartDate: '2025/01/01',
        hasCycleDate: 'Yes',
        cycleDate: '2025/01/01',
        hasInitialAmount: 'Yes',
        initialAmount: '0.01',
        billingFrequency: 'Monthly',
        escalationType: 'CPI',
        escalationAmount: '',
        escalatesWithCommencement: 'No',
        escalationFrequency: '12',
        escalationAnniversary: '2027/01/01',
        cpiIndex: 'IPC For USA',
        cpiAdjustment: '',
      },
      {
        termsStartDate: '2026/07/01',
        hasCycleDate: 'Yes',
        cycleDate: '2026/07/01',
        hasInitialAmount: 'Yes',
        initialAmount: '891.46',
        billingFrequency: 'Monthly',
        escalationType: 'Fixed',
        escalationAmount: '118.86',
        escalatesWithCommencement: 'No',
        escalationFrequency: '12',
        escalationAnniversary: '2027/07/01',
        cpiIndex: 'IPC For USA',
        cpiAdjustment: '',
      },
      {
        termsStartDate: '2027/01/01',
        hasCycleDate: 'Yes',
        cycleDate: '2027/01/01',
        hasInitialAmount: 'Yes',
        initialAmount: '1010.32',
        billingFrequency: 'Monthly',
        escalationType: 'Percentage',
        escalationAmount: '5.00',
        escalatesWithCommencement: 'Yes',
        escalationFrequency: '12',
        escalationAnniversary: '2028/01/01',
        cpiIndex: 'IPC For USA',
        cpiAdjustment: '2.40',
      },
    ],
    schedule: RENTA_TORRE_SCHEDULE,
  },
];

/* ---------------------------------------------------------------------------
   Card contents. Everything on a card is derived from the charge and from the
   term period that covers today, so the card and the popups never disagree.
   --------------------------------------------------------------------------- */

function symbolOf(c) {
  return c.terms.currency === 'US Dollars' ? 'US$ ' : 'COP$ ';
}

function money(symbol, value) {
  return window.SCHEDULE_PREVIEW.money(symbol, Number(value || 0));
}

function toDate(value) {
  var parts = String(value).split('/');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function fmtDate(date) {
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  return date.getFullYear() + '/' + pad(date.getMonth() + 1) + '/' + pad(date.getDate());
}

/* The term period that covers today: the latest one that has already started.
   The last period runs to the End Date Override, or has no end without one. */
function currentTerm(c) {
  var periods = c.termPeriods || [];
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var override = c.terms.hasEndDateOverride === 'Yes' ? toDate(c.terms.endDateOverride) : null;
  if (override && today > override) return null;

  for (var i = periods.length - 1; i >= 0; i--) {
    if (toDate(periods[i].termsStartDate) > today) continue;

    var next = periods[i + 1];
    var end = next ? new Date(toDate(next.termsStartDate).getTime() - 86400000) : override;
    return {
      period: periods[i],
      label: 'Terms ' + (i + 1),
      range: periods[i].termsStartDate + ' – ' + (end ? fmtDate(end) : 'Open ended'),
    };
  }
  return null;  /* the charge has not started yet */
}

/* "0.00% CPI", "US$ 118.86 Fixed", "5.00% Percentage" or "None". */
function escalationText(symbol, p) {
  var percent = window.SCHEDULE_PREVIEW.asPercent;
  if (p.escalationType === 'CPI') return (percent(p.cpiAdjustment) || '0.00%') + ' CPI';
  if (p.escalationType === 'Percentage') return percent(p.escalationAmount) + ' Percentage';
  if (p.escalationType === 'Fixed') return money(symbol, p.escalationAmount) + ' Fixed';
  return 'None';
}

/* What belongs to the charge as a whole - the fields the Edit Charge popup holds. */
function chargeFields(c) {
  var t = c.terms;
  return [
    { label: 'Initial Charge', value: money(symbolOf(c), t.initialCharge) },
    { label: 'Starts on', value: t.startDate + ' ' + t.startsOn },
    { label: 'End Date Override', value: t.hasEndDateOverride === 'Yes' ? t.endDateOverride : 'No' },
  ];
}

/* What belongs to the current term - the fields its dropdown in Edit Terms holds. */
function termFields(c, current) {
  var p = current.period;
  var symbol = symbolOf(c);
  var list = [
    { label: 'Current Charge', value: money(symbol, p.initialAmount) + ' ' + p.billingFrequency },
    { label: 'Tenant Lease Start Billing Cycle', value: p.hasCycleDate === 'Yes' ? p.cycleDate : '' },
    { label: 'Escalation', value: escalationText(symbol, p) },
    { label: 'Escalation Frequency', value: p.escalationFrequency },
  ];
  if (p.escalationType === 'CPI') list.push({ label: 'CPI Index', value: p.cpiIndex });
  return list;
}

function fieldValue(f) {
  return '<dd>' + (f.value || '') + '</dd>';
}

function fieldList(fields) {
  return '<dl class="space-y-0.5">' + fields.map(function (f) {
    return '<div class="field"><dt>' + f.label + ':</dt>' + fieldValue(f) + '</div>';
  }).join('') + '</dl>';
}

/* The current term's own block, headed by which term it is and the dates it runs. */
function termBlock(c) {
  var current = currentTerm(c);
  var heading = '<p class="mt-3 pt-3 border-t border-neutral-200 text-xs font-bold text-neutral-700 uppercase tracking-wide">Current Term';

  if (!current) {
    return heading + '</p><p class="text-xs text-neutral-500 mt-1">No term covers today\'s date.</p>';
  }

  return heading +
    ' <span class="font-normal normal-case tracking-normal text-neutral-500">' +
    current.label + ' · ' + current.range + '</span></p>' +
    '<div class="mt-1">' + fieldList(termFields(c, current)) + '</div>';
}

/* Gear button plus its drop-down. The menu is positioned relative to the header cell. */
function gearMenu(i) {
  return [
    '<div class="relative shrink-0">',
    '  <button type="button" data-gear="' + i + '" aria-haspopup="true" aria-expanded="false"',
    '    title="Charge options" aria-label="Charge options"',
    '    class="text-neutral-600 hover:text-neutral-900 transition-colors">' +
    window.APP.icon(window.APP.ICONS.gear, 'h-6 w-6') + '</button>',
    '  <div id="charge-menu-' + i + '" role="menu"',
    '    class="hidden absolute right-0 top-full mt-1 z-30 w-44 bg-white border border-neutral-300 shadow-lg py-1">',
    '    <button type="button" role="menuitem" data-charge-action="edit" data-index="' + i + '"',
    '      class="block w-full text-left px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-100 transition-colors">Edit Charge</button>',
    '    <button type="button" role="menuitem" data-charge-action="terms" data-index="' + i + '"',
    '      class="block w-full text-left px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-100 transition-colors">Edit Terms</button>',
    '    <button type="button" role="menuitem" data-charge-action="delete" data-index="' + i + '"',
    '      class="block w-full text-left px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-100 transition-colors">Delete Charge</button>',
    '  </div>',
    '</div>',
  ].join('\n');
}

function chargeCard(c, i) {
  return [
    '<article class="bg-white border border-neutral-300 shadow-sm flex flex-col">',
    '  <div class="bg-neutral-100 border-b border-neutral-300 px-4 pt-3 pb-2">',
    '    <div class="flex items-start justify-between gap-3">',
    '      <h3 class="text-xl sm:text-2xl font-normal text-neutral-700">' + c.type + '</h3>',
    gearMenu(i),
    '    </div>',
    '    <p class="text-xs text-amber-700 mt-1">' + c.subtitle + '</p>',
    '  </div>',
    '  <div class="p-4 flex-1">',
    '    <h4 class="text-lg text-sky-700 font-medium mb-2">' + c.name +
    (c.share ? ' <span class="text-neutral-700">- ' + c.share + '</span>' : '') + '</h4>',
    fieldList(chargeFields(c)),
    termBlock(c),
    c.badge
      ? '<p class="mt-3"><span class="inline-block bg-blue-800 text-white text-xs font-semibold px-2 py-1">' + c.badge + '</span></p>'
      : '',
    '  </div>',
    '  <div class="px-4 pb-5 text-center">',
    '    <button type="button" data-charge-action="edit" data-index="' + i + '"',
    '      class="inline-flex items-center gap-1.5 border border-neutral-400 bg-neutral-50 hover:bg-neutral-200 text-neutral-800 text-xs px-3 py-1.5 rounded-sm shadow-sm transition-colors">' +
    window.APP.icon(window.APP.ICONS.expand, 'h-3.5 w-3.5') + 'Details</button>',
    '  </div>',
    '</article>',
  ].join('\n');
}

function statusPill(status) {
  var tone = status === 'Active'
    ? 'bg-green-100 text-green-800 border-green-300'
    : 'bg-blue-100 text-blue-900 border-blue-300';
  return '<span class="inline-block border px-2 py-0.5 text-xs font-medium ' + tone + '">' + status + '</span>';
}

function chargeRows() {
  return CHARGES.map(function (c, i) {
    return [
      '<tr class="odd:bg-white even:bg-neutral-50 hover:bg-amber-50 transition-colors">',
      '  <td class="px-3 py-2 border-b border-neutral-200 whitespace-nowrap">' + c.type + '</td>',
      '  <td class="px-3 py-2 border-b border-neutral-200"><button type="button" data-charge-action="edit" data-index="' + i +
      '" class="hover:underline">' + c.name + '</button></td>',
      '  <td class="px-3 py-2 border-b border-neutral-200 text-right whitespace-nowrap tabular-nums">' + c.row.charge + '</td>',
      '  <td class="px-3 py-2 border-b border-neutral-200 whitespace-nowrap">' + c.row.frequency + '</td>',
      '  <td class="px-3 py-2 border-b border-neutral-200 whitespace-nowrap">' + c.row.start + '</td>',
      '  <td class="px-3 py-2 border-b border-neutral-200 whitespace-nowrap">' + c.row.escalation + '</td>',
      '  <td class="px-3 py-2 border-b border-neutral-200 whitespace-nowrap">' + statusPill(c.row.status) + '</td>',
      '  <td class="px-3 py-2 border-b border-neutral-200 text-right whitespace-nowrap">',
      '    <button type="button" data-charge-action="edit" data-index="' + i + '" class="text-sky-700 hover:underline">Details</button>',
      '  </td>',
      '</tr>',
    ].join('\n');
  }).join('');
}

/* The table row summarises the charge's first term. */
function rowFor(c) {
  var p = c.termPeriods[0];
  var symbol = symbolOf(c);
  return {
    charge: money(symbol, p.initialAmount),
    frequency: p.billingFrequency,
    start: p.termsStartDate,
    escalation: escalationText(symbol, p),
    status: 'Active',
  };
}

/* Where a charge starts when it hangs off a lease milestone rather than its own date.
   The mockup has one lease, whose Commencement Date is on the Lease tab (pages.js). */
var LEASE_COMMENCEMENT = '2022/02/26';

/* The popup asks for the charge's dates and amount, not the first term's: the term
   starts where the charge starts and carries the initial charge as its amount. Filling
   those in here keeps the preview and the created charge reading from one set of values. */
function resolveForm(values) {
  var v = {};
  for (var key in values) { if (values.hasOwnProperty(key)) v[key] = values[key]; }

  v.startDate = v.startsOn === 'Other' ? v.startDate : LEASE_COMMENCEMENT;
  v.termsStartDate = v.startDate;
  v.initialAmount = v.initialCharge || '0.00';
  v.hasInitialAmount = 'Yes';
  return v;
}

/* Turns the New Charge popup's flat form values into a charge. The popup only asks
   for the first term, so the charge starts with exactly one term period. */
function chargeFromForm(values) {
  var v = resolveForm(values);

  /* "Renta Torre 100.00%" -> name and share; a pass-through has no share. */
  var parts = /^(.*?)\s+(\d+(?:\.\d+)?%)$/.exec(v.chargeType || '');
  var name = parts ? parts[1] : (v.chargeType || 'New Charge');
  var ground = /ground/i.test(name);

  var charge = {
    type: ground ? 'Ground Pass-through' : 'Rent Charge',
    subtitle: ground ? 'Ground Pass-through details' : 'Charge schedule summary',
    name: name,
    share: parts ? parts[2] : null,
    badge: null,
    terms: {
      chargeType: v.chargeType,
      startsOn: v.startsOn,
      startDate: v.startDate,
      hasEndDateOverride: v.hasEndDateOverride,
      endDateOverride: v.endDateOverride,
      currency: v.currency,
      initialCharge: v.initialCharge || '0.00',
    },
    termPeriods: [{
      termsStartDate: v.termsStartDate,
      hasCycleDate: v.hasCycleDate,
      cycleDate: v.cycleDate,
      hasInitialAmount: v.hasInitialAmount,
      initialAmount: v.initialAmount,
      billingFrequency: v.billingFrequency,
      escalationType: v.escalationType,
      escalationAmount: v.escalationAmount,
      escalatesWithCommencement: v.escalatesWithCommencement,
      escalationFrequency: v.escalationFrequency,
      escalationAnniversary: v.escalationAnniversary,
      cpiIndex: v.cpiIndex,
      cpiAdjustment: v.cpiAdjustment,
    }],
  };

  charge.row = rowFor(charge);
  return charge;
}

function closeAllMenus(except) {
  CHARGES.forEach(function (_, i) {
    var menu = document.getElementById('charge-menu-' + i);
    if (!menu || menu === except) return;
    menu.classList.add('hidden');
    var gear = document.querySelector('[data-gear="' + i + '"]');
    if (gear) gear.setAttribute('aria-expanded', 'false');
  });
}

function paintCharges() {
  document.getElementById('charge-cards').innerHTML = CHARGES.map(chargeCard).join('');
  document.getElementById('charge-rows').innerHTML = chargeRows();
  document.getElementById('charge-count').textContent =
    'Currently Displaying: ' + CHARGES.length +
    (CHARGES.length === 1 ? ' Tenant Charge.' : ' Tenant Charges.');
}

/* The New Charge popup hands its form values here once they are confirmed. */
window.CHARGE_LIST = {
  resolve: resolveForm,
  add: function (values) {
    CHARGES.push(chargeFromForm(values));
    paintCharges();
  },
};

window.onChromeReady = function () {
  paintCharges();

  document.getElementById('btn-add-charge').addEventListener('click', function () {
    window.NEW_CHARGE_MODAL.open();
  });

  var cards = document.getElementById('view-cards');
  var table = document.getElementById('view-table');
  var btnCards = document.getElementById('btn-view-cards');
  var btnTable = document.getElementById('btn-view-table');
  var on = 'bg-neutral-300 text-neutral-900';
  var off = 'bg-neutral-50 text-neutral-600';

  function setView(mode) {
    var isCards = mode === 'cards';
    cards.classList.toggle('hidden', !isCards);
    table.classList.toggle('hidden', isCards);
    btnCards.className = btnCards.dataset.base + ' ' + (isCards ? on : off);
    btnTable.className = btnTable.dataset.base + ' ' + (isCards ? off : on);
    btnCards.setAttribute('aria-pressed', String(isCards));
    btnTable.setAttribute('aria-pressed', String(!isCards));
    closeAllMenus();
  }

  btnCards.addEventListener('click', function () { setView('cards'); });
  btnTable.addEventListener('click', function () { setView('table'); });
  setView('cards');

  document.addEventListener('click', function (e) {
    var gear = e.target.closest('[data-gear]');
    if (gear) {
      var menu = document.getElementById('charge-menu-' + gear.dataset.gear);
      var willOpen = menu.classList.contains('hidden');
      closeAllMenus(menu);
      menu.classList.toggle('hidden', !willOpen);
      gear.setAttribute('aria-expanded', String(willOpen));
      return;
    }

    var action = e.target.closest('[data-charge-action]');
    if (action) {
      var charge = CHARGES[Number(action.dataset.index)];
      closeAllMenus();
      if (action.dataset.chargeAction === 'edit') {
        window.CHARGE_MODAL.open(charge);
      } else if (action.dataset.chargeAction === 'terms') {
        window.TERMS_MODAL.open(charge);
      } else if (window.confirm('Delete ' + charge.name + '? This cannot be undone.')) {
        CHARGES.splice(Number(action.dataset.index), 1);
        paintCharges();
      }
      return;
    }

    closeAllMenus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllMenus();
  });
};
