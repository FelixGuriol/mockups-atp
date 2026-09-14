# Tenant Lease Edit - Mockup

Static HTML mockup of the Tenant Lease Edit screen (Lease 2166 / Site CO-SAN-5131).
Tailwind via CDN, no build step, all data is placeholder.

## Run

Serve the folder - popup markup is fetched from `partials/`, and `fetch` is blocked
on `file://` URLs, so opening the HTML by double-click will not show popups:

    python -m http.server 8000

Then browse to http://localhost:8000

## Structure

    index.html              Details tab (landing page)
    charge-schedule.html    Charge Schedule tab - card/table view toggle
    amendments.html         Amendments
    accounting.html         Accounting
    contacts.html           Contacts
    utilities.html          Utilities
    flags.html              Flags
    equipment.html          Equipment
    legal-clauses.html      Legal Clauses
    notifications.html      Notifications
    lease-edits.html        Lease Edits
    cam.html                Common Area Maintenance
    cam-edits.html          CAM Edits

    assets/css/styles.css   Label/value pairs, scroll helpers, focus rings
    assets/js/app.js        Shared chrome: top bar, lease banner, tab nav, footer
    assets/js/pages.js      Placeholder content + section renderers for 12 tabs
    assets/js/charges.js    Charge Schedule data, cards, table, view toggle, gear menu
    assets/js/new-charge-modal.js New Charge popup, opened by the Add button
    assets/js/charge-modal.js  Edit Charge popup: charge level fields + grace periods
    assets/js/terms-modal.js   Edit Terms popup: one dropdown per term period
    assets/js/add-term-modal.js Add New Term popup, opened from inside Edit Terms
    assets/js/rebuild-modal.js Rebuild Schedule preview popup
    assets/js/schedule-preview.js Escalations/Schedule preview tables, shared by both
    assets/js/conditions.js Shared show/hide rules and form reading for both popups
    assets/js/partials.js   Fetches partials/*.html once, clones per open

    partials/new-charge.html   New Charge popup markup (charge + first term)
    partials/edit-charge.html  Edit Charge popup markup (Charge + Grace Periods tabs)
    partials/edit-terms.html   Edit Terms popup markup (the term period dropdowns)
    partials/add-term.html     Add New Term popup markup
    partials/rebuild-schedule.html  Rebuild Schedule popup shell
    partials/schedule-preview.html  The two preview tables, mounted into either popup

## Charge cards

A card shows two groups, both derived from the charge data rather than stored as display
text, so a card and the popups can never disagree:

- **the charge** - initial charge, Starts on and End Date Override, matching Edit Charge.
- **the current term** - the term period that covers today's date, headed by which term
  it is and the dates it runs, matching that period's dropdown in Edit Terms.

The current term is the latest period that has already started; the last one runs to the
End Date Override, or open ended without one. A charge that has not started yet, or whose
override has passed, shows "No term covers today's date." instead.

## New Charge popup

The **Add** button above the cards opens `partials/new-charge.html`: the charge's own
fields, then the first term it starts with, using the same `data-field` names as the two
edit popups so the values map straight onto a charge.

The first term is not asked for twice - it starts where the charge starts and carries the
initial charge as its amount, which `CHARGE_LIST.resolve()` fills in. A charge starting on
"Other" needs a date of its own; off a lease milestone it takes the lease's Commencement
Date. Save validates that date, previews the escalations and billing rows the first term
would create - built from what was entered, not from placeholder rows - and then asks for
a change reason. Confirming hands the same resolved values to `CHARGE_LIST.add()`, which
builds the charge and repaints the cards.

Charge Type carries the name and share together ("Renta Torre 100.00%"); a type with no
percentage, like Ground Pass-Thru, makes a pass-through card instead of a rent charge.

## How pages are wired

Every page sets `window.PAGE = { tab: '<id>' }`, then `app.js` renders the shared
header/footer and marks that tab active. Tabs are plain links between the files.

To add a tab: add an entry to `TABS` in `assets/js/app.js`, add a matching key in
`PAGES` in `assets/js/pages.js`, and copy any existing page file.

Section kinds available in `PAGES`: `tiles`, `fields`, `table`, `cards`, `accordion`.

## Edit Charge and Edit Terms modals

The gear on each charge card opens a menu with **Edit Charge**, **Edit Terms** and
**Delete Charge**. The two edit popups are separate files and separate modules, and only
one of them is ever open - they are siblings at z-40, not stacked.

**Edit Charge** (`partials/edit-charge.html`, also reached from the card's Details button
and the description/Details links in table view) holds everything that belongs to the
charge as a whole, in two sub-tabs:

- **Charge** - charge type, initial charge, Starts On / Start Date and End Date Override,
  plus Save / Cancel.
- **Grace Periods** - a table of FromDate / EndDate rows with per-row delete and edit
  buttons, an "Add New Grace Period" button, and its own Save / Cancel.

**Edit Terms** (`partials/edit-terms.html`) holds the term periods only: "Add New Term",
one collapsible dropdown per period, and Cancel. It has no sub-tabs: each period is
saved from its own "Rebuild Schedule" button, so there is no popup-wide Save.

Both close on the X, Cancel, backdrop click or Escape. Delete Charge asks for confirmation
and removes the card from the mockup.

### How the popup is built

The markup is a plain HTML file, `partials/edit-charge.html`. `loadPartial('edit-charge')`
fetches it once, parses it into a `<template>` and caches it; every open clones that
template, so the file is read from the network a single time (it is also pre-warmed on
page load). `charge-modal.js` then only fills values and wires behaviour through
`data-*` hooks in the partial:

    [data-field="startDate"]     input or select to populate from charge.terms
    [data-panel="schedule"]      a sub-tab panel, toggled with the hidden attribute
    [data-subtab="schedule"]     the button that shows that panel
    [data-row="schedule"]        <template> cloned once per escalation row
    [data-cell="amount"]         a cell inside that row template
    [data-empty="schedule"]      empty-state row, hidden when rows exist
    [data-modal-close]           any control that closes the popup
    [data-yesno="Yes"]           segmented No/Yes toggle
    [data-toggle-field="..."]    names a No/Yes group so conditions can read it
    [data-when-field="startsOn"] show this element only for certain values of that
    [data-when-value="A|B"]      the value(s) that reveal it, separated by "|"

The Edit Terms popup lists one collapsible dropdown per term period, cloned from a
`<template data-row="terms">`. Each summary shows its date range, where the end date is
the next period's start date minus a day (the last period runs to the End Date Override,
or "Open ended"). Because every clone repeats the same hooks, each is wrapped in
`[data-scope]` so a condition reads the field from its own period.

"Add New Term" opens a second popup (`partials/add-term.html`, z-50 above Edit Terms).
Saving hands the values to `TERMS_MODAL.addTermPeriod()`, which inserts the period in
date order and redraws the dropdowns, so the ranges recalculate around it. Escape closes
whichever popup is on top.

"Add New Term" runs in two steps: step 1 is the term configuration, step 2 previews the
escalations and billing schedule that configuration would create. Next validates the start
date and builds the preview from what was entered - billing frequency sets the schedule
interval, escalation frequency sets the escalation cycles, and month-ends are clamped
(31 Jan + 1 month is 28 Feb). Back returns to the form; Save adds the term and closes.
Amounts in the preview stay placeholder values, since the form has no charge amount.

### The preview tables

`partials/schedule-preview.html` holds both tables - Escalations above, Schedule below -
on the one page, and every popup that previews a change mounts it. Each row carries a
**State**: `New`, `Modified`, `Unmodified` or `Remove`, rendered as a coloured badge from
the row data (`state` on the row; anything unset reads as Unmodified). Rows generated from
an entered term configuration are all New; the fixed sample rows carry a spread of states,
and a grace period marks the rows it suspends as Modified.

Every row is drawn the same way, so the badge carries the meaning on its own. The one
exception is a row being removed: it takes a faded red tint, quieter than the rows that
stay, since it is on its way out.

Each table carries its own pair of switches and its own year pages:

    Show older rows     on by default; off, the Remove rows go and only what the save
                        keeps is left
    All terms           also shows rows of a different term (`otherTerm` on the row)

The two work together: the year buttons list only the years the filters leave behind, and
the current page snaps to a surviving year rather than going blank. When a filter leaves
nothing, the pager disappears and an empty note takes its place.

In the preview's Schedule table a prorated row shows a ticked Prorated box, and hovering
(or focusing) that cell opens a popover listing the escalation slices that fall inside the
billing period, with their own dates and amounts. The slicing is generic: a period covered
by two escalations lists both parts.

"Rebuild Schedule" opens a third popup (z-60, above the other two) showing what the
rebuild would create for that term. It mounts the same `schedule-preview` partial as step 2
above, but with fixed placeholder rows (`SCHEDULE_PREVIEW.SAMPLE`) rather than generated
ones. Save opens the confirmation popup; confirming closes both. The button appears once per
term period and passes that period's date range into the popup title.

`mount(host, rows, options)` takes `options.only` to render just one of the two tables -
Grace Periods' preview uses it to show the schedule alone.

Popup stacking: New Charge / Edit Charge / Edit Terms (z-40, never more than one),
Add New Term (z-50),
Rebuild Schedule (z-60), Confirm Changes (z-70). Escape always closes the topmost one -
each popup stands down while a higher one is open.

Save on Edit Charge goes through two steps: a preview popup titled "Save Charge" and
then the Change Reason confirmation. Confirming closes the preview and the popup
underneath it. Grace Periods' own Save works the same way.

Current conditional rules: Start Date shows when Starts On is "Other", Escalation
Amount shows for Fixed or Percentage, and Escalation Anniversary shows when Escalates
With Lease Commencement is Yes.

Both panels of Edit Charge exist in the DOM at once, so switching sub-tabs keeps
whatever was typed. Control styling (`.f-input`, `.btn`, `.seg`, `.modal-th`) lives in
`assets/css/styles.css` so the partial stays readable and the JS never builds class
strings. Active states are pure CSS off `aria-pressed`.

To add another popup: drop `partials/<name>.html` next to it and call
`loadPartial('<name>')`. If the partial cannot be fetched, the popup shows an inline
message explaining that the folder needs to be served over HTTP.

## Responsive behaviour

- Tab bar collapses behind a "Sections" button below `lg`; the active tab name stays visible.
- Search collapses to an icon below `md`.
- Cards go 3 -> 2 -> 1 column; every table scrolls horizontally inside its own container.
- The modal fills small screens, its form drops to one column, and its tables scroll.
