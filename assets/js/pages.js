/* Declarative content for every tab except Charge Schedule (which has its own view toggle).
   A page is a list of sections; renderPage() turns them into markup. */

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var PILL_TONES = {
  green: 'bg-green-100 text-green-800 border-green-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  amber: 'bg-amber-100 text-amber-900 border-amber-300',
  blue: 'bg-blue-100 text-blue-900 border-blue-300',
  gray: 'bg-neutral-100 text-neutral-700 border-neutral-300',
};

function pill(text, tone) {
  return '<span class="inline-block border px-2 py-0.5 text-xs font-medium whitespace-nowrap ' +
    (PILL_TONES[tone] || PILL_TONES.gray) + '">' + esc(text) + '</span>';
}

/* A cell may be a plain string, or { pill, tone } / { link } / { strong } */
function cell(v) {
  if (v && typeof v === 'object') {
    if (v.pill) return pill(v.pill, v.tone);
    if (v.link) return esc(v.link);
    if (v.strong) return '<span class="font-semibold">' + esc(v.strong) + '</span>';
  }
  return esc(v);
}

function sectionShell(title, body, actions) {
  return [
    '<section class="bg-white border border-neutral-300 shadow-sm mb-5">',
    '  <div class="bg-neutral-100 border-b border-neutral-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">',
    '    <h2 class="text-base sm:text-lg font-semibold text-neutral-800">' + esc(title) + '</h2>',
    actions || '',
    '  </div>',
    body,
    '</section>',
  ].join('\n');
}

function addButton(label) {
  return '<button type="button" class="inline-flex items-center gap-1 border border-neutral-400 bg-white hover:bg-neutral-200 ' +
    'text-sm font-medium px-3 py-1 rounded-sm shadow-sm transition-colors">' +
    window.APP.icon(window.APP.ICONS.plus, 'h-4 w-4') + esc(label) + '</button>';
}

function renderFields(s) {
  var body = '<div class="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-2">' +
    s.items.map(function (f) {
      return '<div class="field border-b border-neutral-100 pb-1"><dt>' + esc(f.label) + ':</dt>' +
        '<dd class="' + (f.accent ? '' : 'plain') + '">' + esc(f.value) + '</dd></div>';
    }).join('') + '</div>';
  return sectionShell(s.title, '<dl class="contents">' + body + '</dl>', s.add ? addButton(s.add) : '');
}

function renderTable(s) {
  var head = s.columns.map(function (c, i) {
    var right = (s.align || [])[i] === 'right' ? ' text-right' : ' text-left';
    return '<th scope="col" class="px-3 py-2 font-semibold border-b border-neutral-300 whitespace-nowrap' + right + '">' + esc(c) + '</th>';
  }).join('');

  var rows = s.rows.length
    ? s.rows.map(function (r) {
        return '<tr class="odd:bg-white even:bg-neutral-50 hover:bg-amber-50 transition-colors">' +
          r.map(function (v, i) {
            var right = (s.align || [])[i] === 'right' ? ' text-right tabular-nums' : '';
            return '<td class="px-3 py-2 border-b border-neutral-200 align-top' + right + '">' + cell(v) + '</td>';
          }).join('') + '</tr>';
      }).join('')
    : '<tr><td colspan="' + s.columns.length + '" class="px-3 py-6 text-center text-neutral-500">No records found.</td></tr>';

  var body = '<div class="scroll-x"><table class="min-w-full text-sm">' +
    '<caption class="sr-only">' + esc(s.title) + '</caption>' +
    '<thead class="bg-neutral-50 text-neutral-800"><tr>' + head + '</tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<p class="px-3 py-2 text-xs text-neutral-600 border-t border-neutral-200">Currently Displaying: ' +
    s.rows.length + ' ' + esc(s.noun || 'records') + '.</p>';

  return sectionShell(s.title, body, s.add ? addButton(s.add) : '');
}

function renderTiles(s) {
  return '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">' +
    s.items.map(function (t) {
      return '<div class="bg-white border border-neutral-300 shadow-sm p-4">' +
        '<p class="text-xs uppercase tracking-wide text-neutral-500">' + esc(t.label) + '</p>' +
        '<p class="mt-1 text-xl sm:text-2xl font-semibold text-neutral-900 tabular-nums">' + esc(t.value) + '</p>' +
        (t.note ? '<p class="mt-1 text-xs text-neutral-600">' + esc(t.note) + '</p>' : '') +
        '</div>';
    }).join('') + '</div>';
}

function renderCards(s) {
  var body = '<div class="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">' +
    s.items.map(function (c) {
      return '<article class="border border-neutral-300">' +
        '<div class="bg-neutral-50 border-b border-neutral-300 px-3 py-2 flex items-start justify-between gap-2">' +
        '<h3 class="text-sky-700 font-medium">' + esc(c.name) + '</h3>' +
        (c.tag ? pill(c.tag, c.tone) : '') + '</div>' +
        '<dl class="p-3 space-y-0.5">' +
        c.fields.map(function (f) {
          return '<div class="field"><dt>' + esc(f.label) + ':</dt><dd class="plain">' + esc(f.value) + '</dd></div>';
        }).join('') + '</dl></article>';
    }).join('') + '</div>';
  return sectionShell(s.title, body, s.add ? addButton(s.add) : '');
}

function renderAccordion(s) {
  var body = '<div class="divide-y divide-neutral-200">' +
    s.items.map(function (it) {
      return '<details class="group">' +
        '<summary class="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors">' +
        '<span class="font-medium text-neutral-800">' + esc(it.title) + '</span>' +
        '<span class="flex items-center gap-2 shrink-0">' + (it.tag ? pill(it.tag, it.tone) : '') +
        '<span class="text-neutral-500 transition-transform group-open:rotate-90">&rsaquo;</span></span></summary>' +
        '<p class="px-4 pb-4 text-sm text-neutral-700 leading-relaxed">' + esc(it.body) + '</p></details>';
    }).join('') + '</div>';
  return sectionShell(s.title, body, s.add ? addButton(s.add) : '');
}

var RENDERERS = {
  fields: renderFields,
  table: renderTable,
  tiles: renderTiles,
  cards: renderCards,
  accordion: renderAccordion,
};

var PAGES = {
  details: [
    { kind: 'tiles', items: [
      { label: 'Lease Status', value: 'Active', note: 'Commenced 2022/02/26' },
      { label: 'Current Monthly Rent', value: 'US$ 891.46', note: 'Blended + Renta Torre' },
      { label: 'Term Remaining', value: '6 yr 4 mo', note: 'Expires 2032/02/25' },
      { label: 'Open Amendments', value: '2', note: '1 pending signature' },
    ] },
    { kind: 'fields', title: 'Lease Information', items: [
      { label: 'Lease ID', value: '2166', accent: true },
      { label: 'Lease Name', value: 'Partners Telecom Colombia' },
      { label: 'Lease Type', value: 'Tenant Lease' },
      { label: 'Status', value: 'Active', accent: true },
      { label: 'Portfolio', value: 'WOM' },
      { label: 'Business Unit', value: 'Andy - Colombia' },
      { label: 'Contract Number', value: 'CO-2166-TLC' },
      { label: 'Currency', value: 'COP$ / US$' },
      { label: 'Managed By', value: 'Bogotá Regional Office' },
    ] },
    { kind: 'fields', title: 'Site Information', items: [
      { label: 'Site ID', value: 'CO-SAN-5131', accent: true },
      { label: 'Site Name', value: 'PÁRAMO W1' },
      { label: 'Structure Type', value: 'Self-Support Tower' },
      { label: 'Height', value: '45 m' },
      { label: 'Address', value: 'Vereda El Páramo, Km 4' },
      { label: 'Municipality', value: 'Santander' },
      { label: 'Latitude', value: '6.984210' },
      { label: 'Longitude', value: '-73.021554' },
      { label: 'Ground Owner', value: 'Inversiones Andinas S.A.S.' },
    ] },
    { kind: 'fields', title: 'Term & Dates', items: [
      { label: 'Commencement Date', value: '2022/02/26' },
      { label: 'Expiration Date', value: '2032/02/25' },
      { label: 'Initial Term', value: '120 months' },
      { label: 'Renewal Terms', value: '2 x 60 months' },
      { label: 'Notice Period', value: '180 days' },
      { label: 'Auto Renew', value: 'Yes', accent: true },
      { label: 'Holdover Rate', value: '150.00%' },
      { label: 'Last Escalation', value: '2025/01/01' },
      { label: 'Next Escalation', value: '2026/01/01', accent: true },
    ] },
  ],

  amendments: [
    { kind: 'table', title: 'Amendments', add: 'Add Amendment', noun: 'Amendments',
      columns: ['Amendment', 'Type', 'Effective Date', 'Signed Date', 'Rent Impact', 'Status', 'Actions'],
      align: [null, null, null, null, 'right', null, 'right'],
      rows: [
        [{ link: 'AMD-001' }, 'Equipment Addition', '2023/03/01', '2023/02/14', 'US$ 120.00', { pill: 'Executed', tone: 'green' }, { link: 'Details' }],
        [{ link: 'AMD-002' }, 'Term Extension', '2024/07/01', '2024/06/20', 'US$ 0.00', { pill: 'Executed', tone: 'green' }, { link: 'Details' }],
        [{ link: 'AMD-003' }, 'Rent Escalation', '2025/01/01', '2024/12/05', 'US$ 45.30', { pill: 'Executed', tone: 'green' }, { link: 'Details' }],
        [{ link: 'AMD-004' }, 'Equipment Swap', '2026/01/15', '—', 'US$ 210.00', { pill: 'Pending Signature', tone: 'amber' }, { link: 'Details' }],
        [{ link: 'AMD-005' }, 'Space Expansion', '2026/04/01', '—', 'US$ 380.00', { pill: 'Draft', tone: 'blue' }, { link: 'Details' }],
      ] },
  ],

  accounting: [
    { kind: 'tiles', items: [
      { label: 'Billed YTD', value: 'US$ 8,022.14' },
      { label: 'Collected YTD', value: 'US$ 7,130.68' },
      { label: 'Outstanding', value: 'US$ 891.46', note: '1 open invoice' },
      { label: 'Past Due > 30d', value: 'US$ 0.00' },
    ] },
    { kind: 'table', title: 'Invoices', noun: 'Invoices',
      columns: ['Invoice', 'Period', 'Issue Date', 'Due Date', 'Amount', 'Balance', 'Status'],
      align: [null, null, null, null, 'right', 'right', null],
      rows: [
        [{ link: 'INV-202604' }, '2026/04', '2026/04/01', '2026/04/30', 'US$ 891.46', 'US$ 891.46', { pill: 'Open', tone: 'amber' }],
        [{ link: 'INV-202603' }, '2026/03', '2026/03/01', '2026/03/31', 'US$ 891.46', 'US$ 0.00', { pill: 'Paid', tone: 'green' }],
        [{ link: 'INV-202602' }, '2026/02', '2026/02/01', '2026/02/28', 'US$ 891.46', 'US$ 0.00', { pill: 'Paid', tone: 'green' }],
        [{ link: 'INV-202601' }, '2026/01', '2026/01/01', '2026/01/31', 'US$ 891.46', 'US$ 0.00', { pill: 'Paid', tone: 'green' }],
      ] },
    { kind: 'fields', title: 'Billing Setup', items: [
      { label: 'Payment Frequency', value: 'Monthly' },
      { label: 'Payment Timing', value: 'In Advance' },
      { label: 'Due Day', value: '1st of month' },
      { label: 'Remit Currency', value: 'US$' },
      { label: 'Tax Treatment', value: 'IVA 19%' },
      { label: 'PO Required', value: 'No' },
    ] },
  ],

  contacts: [
    { kind: 'cards', title: 'Lease Contacts', add: 'Add Contact', items: [
      { name: 'María Fernanda Ríos', tag: 'Primary', tone: 'green', fields: [
        { label: 'Role', value: 'Lease Administrator' }, { label: 'Company', value: 'Partners Telecom Colombia' },
        { label: 'Email', value: 'm.rios@example.com' }, { label: 'Phone', value: '+57 601 555 0142' },
      ] },
      { name: 'Julián Castaño', tag: 'Billing', tone: 'blue', fields: [
        { label: 'Role', value: 'Accounts Payable' }, { label: 'Company', value: 'Partners Telecom Colombia' },
        { label: 'Email', value: 'j.castano@example.com' }, { label: 'Phone', value: '+57 601 555 0187' },
      ] },
      { name: 'Andrea Gómez', tag: 'Notices', tone: 'amber', fields: [
        { label: 'Role', value: 'Legal Counsel' }, { label: 'Company', value: 'Andy - Colombia' },
        { label: 'Email', value: 'a.gomez@example.com' }, { label: 'Phone', value: '+57 601 555 0110' },
      ] },
      { name: 'Inversiones Andinas S.A.S.', tag: 'Ground Owner', tone: 'gray', fields: [
        { label: 'Role', value: 'Landlord' }, { label: 'Contact', value: 'Carlos Peña' },
        { label: 'Email', value: 'c.pena@example.com' }, { label: 'Phone', value: '+57 607 555 0233' },
      ] },
    ] },
  ],

  utilities: [
    { kind: 'table', title: 'Utility Accounts', add: 'Add Account', noun: 'Utility Accounts',
      columns: ['Provider', 'Service', 'Account Number', 'Meter', 'Billing', 'Avg. Monthly', 'Status'],
      align: [null, null, null, null, null, 'right', null],
      rows: [
        ['Essa ESP', 'Electricity', '9004-118-772', 'MTR-55120', 'Direct', 'COP$ 1,240,000', { pill: 'Active', tone: 'green' }],
        ['Essa ESP', 'Electricity (backup)', '9004-118-773', 'MTR-55121', 'Reimbursed', 'COP$ 310,000', { pill: 'Active', tone: 'green' }],
        ['Claro Fibra', 'Backhaul', 'CF-77-40218', '—', 'Direct', 'COP$ 480,000', { pill: 'Active', tone: 'green' }],
        ['Gases del Oriente', 'Generator Fuel', 'GO-2210-05', '—', 'Reimbursed', 'COP$ 165,000', { pill: 'Suspended', tone: 'red' }],
      ] },
    { kind: 'fields', title: 'Reimbursement Terms', items: [
      { label: 'Reimbursement Type', value: 'Actual Cost' },
      { label: 'Admin Fee', value: '5.00%' },
      { label: 'Billing Lag', value: '30 days' },
      { label: 'Cap', value: 'None' },
      { label: 'Proration Method', value: 'By equipment load' },
      { label: 'Supporting Docs Required', value: 'Yes' },
    ] },
  ],

  flags: [
    { kind: 'table', title: 'Lease Flags', add: 'Add Flag', noun: 'Flags',
      columns: ['Flag', 'Category', 'Set By', 'Set On', 'Expires', 'Status'],
      rows: [
        [{ strong: 'Irregular Escalation Schedule' }, 'Financial', 'system', '2022/02/26', '—', { pill: 'Active', tone: 'amber' }],
        [{ strong: 'Ground Pass-Through Enabled' }, 'Financial', 'j.castano', '2022/02/26', '—', { pill: 'Active', tone: 'green' }],
        [{ strong: 'Structural Analysis Required' }, 'Compliance', 'a.gomez', '2025/11/02', '2026/12/31', { pill: 'Active', tone: 'red' }],
        [{ strong: 'Do Not Auto-Invoice' }, 'Billing', 'm.rios', '2024/03/18', '2025/03/18', { pill: 'Expired', tone: 'gray' }],
      ] },
  ],

  equipment: [
    { kind: 'table', title: 'Installed Equipment', add: 'Add Equipment', noun: 'Equipment Items',
      columns: ['Type', 'Model', 'Qty', 'Mount Height', 'Azimuth', 'Weight (kg)', 'Status'],
      align: [null, null, 'right', 'right', 'right', 'right', null],
      rows: [
        ['Antenna', 'Kathrein 80010621', '3', '42 m', '0 / 120 / 240', '68.4', { pill: 'Installed', tone: 'green' }],
        ['Antenna', 'Commscope NHH-65C', '3', '38 m', '0 / 120 / 240', '52.1', { pill: 'Installed', tone: 'green' }],
        ['RRU', 'Huawei RRU5909', '6', '38 m', '—', '96.0', { pill: 'Installed', tone: 'green' }],
        ['Microwave Dish', 'Andrew VHLP2-11', '2', '30 m', '75 / 255', '22.8', { pill: 'Installed', tone: 'green' }],
        ['Cabinet', 'Huawei APM30H', '1', 'Ground', '—', '180.0', { pill: 'Pending', tone: 'amber' }],
      ] },
    { kind: 'fields', title: 'Loading Summary', items: [
      { label: 'Total Weight', value: '419.3 kg' },
      { label: 'Contracted Wind Load', value: '18.0 m²' },
      { label: 'Used Wind Load', value: '14.6 m²' },
      { label: 'Ground Space Leased', value: '24 m²' },
      { label: 'Ground Space Used', value: '19 m²' },
      { label: 'Last Structural Analysis', value: '2024/09/30' },
    ] },
  ],

  clauses: [
    { kind: 'accordion', title: 'Legal Clauses', add: 'Add Clause', items: [
      { title: '4.1 Rent Escalation', tag: 'Standard', tone: 'green',
        body: 'Base rent escalates annually on the anniversary of the commencement date by the greater of the published CPI for Colombia or 0.00%, applied to the then-current monthly rent. Placeholder text for mockup purposes.' },
      { title: '7.3 Assignment and Subletting', tag: 'Negotiated', tone: 'amber',
        body: 'Tenant may assign this lease to an affiliate without landlord consent, provided written notice is delivered within thirty (30) days of the effective date. Placeholder text for mockup purposes.' },
      { title: '9.2 Termination for Convenience', tag: 'Negotiated', tone: 'amber',
        body: 'Tenant may terminate upon one hundred eighty (180) days written notice and payment of a termination fee equal to six (6) months of then-current rent. Placeholder text for mockup purposes.' },
      { title: '11.5 Ground Pass-Through', tag: 'Standard', tone: 'green',
        body: 'Tenant shall reimburse its proportionate share of ground rent as billed on ground terms, payable monthly in COP$ with no floor or ceiling applied. Placeholder text for mockup purposes.' },
      { title: '14.0 Indemnification', tag: 'Standard', tone: 'green',
        body: 'Each party indemnifies the other against third-party claims arising from its own negligence or willful misconduct at the site. Placeholder text for mockup purposes.' },
    ] },
  ],

  notifications: [
    { kind: 'table', title: 'Notification Rules', add: 'Add Notification', noun: 'Notification Rules',
      columns: ['Event', 'Lead Time', 'Recipients', 'Channel', 'Last Sent', 'Status'],
      rows: [
        ['Rent Escalation Due', '60 days', 'm.rios, j.castano', 'Email', '2025/11/02', { pill: 'Enabled', tone: 'green' }],
        ['Lease Expiration', '180 days', 'a.gomez', 'Email + Portal', '—', { pill: 'Enabled', tone: 'green' }],
        ['Invoice Past Due', '5 days', 'j.castano', 'Email', '2026/03/06', { pill: 'Enabled', tone: 'green' }],
        ['Structural Analysis Expiry', '90 days', 'Site Ops', 'Portal', '2026/01/12', { pill: 'Enabled', tone: 'green' }],
        ['Amendment Pending Signature', '14 days', 'm.rios', 'Email', '2026/02/01', { pill: 'Paused', tone: 'gray' }],
      ] },
  ],

  'lease-edits': [
    { kind: 'table', title: 'Lease Edit History', noun: 'Edits',
      columns: ['Date', 'User', 'Field', 'Previous Value', 'New Value', 'Source'],
      rows: [
        ['2026/03/14 09:22', 'm.rios', 'Renta Torre - Current Charge', 'US$ 862.10', 'US$ 891.46', 'Manual'],
        ['2026/01/02 00:05', 'system', 'Next Escalation Date', '2025/01/01', '2026/01/01', 'Batch Job'],
        ['2025/11/02 16:48', 'a.gomez', 'Flag: Structural Analysis Required', '—', 'Active', 'Manual'],
        ['2025/06/19 11:07', 'j.castano', 'Payment Frequency', 'Quarterly', 'Monthly', 'Manual'],
        ['2024/12/05 14:31', 'm.rios', 'Amendment AMD-003 Status', 'Pending', 'Executed', 'Workflow'],
      ] },
  ],

  cam: [
    { kind: 'tiles', items: [
      { label: 'CAM Budget 2026', value: 'COP$ 42.6M' },
      { label: 'Billed to Date', value: 'COP$ 10.4M' },
      { label: 'Tenant Share', value: '33.33%' },
      { label: 'Reconciliation', value: 'Due 2027/03' },
    ] },
    { kind: 'fields', title: 'CAM Terms', items: [
      { label: 'CAM Type', value: 'Pro-rata Share' },
      { label: 'Allocation Basis', value: 'Equipment count' },
      { label: 'Tenant Share', value: '33.33%', accent: true },
      { label: 'Billing Frequency', value: 'Monthly Estimate' },
      { label: 'Annual Cap', value: '5.00% increase' },
      { label: 'Reconciliation Period', value: 'Calendar Year' },
      { label: 'Admin Fee', value: '3.00%' },
      { label: 'Base Year', value: '2022' },
      { label: 'Gross-Up', value: '95.00%' },
    ] },
    { kind: 'table', title: 'CAM Expense Pools', noun: 'Expense Pools',
      columns: ['Pool', 'Annual Budget', 'Tenant Share', 'Billed YTD', 'Status'],
      align: [null, 'right', 'right', 'right', null],
      rows: [
        ['Site Security', 'COP$ 14,400,000', 'COP$ 4,799,520', 'COP$ 3,599,640', { pill: 'On Budget', tone: 'green' }],
        ['Access Road Maintenance', 'COP$ 9,600,000', 'COP$ 3,199,680', 'COP$ 2,933,040', { pill: 'On Budget', tone: 'green' }],
        ['Generator Service', 'COP$ 12,000,000', 'COP$ 3,999,600', 'COP$ 4,266,240', { pill: 'Over Budget', tone: 'red' }],
        ['Grounds & Fencing', 'COP$ 6,600,000', 'COP$ 2,199,780', 'COP$ 1,466,520', { pill: 'On Budget', tone: 'green' }],
      ] },
  ],

  'cam-edits': [
    { kind: 'table', title: 'CAM Edit History', noun: 'Edits',
      columns: ['Date', 'User', 'Pool / Field', 'Previous Value', 'New Value', 'Source'],
      rows: [
        ['2026/02/28 10:14', 'j.castano', 'Generator Service - Budget', 'COP$ 10,800,000', 'COP$ 12,000,000', 'Manual'],
        ['2026/01/08 08:00', 'system', 'Tenant Share', '31.25%', '33.33%', 'Recalculation'],
        ['2025/12/20 15:52', 'm.rios', 'Admin Fee', '2.50%', '3.00%', 'Manual'],
        ['2025/09/03 13:09', 'a.gomez', 'Annual Cap', 'None', '5.00% increase', 'Amendment AMD-002'],
      ] },
  ],
};

window.onChromeReady = function () {
  var sections = PAGES[window.PAGE.tab] || [];
  document.getElementById('page-content').innerHTML = sections.map(function (s) {
    var fn = RENDERERS[s.kind];
    return fn ? fn(s) : '';
  }).join('\n');
};
