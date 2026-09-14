/* Shared chrome: top bar, lease banner, tab nav and footer.
   Each page sets window.PAGE = { tab: '<tab id>' } before loading this file. */

const TABS = [
  { id: 'details',       label: 'Details',                 href: 'index.html' },
  { id: 'amendments',    label: 'Amendments',              href: 'amendments.html' },
  { id: 'charges',       label: 'Charge Schedule',         href: 'charge-schedule.html' },
  { id: 'accounting',    label: 'Accounting',              href: 'accounting.html' },
  { id: 'contacts',      label: 'Contacts',                href: 'contacts.html' },
  { id: 'utilities',     label: 'Utilities',               href: 'utilities.html' },
  { id: 'flags',         label: 'Flags',                   href: 'flags.html' },
  { id: 'equipment',     label: 'Equipment',               href: 'equipment.html' },
  { id: 'clauses',       label: 'Legal Clauses',           href: 'legal-clauses.html' },
  { id: 'notifications', label: 'Notifications',           href: 'notifications.html' },
  { id: 'lease-edits',   label: 'Lease Edits',             href: 'lease-edits.html' },
  { id: 'cam',           label: 'Common Area Maintenance', href: 'cam.html' },
  { id: 'cam-edits',     label: 'CAM Edits',               href: 'cam-edits.html' },
];

const FOOTER_LINKS = [
  'Andy - Colombia', 'Tenant Lease Edit', 'Tenant Companies', 'Tenant Lease Billing',
  'Site Edit', 'Ground Rights Edit', 'Portfolio Edit',
];

const LEASE = {
  banner: 'Lease 2166 - Partners Telecom Colombia on Site CO-SAN-5131 - PÁRAMO W1',
  title: 'Tenant Lease Edit',
  tenant: 'Andy - Colombia',
};

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5 8.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  apps: '<circle cx="5" cy="5" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="19" cy="5" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="19" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
};

function icon(path, cls) {
  return '<svg class="' + (cls || 'h-5 w-5') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
}

function renderChrome() {
  var active = (window.PAGE && window.PAGE.tab) || 'details';
  var activeTab = TABS.filter(function (t) { return t.id === active; })[0] || TABS[0];

  document.getElementById('app-header').innerHTML = [
    '<header>',
    '  <div class="bg-neutral-800 text-white">',
    '    <div class="flex items-stretch h-12 sm:h-14">',
    '      <button type="button" title="Applications"',
    '        class="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 transition-colors px-3 sm:px-4 shrink-0">',
    '        ' + icon(ICONS.apps, 'h-5 w-5 sm:h-6 sm:w-6'),
    '        <span class="font-bold text-sm sm:text-base whitespace-nowrap hidden sm:inline">' + LEASE.tenant + '</span>',
    '      </button>',
    '      <div class="flex items-center px-3 sm:px-5 min-w-0">',
    '        <span class="font-bold text-base sm:text-xl truncate">' + LEASE.title + '</span>',
    '      </div>',
    '      <div class="ml-auto flex items-center gap-1 sm:gap-3 pr-2 sm:pr-4">',
    '        <form class="hidden md:flex items-stretch" onsubmit="return false;">',
    '          <label for="global-search" class="sr-only">Search</label>',
    '          <input id="global-search" type="search" placeholder="Search"',
    '            class="w-48 lg:w-72 xl:w-96 px-3 py-1.5 text-sm text-neutral-900 bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500" />',
    '          <button type="submit" title="Search"',
    '            class="px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 border border-l-0 border-neutral-300 transition-colors">',
    '            ' + icon(ICONS.search, 'h-4 w-4') + '</button>',
    '        </form>',
    '        <button type="button" title="Search" data-toggle="mobile-search"',
    '          class="md:hidden p-2 hover:bg-neutral-700 rounded transition-colors">' + icon(ICONS.search) + '</button>',
    '        <button type="button" title="Account"',
    '          class="p-1.5 hover:bg-neutral-700 rounded-full transition-colors">' + icon(ICONS.user, 'h-6 w-6') + '</button>',
    '      </div>',
    '    </div>',
    '    <div id="mobile-search" class="hidden md:hidden px-3 pb-3">',
    '      <input type="search" placeholder="Search" aria-label="Search"',
    '        class="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500" />',
    '    </div>',
    '  </div>',
    '  <div class="bg-red-700 text-white px-3 sm:px-6 py-2.5">',
    '    <h1 class="font-semibold text-sm sm:text-lg leading-snug">' + LEASE.banner + '</h1>',
    '  </div>',
    '  <nav aria-label="Lease sections" class="bg-neutral-100 border-b border-neutral-300">',
    '    <div class="flex items-center lg:hidden">',
    '      <button type="button" data-toggle="tab-list" aria-expanded="false" aria-controls="tab-list"',
    '        class="flex items-center gap-2 px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors">',
    '        ' + icon(ICONS.menu, 'h-5 w-5') + '<span>Sections</span></button>',
    '      <span class="ml-auto pr-3 text-sm font-semibold text-neutral-900">' + activeTab.label + '</span>',
    '    </div>',
    '    <ul id="tab-list" class="hidden lg:flex flex-col lg:flex-row lg:items-end lg:px-2 lg:overflow-x-auto border-t border-neutral-300 lg:border-t-0">',
    TABS.map(function (t) {
      var on = t.id === active;
      var cls = on
        ? 'bg-white text-neutral-900 font-semibold border-l-4 border-red-700 lg:border-l-0 lg:border lg:border-neutral-300 lg:border-b-white lg:-mb-px lg:rounded-t'
        : 'text-neutral-700 border-l-4 border-transparent lg:border-l-0 hover:bg-neutral-200 hover:text-neutral-900';
      return '<li class="shrink-0"><a href="' + t.href + '"' + (on ? ' aria-current="page"' : '') +
        ' class="block px-3 xl:px-4 py-2.5 text-sm whitespace-nowrap transition-colors ' + cls + '">' + t.label + '</a></li>';
    }).join(''),
    '    </ul>',
    '  </nav>',
    '</header>',
  ].join('\n');

  document.getElementById('app-footer').innerHTML = [
    '<footer class="mt-8 sm:mt-12 bg-neutral-100 border-t border-neutral-300 px-4 py-5 text-center">',
    '  <ul class="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm">',
    FOOTER_LINKS.map(function (l, i) {
      return '<li class="flex items-center gap-3"><a href="#" class="text-sky-700 hover:underline">' + l + '</a>' +
        (i < FOOTER_LINKS.length - 1 ? '<span class="text-neutral-400" aria-hidden="true">|</span>' : '') + '</li>';
    }).join(''),
    '  </ul>',
    '  <p class="mt-2 flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs text-neutral-600">',
    '    <span class="flex items-center gap-1">' + icon(ICONS.info, 'h-3.5 w-3.5') + ' Information &amp; Support</span>',
    '    <span class="text-neutral-400" aria-hidden="true">|</span><span>Server: WM1LDWK0001UD</span>',
    '    <span class="text-neutral-400" aria-hidden="true">|</span><span>Database: Stage-Andy-CO on dbs-slms-sql-eus3.database.windows.net</span>',
    '    <span class="text-neutral-400" aria-hidden="true">|</span><a href="#" class="text-sky-700 hover:underline">What&rsquo;s New</a>',
    '    <span class="text-neutral-400" aria-hidden="true">|</span><span>&copy; 2026 Digital Bridge Systems. All Rights Reserved.</span>',
    '  </p>',
    '</footer>',
  ].join('\n');
}

/* Generic show/hide: any [data-toggle="<target id>"] flips .hidden on that element. */
function wireToggles() {
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-toggle]');
    if (!btn) return;
    var target = document.getElementById(btn.dataset.toggle);
    if (!target) return;
    var nowHidden = target.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!nowHidden));
  });
}

document.addEventListener('DOMContentLoaded', function () {
  renderChrome();
  wireToggles();
  if (typeof window.onChromeReady === 'function') window.onChromeReady();
});

window.APP = { icon: icon, ICONS: ICONS, TABS: TABS };
