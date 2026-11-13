/* Restock — recurring purchases, reminders and monthly expenses.
 * Everything is stored on this device (localStorage). Use Settings → Backup to move data. */
'use strict';

// ---------- Storage ----------
const STORE_KEY = 'restock.v1';
const DEFAULT_SETTINGS = {
  currency: '', budget: 0, remindDays: 1, notifications: false,
  theme: 'auto', lastNotifiedDate: '', monthStartDay: 1,
};
const CATEGORIES = [
  ['Groceries', '🥦'], ['Dairy & Eggs', '🥛'], ['Meat & Fish', '🍗'], ['Bakery', '🍞'],
  ['Household', '🧽'], ['Personal care', '🧴'], ['Baby & Kids', '🍼'], ['Health', '💊'],
  ['Utilities & Bills', '💡'], ['Fuel & Transport', '⛽'], ['Pets', '🐾'], ['Subscriptions', '📺'], ['Other', '📦'],
];
const CAT_EMOJI = Object.fromEntries(CATEGORIES);

const SUGGESTIONS = [
  { name: 'Milk', category: 'Dairy & Eggs', freqN: 2, freqUnit: 'day' },
  { name: 'Bread', category: 'Bakery', freqN: 2, freqUnit: 'day' },
  { name: 'Eggs', category: 'Dairy & Eggs', freqN: 1, freqUnit: 'week' },
  { name: 'Vegetables', category: 'Groceries', freqN: 1, freqUnit: 'week' },
  { name: 'Fruits', category: 'Groceries', freqN: 1, freqUnit: 'week' },
  { name: 'Rice', category: 'Groceries', freqN: 1, freqUnit: 'month' },
  { name: 'Cooking oil', category: 'Groceries', freqN: 1, freqUnit: 'month' },
  { name: 'Sugar', category: 'Groceries', freqN: 1, freqUnit: 'month' },
  { name: 'Tea / Coffee', category: 'Groceries', freqN: 1, freqUnit: 'month' },
  { name: 'Dish soap', category: 'Household', freqN: 1, freqUnit: 'month' },
  { name: 'Laundry detergent', category: 'Household', freqN: 1, freqUnit: 'month' },
  { name: 'Toilet paper', category: 'Household', freqN: 2, freqUnit: 'week' },
  { name: 'Toothpaste', category: 'Personal care', freqN: 2, freqUnit: 'month' },
  { name: 'Shampoo', category: 'Personal care', freqN: 2, freqUnit: 'month' },
  { name: 'Gas cylinder', category: 'Utilities & Bills', freqN: 2, freqUnit: 'month' },
  { name: 'Electricity bill', category: 'Utilities & Bills', freqN: 1, freqUnit: 'month' },
  { name: 'Water bill', category: 'Utilities & Bills', freqN: 1, freqUnit: 'month' },
  { name: 'Internet', category: 'Utilities & Bills', freqN: 1, freqUnit: 'month' },
  { name: 'Mobile reload', category: 'Utilities & Bills', freqN: 1, freqUnit: 'month' },
  { name: 'Fuel', category: 'Fuel & Transport', freqN: 1, freqUnit: 'week' },
  { name: 'Diapers', category: 'Baby & Kids', freqN: 1, freqUnit: 'week' },
];

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { items: s.items || [], purchases: s.purchases || [], settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) } };
    }
  } catch (e) { console.warn('Could not load data', e); }
  return { items: [], purchases: [], settings: { ...DEFAULT_SETTINGS } };
}
let state = load();
let undoSnapshot = null;

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('⚠️ Could not save — storage may be full or blocked'); }
}
function snapshot() { undoSnapshot = JSON.stringify(state); }
function undo() {
  if (!undoSnapshot) return;
  const s = JSON.parse(undoSnapshot); undoSnapshot = null;
  state = s; save(); render(); toast('Undone');
}

// ---------- Helpers ----------
const $ = (sel, el = document) => el.querySelector(sel);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function iso(d) { // local date → YYYY-MM-DD
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function today() { return iso(new Date()); }
function addInterval(dateStr, n, unit) {
  const d = parseISO(dateStr);
  if (unit === 'day') d.setDate(d.getDate() + n);
  else if (unit === 'week') d.setDate(d.getDate() + 7 * n);
  else if (unit === 'month') {
    const day = d.getDate();
    d.setDate(1); d.setMonth(d.getMonth() + n);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
  }
  return iso(d);
}
function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
function periodDays(item) { return item.freqUnit === 'day' ? item.freqN : item.freqUnit === 'week' ? 7 * item.freqN : 30.44 * item.freqN; }
function itemCost(item) { return (Number(item.price) || 0) * (Number(item.qty) || 1); }
function monthlyCost(item) { return itemCost(item) * (30.44 / periodDays(item)); }

function money(n) {
  const cur = state.settings.currency || '';
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const s = v.toLocaleString(undefined, { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return cur ? `${cur} ${s}` : s;
}
function freqLabel(item) {
  const { freqN: n, freqUnit: u } = item;
  if (n === 1) return { day: 'Daily', week: 'Weekly', month: 'Monthly' }[u];
  if (n === 2 && u === 'week') return 'Every 2 weeks';
  return `Every ${n} ${u}s`;
}
function dueInfo(item) {
  const d = daysBetween(today(), item.nextDue);
  if (d < 0) return { cls: 'overdue', text: `${-d} day${d === -1 ? '' : 's'} overdue`, d };
  if (d === 0) return { cls: 'today', text: 'Due today', d };
  if (d === 1) return { cls: 'soon', text: 'Tomorrow', d };
  if (d <= 7) return { cls: 'soon', text: `In ${d} days`, d };
  return { cls: 'later', text: parseISO(item.nextDue).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), d };
}
function remindWindow(item) { return item.remindDays ?? state.settings.remindDays ?? 1; }
function needsAttention(item) { return item.active !== false && daysBetween(today(), item.nextDue) <= remindWindow(item); }
function emojiFor(item) { return item.emoji || CAT_EMOJI[item.category] || '📦'; }

function monthKey(dateStr) { return dateStr.slice(0, 7); }
function spentInMonth(key) { return state.purchases.filter((p) => monthKey(p.date) === key).reduce((a, p) => a + (Number(p.amount) || 0), 0); }
function activeItems() { return state.items.filter((i) => i.active !== false); }
function sortByDue(arr) { return [...arr].sort((a, b) => a.nextDue.localeCompare(b.nextDue) || a.name.localeCompare(b.name)); }

function toast(msg, withUndo = false) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${withUndo ? '<button type="button" id="undo-btn">UNDO</button>' : ''}`;
  t.classList.add('show');
  if (withUndo) $('#undo-btn').onclick = () => { undo(); t.classList.remove('show'); };
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), withUndo ? 5000 : 2500);
}

// ---------- Actions ----------
function markBought(id, { date = today(), amount, qty } = {}) {
  const item = state.items.find((i) => i.id === id); if (!item) return;
  snapshot();
  const amt = amount ?? itemCost(item);
  state.purchases.push({ id: uid(), itemId: item.id, name: item.name, category: item.category, date, amount: Number(amt) || 0, qty: qty ?? item.qty ?? 1 });
  if (amount != null && qty) { const unit = Number(amount) / Number(qty); if (unit > 0) item.price = Math.round(unit * 100) / 100; }
  item.lastBought = date;
  item.nextDue = addInterval(date, item.freqN, item.freqUnit);
  item.snoozedFrom = null;
  save();
}
function snooze(id, days) {
  const item = state.items.find((i) => i.id === id); if (!item) return;
  snapshot();
  const base = daysBetween(today(), item.nextDue) < 0 ? today() : item.nextDue;
  item.nextDue = iso(new Date(parseISO(base).getTime() + days * 86400000));
  save(); render(); toast(`${item.name} snoozed ${days} day${days > 1 ? 's' : ''}`, true);
}
function skip(id) {
  const item = state.items.find((i) => i.id === id); if (!item) return;
  snapshot();
  item.nextDue = addInterval(daysBetween(today(), item.nextDue) < 0 ? today() : item.nextDue, item.freqN, item.freqUnit);
  save(); render(); toast(`Skipped — next ${item.name}: ${dueInfo(item).text}`, true);
}

// ---------- Views ----------
let currentTab = 'home';
let ui = { itemFilter: 'All', itemSearch: '', shopChecked: new Set(), shopHorizon: 7, statsMonth: monthKey(today()) };

const TITLES = { home: 'Home', shop: 'Shopping list', items: 'My items', stats: 'Spending', settings: 'Settings' };

function render() {
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === currentTab));
  $('#page-title').textContent = TITLES[currentTab];
  const v = $('#view');
  v.innerHTML = ({ home: viewHome, shop: viewShop, items: viewItems, stats: viewStats, settings: viewSettings })[currentTab]();
  bindView(v);
  updateBadge();
}

function itemRow(item, { actions = true } = {}) {
  const di = dueInfo(item);
  return `<div class="row ${item.active === false ? 'paused' : ''}" data-id="${item.id}">
    <div class="emoji">${esc(emojiFor(item))}</div>
    <div class="main" data-act="edit">
      <div class="name">${esc(item.name)}${item.qty > 1 ? ` <span class="meta">×${esc(item.qty)}${item.unit ? ' ' + esc(item.unit) : ''}</span>` : ''}</div>
      <div class="meta">${item.active === false ? '<span class="pill later">Paused</span>' : `<span class="pill ${di.cls}">${di.text}</span>`} · ${freqLabel(item)}${itemCost(item) ? ' · ' + money(itemCost(item)) : ''}${item.store ? ' · ' + esc(item.store) : ''}</div>
    </div>
    ${actions && item.active !== false ? `<div class="actions">
      <button class="btn small" data-act="more" aria-label="More options for ${esc(item.name)}">⋯</button>
      <button class="btn small primary" data-act="bought">✓ Bought</button>
    </div>` : ''}
  </div>`;
}

function viewHome() {
  if (!state.items.length) return onboarding();
  const t = today(), mk = monthKey(t);
  const act = activeItems();
  const overdue = sortByDue(act.filter((i) => i.nextDue < t));
  const dueToday = sortByDue(act.filter((i) => i.nextDue === t));
  const week = sortByDue(act.filter((i) => { const d = daysBetween(t, i.nextDue); return d > 0 && d <= 7; }));
  const later = sortByDue(act.filter((i) => daysBetween(t, i.nextDue) > 7)).slice(0, 8);

  const spent = spentInMonth(mk);
  const planned = act.reduce((a, i) => a + monthlyCost(i), 0);
  const budget = Number(state.settings.budget) || 0;
  const now = new Date(); const monthEnd = iso(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const remaining = act.filter((i) => i.nextDue <= monthEnd).reduce((a, i) => {
    // count every occurrence until month end
    let n = 0, d = i.nextDue < t ? t : i.nextDue;
    while (d <= monthEnd && n < 400) { n++; d = addInterval(d, i.freqN, i.freqUnit); }
    return a + n * itemCost(i);
  }, 0);
  const forecast = spent + remaining;
  const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;

  const notifBanner = ('Notification' in window && Notification.permission === 'default' && !state.settings.notifDismissed)
    ? `<div class="banner"><span>🔔 Turn on reminders so the app can alert you about upcoming purchases.</span><span class="btn-row"><button class="btn small primary" data-act="enable-notif">Enable</button><button class="btn small" data-act="dismiss-notif">Later</button></span></div>` : '';

  const section = (title, arr, emptyMsg) => arr.length || emptyMsg ? `<h2>${title} <span class="count">${arr.length}</span></h2>
    <div class="list">${arr.length ? arr.map((i) => itemRow(i)).join('') : `<div class="empty">${emptyMsg}</div>`}</div>` : '';

  return `${notifBanner}
    <div class="kpis">
      <div class="kpi"><div class="label">Spent this month</div><div class="value">${money(spent)}</div><div class="sub">${budget ? `of ${money(budget)} budget` : 'no budget set'}</div></div>
      <div class="kpi"><div class="label">Month forecast</div><div class="value">${money(forecast)}</div><div class="sub">${money(remaining)} still to buy</div></div>
      <div class="kpi"><div class="label">Avg. monthly</div><div class="value">${money(planned)}</div><div class="sub">for ${act.length} recurring items</div></div>
      <div class="kpi"><div class="label">Needs attention</div><div class="value">${overdue.length + dueToday.length}</div><div class="sub">${overdue.length} overdue · ${dueToday.length} today</div></div>
    </div>
    ${budget ? `<div class="card"><div style="display:flex;justify-content:space-between;font-size:.85rem"><strong>Monthly budget</strong><span>${Math.round((spent / budget) * 100)}% used</span></div>
      <div class="progress ${spent > budget ? 'over' : ''}"><div style="width:${pct}%"></div></div>
      <div class="help">${forecast > budget ? `⚠️ Forecast is ${money(forecast - budget)} over budget` : `✅ On track — ${money(budget - forecast)} left after planned purchases`}</div></div>` : ''}
    ${overdue.length ? section('⚠️ Overdue', overdue) : ''}
    ${section('📅 Today', dueToday, overdue.length ? '' : 'Nothing due today 🎉')}
    ${week.length ? section('Next 7 days', week) : ''}
    ${later.length ? section('Later', later) : ''}`;
}

function onboarding() {
  return `<div class="card" style="text-align:center">
    <div style="font-size:3rem">🛒</div>
    <h2 style="justify-content:center;font-size:1.25rem">Welcome to Restock</h2>
    <p class="help" style="font-size:.95rem">Add the things you buy regularly — milk every 2 days, rice every month, gas every 2 months — and Restock will remind you before they're due and track what you spend.</p>
    <div class="btn-row" style="justify-content:center"><button class="btn primary" data-act="add">＋ Add an item</button><button class="btn" data-act="quickstart">⚡ Quick start</button></div>
  </div>`;
}

function viewShop() {
  const t = today(), h = ui.shopHorizon;
  const items = sortByDue(activeItems().filter((i) => daysBetween(t, i.nextDue) <= h));
  const byStore = {};
  items.forEach((i) => { (byStore[i.store || 'Any store'] ??= []).push(i); });
  const checked = items.filter((i) => ui.shopChecked.has(i.id));
  const total = items.reduce((a, i) => a + itemCost(i), 0);
  const checkedTotal = checked.reduce((a, i) => a + itemCost(i), 0);
  return `<div class="chips">${[[0, 'Due today'], [3, 'Next 3 days'], [7, 'This week'], [14, '2 weeks'], [31, 'This month']]
    .map(([d, l]) => `<button class="chip ${h === d ? 'active' : ''}" data-horizon="${d}">${l}</button>`).join('')}</div>
    ${items.length ? Object.entries(byStore).map(([store, arr]) => `<h2>🏪 ${esc(store)} <span class="count">${arr.length}</span></h2>
      <div class="list">${arr.map((i) => { const di = dueInfo(i); const on = ui.shopChecked.has(i.id); return `
        <label class="row check-row ${on ? 'done' : ''}">
          <input type="checkbox" data-check="${i.id}" ${on ? 'checked' : ''}>
          <div class="emoji">${esc(emojiFor(i))}</div>
          <div class="main"><div class="name">${esc(i.name)}${i.qty > 1 ? ` ×${esc(i.qty)}${i.unit ? ' ' + esc(i.unit) : ''}` : ''}</div>
          <div class="meta"><span class="pill ${di.cls}">${di.text}</span>${itemCost(i) ? ' · ' + money(itemCost(i)) : ''}</div></div>
        </label>`; }).join('')}</div>`).join('')
      + `<div class="sticky-total"><div><div class="help">Estimated total</div><strong>${money(checked.length ? checkedTotal : total)}</strong>${checked.length ? ` <span class="help">(${checked.length} of ${items.length} ticked)</span>` : ''}</div>
        <div class="btn-row"><button class="btn" data-act="share-list">📤 Share</button><button class="btn primary" data-act="checkout" ${checked.length ? '' : 'disabled'}>✓ Mark ${checked.length || ''} bought</button></div></div>`
    : `<div class="empty"><div class="big">🧺</div>Nothing to buy in this period.</div>`}`;
}

function viewItems() {
  const cats = ['All', ...new Set(state.items.map((i) => i.category))];
  const q = ui.itemSearch.toLowerCase();
  const list = state.items
    .filter((i) => ui.itemFilter === 'All' || i.category === ui.itemFilter)
    .filter((i) => !q || i.name.toLowerCase().includes(q) || (i.store || '').toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  return `<div class="toolbar"><input type="search" id="item-search" placeholder="Search items, stores, notes…" value="${esc(ui.itemSearch)}"></div>
    <div class="chips">${cats.map((c) => `<button class="chip ${ui.itemFilter === c ? 'active' : ''}" data-filter="${esc(c)}">${c === 'All' ? 'All' : esc((CAT_EMOJI[c] || '') + ' ' + c)}</button>`).join('')}</div>
    ${list.length ? `<div class="list">${list.map((i) => itemRow(i, { actions: false })).join('')}</div>`
      : `<div class="empty"><div class="big">📦</div>${state.items.length ? 'No matching items.' : 'No items yet. Tap ＋ to add one.'}</div>`}
    ${state.items.length ? `<p class="help" style="text-align:center;margin-top:16px">Tap an item to edit, pause or delete it.</p>` : ''}`;
}

function viewStats() {
  const mk = ui.statsMonth;
  const [y, m] = mk.split('-').map(Number);
  const monthName = new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const purchases = state.purchases.filter((p) => monthKey(p.date) === mk).sort((a, b) => b.date.localeCompare(a.date));
  const total = purchases.reduce((a, p) => a + p.amount, 0);
  const byCat = {};
  purchases.forEach((p) => { byCat[p.category] = (byCat[p.category] || 0) + p.amount; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const max = cats[0]?.[1] || 1;

  // last 6 months
  const months = [];
  for (let k = 5; k >= 0; k--) { const d = new Date(y, m - 1 - k, 1); const key = iso(d).slice(0, 7); months.push({ key, label: d.toLocaleDateString(undefined, { month: 'short' }), v: spentInMonth(key) }); }
  const mMax = Math.max(1, ...months.map((x) => x.v));
  const avg = months.filter((x) => x.v > 0); const avgV = avg.length ? avg.reduce((a, x) => a + x.v, 0) / avg.length : 0;

  // planned monthly by category
  const planned = {};
  activeItems().forEach((i) => { planned[i.category] = (planned[i.category] || 0) + monthlyCost(i); });
  const plannedArr = Object.entries(planned).sort((a, b) => b[1] - a[1]);
  const pMax = plannedArr[0]?.[1] || 1;

  // top items by spend (all time)
  const byItem = {};
  state.purchases.forEach((p) => { byItem[p.name] = (byItem[p.name] || 0) + p.amount; });
  const top = Object.entries(byItem).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const bars = (arr, mx) => arr.map(([c, v]) => `<div class="bar-row"><span>${esc((CAT_EMOJI[c] || '') + ' ' + c)}</span><div class="track"><div class="fill" style="width:${(v / mx) * 100}%"></div></div><span class="amt">${money(v)}</span></div>`).join('');

  return `<div class="card" style="display:flex;align-items:center;justify-content:space-between">
      <button class="btn small" data-month="-1" aria-label="Previous month">‹</button>
      <div style="text-align:center"><strong>${monthName}</strong><div class="value" style="font-size:1.5rem;font-weight:700">${money(total)}</div></div>
      <button class="btn small" data-month="1" aria-label="Next month" ${mk >= monthKey(today()) ? 'disabled' : ''}>›</button></div>
    <div class="card"><strong>Last 6 months</strong><div class="help">Average ${money(avgV)} / month</div>
      <div class="months">${months.map((x) => `<div class="col" title="${x.label}: ${money(x.v)}"><span class="lbl">${x.v ? Math.round(x.v).toLocaleString() : ''}</span><div class="colbar ${x.key === mk ? 'current' : ''}" style="height:${(x.v / mMax) * 100}%"></div><span class="lbl">${x.label}</span></div>`).join('')}</div></div>
    <div class="card"><strong>Spent by category</strong>${cats.length ? bars(cats, max) : '<div class="empty">No purchases recorded this month.</div>'}</div>
    <div class="card"><strong>Planned monthly cost</strong><div class="help">Based on each item's price and how often you buy it</div>${plannedArr.length ? bars(plannedArr, pMax) : '<div class="empty">Add prices to your items to see this.</div>'}</div>
    ${top.length ? `<div class="card"><strong>Top items (all time)</strong><table>${top.map(([n, v]) => `<tr><td>${esc(n)}</td><td class="num">${money(v)}</td></tr>`).join('')}</table></div>` : ''}
    <div class="card"><strong>Purchases in ${monthName}</strong>
      ${purchases.length ? `<table><tr><th>Date</th><th>Item</th><th class="num">Amount</th><th></th></tr>${purchases.map((p) => `<tr><td>${parseISO(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</td><td>${esc(p.name)}</td><td class="num">${money(p.amount)}</td><td class="num"><button class="btn small danger" data-del-purchase="${p.id}" aria-label="Delete purchase">✕</button></td></tr>`).join('')}</table>` : '<div class="empty">Nothing yet.</div>'}
      <div class="btn-row" style="margin-top:10px"><button class="btn small" data-act="add-expense">＋ One-off expense</button></div></div>`;
}

function viewSettings() {
  const s = state.settings;
  const notifStatus = !('Notification' in window) ? 'Not supported on this browser' : Notification.permission === 'granted' ? (s.notifications ? 'On' : 'Allowed, but off') : Notification.permission === 'denied' ? 'Blocked in browser settings' : 'Off';
  return `<div class="card">
      <div class="settings-row"><div><strong>Currency</strong><div class="desc">Shown before amounts</div></div><input id="set-currency" value="${esc(s.currency)}" maxlength="5"></div>
      <div class="settings-row"><div><strong>Monthly budget</strong><div class="desc">0 = no budget</div></div><input id="set-budget" type="number" min="0" step="any" inputmode="decimal" value="${esc(s.budget)}"></div>
      <div class="settings-row"><div><strong>Remind me</strong><div class="desc">Default days before an item is due</div></div>
        <select id="set-remind">${[0, 1, 2, 3, 5, 7].map((d) => `<option value="${d}" ${s.remindDays == d ? 'selected' : ''}>${d === 0 ? 'On the day' : d + ' day' + (d > 1 ? 's' : '') + ' before'}</option>`).join('')}</select></div>
      <div class="settings-row"><div><strong>Theme</strong></div><select id="set-theme">${['auto', 'light', 'dark'].map((t) => `<option ${s.theme === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    </div>
    <h2>🔔 Reminders</h2>
    <div class="card">
      <div class="settings-row"><div><strong>App notifications</strong><div class="desc">${notifStatus}. Checked each time you open the app (and hourly while it's open).</div></div>
        ${s.notifications && Notification?.permission === 'granted' ? '<button class="btn small" data-act="disable-notif">Turn off</button>' : '<button class="btn small primary" data-act="enable-notif">Turn on</button>'}</div>
      <div class="settings-row"><div><strong>Add to my calendar</strong><div class="desc">Most reliable: creates repeating events with alarms in Google/Apple/Outlook calendar — reminds you even when the app is closed.</div></div>
        <button class="btn small" data-act="ics">📅 Export</button></div>
      <div class="settings-row"><div><strong>Test reminder</strong><div class="desc">Send yourself a notification now</div></div><button class="btn small" data-act="test-notif">Test</button></div>
    </div>
    <h2>💾 Your data</h2>
    <div class="card">
      <p class="help" style="margin-top:0">Data is saved only on this device. Back up regularly, and use the backup file to move to a new phone.</p>
      <div class="btn-row"><button class="btn" data-act="backup">⬇️ Backup (JSON)</button><button class="btn" data-act="restore">⬆️ Restore</button><button class="btn" data-act="csv">📄 Export purchases (CSV)</button></div>
      <div class="btn-row" style="margin-top:8px"><button class="btn" data-act="quickstart">⚡ Add common items</button><button class="btn danger" data-act="reset">🗑 Erase all data</button></div>
      <input type="file" id="restore-file" accept="application/json,.json" hidden>
    </div>
    <p class="help" style="text-align:center">${state.items.length} items · ${state.purchases.length} purchases recorded<br>Tip: use your browser's “Add to Home Screen” to install Restock as an app.</p>`;
}

// ---------- Event binding ----------
function bindView(v) {
  v.onclick = (e) => {
    const el = e.target.closest('[data-act],[data-filter],[data-horizon],[data-month],[data-del-purchase]');
    if (!el) return;
    const id = el.closest('[data-id]')?.dataset.id;
    if (el.dataset.filter) { ui.itemFilter = el.dataset.filter; return render(); }
    if (el.dataset.horizon) { ui.shopHorizon = Number(el.dataset.horizon); return render(); }
    if (el.dataset.month) { const [y, m] = ui.statsMonth.split('-').map(Number); ui.statsMonth = iso(new Date(y, m - 1 + Number(el.dataset.month), 1)).slice(0, 7); return render(); }
    if (el.dataset.delPurchase) { snapshot(); state.purchases = state.purchases.filter((p) => p.id !== el.dataset.delPurchase); save(); render(); return toast('Purchase deleted', true); }
    const act = el.dataset.act;
    const handlers = {
      edit: () => openItemModal(state.items.find((i) => i.id === id)),
      bought: () => openBoughtModal(state.items.find((i) => i.id === id)),
      more: () => openMoreModal(state.items.find((i) => i.id === id)),
      add: () => openItemModal(),
      quickstart: openQuickStart,
      'enable-notif': enableNotifications,
      'disable-notif': () => { state.settings.notifications = false; save(); render(); },
      'dismiss-notif': () => { state.settings.notifDismissed = true; save(); render(); },
      'test-notif': () => notify('Restock test', 'Reminders are working 👍', true),
      ics: exportICS, backup: exportJSON, csv: exportCSV,
      restore: () => $('#restore-file').click(),
      reset: resetAll,
      checkout: checkout,
      'share-list': shareList,
      'add-expense': openExpenseModal,
    };
    handlers[act]?.();
  };
  v.onchange = (e) => {
    const t = e.target;
    if (t.dataset.check) { t.checked ? ui.shopChecked.add(t.dataset.check) : ui.shopChecked.delete(t.dataset.check); return render(); }
    const s = state.settings;
    if (t.id === 'set-currency') s.currency = t.value.trim();
    else if (t.id === 'set-budget') s.budget = Math.max(0, Number(t.value) || 0);
    else if (t.id === 'set-remind') s.remindDays = Number(t.value);
    else if (t.id === 'set-theme') { s.theme = t.value; applyTheme(); }
    else if (t.id === 'restore-file') return importJSON(t.files[0]);
    else return;
    save(); toast('Saved');
  };
  const search = $('#item-search', v);
  if (search) search.oninput = () => {
    ui.itemSearch = search.value;
    const pos = search.selectionStart; render();
    const s2 = $('#item-search'); s2.focus(); s2.setSelectionRange(pos, pos);
  };
}

// ---------- Modals ----------
const modal = $('#modal'), form = $('#modal-form');
function openModal(html, onSubmit, bind) {
  form.innerHTML = html;
  form.onsubmit = (e) => {
    const submitter = e.submitter;
    if (submitter?.value === 'cancel') return;
    if (onSubmit(new FormData(form), submitter?.value) === false) e.preventDefault();
  };
  bind?.(form);
  modal.showModal();
  form.querySelector('[autofocus]')?.focus();
}

function openItemModal(item) {
  const isNew = !item;
  const it = item || { name: '', category: 'Groceries', price: '', qty: 1, unit: '', freqN: 1, freqUnit: 'week', nextDue: today(), store: '', notes: '', remindDays: null };
  const stores = [...new Set(state.items.map((i) => i.store).filter(Boolean))];
  openModal(`<h3>${isNew ? 'Add item' : 'Edit item'}</h3>
    <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" required value="${esc(it.name)}" placeholder="e.g. Milk" list="sugg" autofocus autocomplete="off">
      <datalist id="sugg">${SUGGESTIONS.map((s) => `<option value="${esc(s.name)}">`).join('')}</datalist></div>
    <div class="field"><label>How often do you buy it?</label>
      <div class="presets">${[[1, 'day', 'Daily'], [2, 'day', '2 days'], [3, 'day', '3 days'], [1, 'week', 'Weekly'], [2, 'week', '2 weeks'], [1, 'month', 'Monthly'], [2, 'month', '2 months'], [3, 'month', '3 months']]
        .map(([n, u, l]) => `<button type="button" class="chip ${it.freqN == n && it.freqUnit === u ? 'active' : ''}" data-preset="${n},${u}">${l}</button>`).join('')}</div></div>
    <div class="grid2">
      <div class="field"><label for="f-n">Every</label><input id="f-n" name="freqN" type="number" min="1" max="365" required value="${esc(it.freqN)}" inputmode="numeric"></div>
      <div class="field"><label for="f-u">Unit</label><select id="f-u" name="freqUnit">${['day', 'week', 'month'].map((u) => `<option value="${u}" ${it.freqUnit === u ? 'selected' : ''}>${u}(s)</option>`).join('')}</select></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="f-due">${isNew ? 'Next purchase' : 'Next due'}</label><input id="f-due" name="nextDue" type="date" required value="${esc(it.nextDue)}"></div>
      <div class="field"><label for="f-remind">Remind</label><select id="f-remind" name="remindDays"><option value="">Default (${state.settings.remindDays}d)</option>${[0, 1, 2, 3, 5, 7, 14].map((d) => `<option value="${d}" ${it.remindDays === d ? 'selected' : ''}>${d === 0 ? 'On the day' : d + 'd before'}</option>`).join('')}</select></div>
    </div>
    <div class="grid3">
      <div class="field"><label for="f-price">Price (each)</label><input id="f-price" name="price" type="number" min="0" step="any" inputmode="decimal" value="${esc(it.price)}" placeholder="0"></div>
      <div class="field"><label for="f-qty">Qty</label><input id="f-qty" name="qty" type="number" min="0" step="any" inputmode="decimal" value="${esc(it.qty)}"></div>
      <div class="field"><label for="f-unit">Unit</label><input id="f-unit" name="unit" value="${esc(it.unit)}" placeholder="kg, L, pcs"></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="f-cat">Category</label><select id="f-cat" name="category">${CATEGORIES.map(([c, e]) => `<option value="${c}" ${it.category === c ? 'selected' : ''}>${e} ${c}</option>`).join('')}</select></div>
      <div class="field"><label for="f-store">Store</label><input id="f-store" name="store" value="${esc(it.store)}" list="stores" placeholder="optional"><datalist id="stores">${stores.map((s) => `<option value="${esc(s)}">`).join('')}</datalist></div>
    </div>
    <div class="field"><label for="f-notes">Notes</label><textarea id="f-notes" name="notes" rows="2" placeholder="Brand, size…">${esc(it.notes)}</textarea></div>
    <div class="help" id="f-summary"></div>
    <div class="modal-actions">
      ${isNew ? '' : `<button type="button" class="btn danger" data-del>Delete</button><button type="button" class="btn" data-pause>${it.active === false ? 'Resume' : 'Pause'}</button>`}
      <span class="spacer"></span>
      <button class="btn" value="cancel" formnovalidate>Cancel</button><button class="btn primary" value="save">Save</button>
    </div>`, (fd) => {
    const data = {
      name: fd.get('name').trim(), category: fd.get('category'), price: Number(fd.get('price')) || 0,
      qty: Number(fd.get('qty')) || 1, unit: fd.get('unit').trim(), freqN: Math.max(1, parseInt(fd.get('freqN'), 10) || 1),
      freqUnit: fd.get('freqUnit'), nextDue: fd.get('nextDue') || today(), store: fd.get('store').trim(), notes: fd.get('notes').trim(),
      remindDays: fd.get('remindDays') === '' ? null : Number(fd.get('remindDays')),
    };
    if (!data.name) return false;
    snapshot();
    if (isNew) state.items.push({ id: uid(), active: true, createdAt: today(), ...data });
    else Object.assign(item, data);
    save(); render(); toast(isNew ? `${data.name} added` : 'Saved', true);
  }, (f) => {
    const summary = () => {
      const n = Number(f.freqN.value) || 1, u = f.freqUnit.value, p = (Number(f.price.value) || 0) * (Number(f.qty.value) || 1);
      $('#f-summary').textContent = p ? `≈ ${money(monthlyCost({ price: p, qty: 1, freqN: n, freqUnit: u }))} per month` : '';
    };
    f.oninput = summary; summary();
    f.querySelectorAll('[data-preset]').forEach((b) => b.onclick = () => {
      const [n, u] = b.dataset.preset.split(','); f.freqN.value = n; f.freqUnit.value = u;
      f.querySelectorAll('[data-preset]').forEach((x) => x.classList.toggle('active', x === b)); summary();
    });
    f.name.addEventListener('change', () => {
      const s = SUGGESTIONS.find((x) => x.name.toLowerCase() === f.name.value.trim().toLowerCase());
      if (s && isNew) { f.category.value = s.category; f.freqN.value = s.freqN; f.freqUnit.value = s.freqUnit; summary(); }
    });
    f.querySelector('[data-del]')?.addEventListener('click', () => {
      if (!confirm(`Delete "${item.name}"? Its purchase history is kept.`)) return;
      snapshot(); state.items = state.items.filter((i) => i.id !== item.id); save(); modal.close(); render(); toast('Item deleted', true);
    });
    f.querySelector('[data-pause]')?.addEventListener('click', () => {
      snapshot(); item.active = item.active === false;
      if (item.active && item.nextDue < today()) item.nextDue = today();
      save(); modal.close(); render(); toast(item.active ? 'Resumed' : 'Paused — no reminders until resumed', true);
    });
  });
}

function openBoughtModal(item) {
  openModal(`<h3>✓ Bought ${esc(item.name)}</h3>
    <div class="grid3">
      <div class="field"><label for="b-qty">Qty</label><input id="b-qty" name="qty" type="number" min="0" step="any" inputmode="decimal" value="${esc(item.qty || 1)}"></div>
      <div class="field" style="grid-column: span 2"><label for="b-amt">Total paid</label><input id="b-amt" name="amount" type="number" min="0" step="any" inputmode="decimal" value="${esc(itemCost(item) || '')}" placeholder="0" autofocus></div>
    </div>
    <div class="field"><label for="b-date">Date</label><input id="b-date" name="date" type="date" value="${today()}" max="${today()}"></div>
    <div class="help">Next reminder: <span id="b-next"></span></div>
    <div class="modal-actions"><button class="btn" value="cancel" formnovalidate>Cancel</button><button class="btn primary" value="ok">Save purchase</button></div>`,
  (fd) => {
    markBought(item.id, { date: fd.get('date') || today(), amount: Number(fd.get('amount')) || 0, qty: Number(fd.get('qty')) || 1 });
    render(); toast(`${item.name} bought — next ${dueInfo(item).text.toLowerCase()}`, true);
  }, (f) => {
    const upd = () => { $('#b-next').textContent = parseISO(addInterval(f.date.value || today(), item.freqN, item.freqUnit)).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); };
    f.date.oninput = upd; upd();
  });
}

function openMoreModal(item) {
  openModal(`<h3>${esc(emojiFor(item))} ${esc(item.name)}</h3>
    <div class="help">${freqLabel(item)} · ${dueInfo(item).text}${item.lastBought ? ` · last bought ${parseISO(item.lastBought).toLocaleDateString()}` : ''}</div>
    ${priceHistory(item)}
    <div class="btn-row">
      <button class="btn" value="snooze1">😴 Snooze 1 day</button>
      <button class="btn" value="snooze3">😴 3 days</button>
      <button class="btn" value="snooze7">😴 1 week</button>
      <button class="btn" value="skip">⏭ Skip this time</button>
      <button class="btn" value="quick">⚡ Bought (usual price)</button>
      <button class="btn" value="edit">✏️ Edit</button>
    </div>
    <div class="modal-actions"><button class="btn" value="cancel">Close</button></div>`,
  (fd, v) => {
    if (v?.startsWith('snooze')) snooze(item.id, Number(v.slice(6)));
    else if (v === 'skip') skip(item.id);
    else if (v === 'quick') { markBought(item.id); render(); toast(`${item.name} bought`, true); }
    else if (v === 'edit') setTimeout(() => openItemModal(item));
  });
}

function priceHistory(item) {
  const ps = state.purchases.filter((p) => p.itemId === item.id).sort((a, b) => b.date.localeCompare(a.date));
  if (!ps.length) return '';
  const total = ps.reduce((a, p) => a + p.amount, 0);
  let avgGap = '';
  if (ps.length > 1) {
    const gaps = []; for (let i = 0; i < ps.length - 1; i++) gaps.push(daysBetween(ps[i + 1].date, ps[i].date));
    const g = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    avgGap = ` · you actually buy it every ~${Math.round(g)} days`;
  }
  return `<div class="card" style="margin:0"><strong>History</strong><div class="help">${ps.length} purchases · ${money(total)} total${avgGap}</div>
    <table>${ps.slice(0, 6).map((p) => `<tr><td>${parseISO(p.date).toLocaleDateString()}</td><td class="num">${p.qty > 1 ? '×' + esc(p.qty) : ''}</td><td class="num">${money(p.amount)}</td></tr>`).join('')}</table></div>`;
}

function openExpenseModal() {
  openModal(`<h3>One-off expense</h3>
    <div class="field"><label for="e-name">What</label><input id="e-name" name="name" required autofocus placeholder="e.g. Birthday gift"></div>
    <div class="grid2"><div class="field"><label for="e-amt">Amount</label><input id="e-amt" name="amount" type="number" min="0" step="any" inputmode="decimal" required></div>
    <div class="field"><label for="e-date">Date</label><input id="e-date" name="date" type="date" value="${today()}"></div></div>
    <div class="field"><label for="e-cat">Category</label><select id="e-cat" name="category">${CATEGORIES.map(([c, e]) => `<option value="${c}" ${c === 'Other' ? 'selected' : ''}>${e} ${c}</option>`).join('')}</select></div>
    <div class="modal-actions"><button class="btn" value="cancel" formnovalidate>Cancel</button><button class="btn primary" value="ok">Add</button></div>`,
  (fd) => {
    snapshot();
    state.purchases.push({ id: uid(), itemId: null, name: fd.get('name').trim(), category: fd.get('category'), date: fd.get('date') || today(), amount: Number(fd.get('amount')) || 0, qty: 1 });
    ui.statsMonth = monthKey(fd.get('date') || today());
    save(); render(); toast('Expense added', true);
  });
}

function openQuickStart() {
  const existing = new Set(state.items.map((i) => i.name.toLowerCase()));
  const avail = SUGGESTIONS.filter((s) => !existing.has(s.name.toLowerCase()));
  if (!avail.length) return toast('All common items are already added');
  openModal(`<h3>⚡ Quick start</h3><div class="help">Tick what you buy regularly. You can set prices and dates later.</div>
    <div class="list" style="max-height:50vh;overflow:auto">${avail.map((s, k) => `<label class="row check-row"><input type="checkbox" name="s" value="${k}"><div class="emoji">${CAT_EMOJI[s.category]}</div><div class="main"><div class="name">${esc(s.name)}</div><div class="meta">${freqLabel(s)}</div></div></label>`).join('')}</div>
    <div class="modal-actions"><button class="btn" value="cancel" formnovalidate>Cancel</button><button class="btn primary" value="ok">Add selected</button></div>`,
  (fd) => {
    const picks = fd.getAll('s').map((k) => avail[Number(k)]);
    if (!picks.length) return;
    snapshot();
    picks.forEach((s) => state.items.push({ id: uid(), active: true, createdAt: today(), price: 0, qty: 1, unit: '', store: '', notes: '', remindDays: null, nextDue: today(), ...s }));
    save(); currentTab = 'items'; render(); toast(`${picks.length} items added — tap one to set its price`, true);
  });
}

// ---------- Shopping list actions ----------
function checkout() {
  const ids = [...ui.shopChecked]; if (!ids.length) return;
  const snap = JSON.stringify(state);
  ids.forEach((id) => markBought(id));
  undoSnapshot = snap; ui.shopChecked.clear(); render();
  toast(`${ids.length} item${ids.length > 1 ? 's' : ''} marked bought`, true);
}
async function shareList() {
  const items = sortByDue(activeItems().filter((i) => daysBetween(today(), i.nextDue) <= ui.shopHorizon));
  const text = '🛒 Shopping list\n' + items.map((i) => `${ui.shopChecked.has(i.id) ? '☑' : '☐'} ${i.name}${i.qty > 1 ? ` ×${i.qty}${i.unit ? ' ' + i.unit : ''}` : ''}${i.store ? ` (${i.store})` : ''}`).join('\n');
  try {
    if (navigator.share) await navigator.share({ title: 'Shopping list', text });
    else { await navigator.clipboard.writeText(text); toast('List copied — paste it in WhatsApp or SMS'); }
  } catch (e) { if (e.name !== 'AbortError') toast('Could not share'); }
}

// ---------- Notifications ----------
async function enableNotifications() {
  if (!('Notification' in window)) return toast('Notifications are not supported here — use the calendar export instead');
  const p = await Notification.requestPermission();
  state.settings.notifications = p === 'granted'; save(); render();
  toast(p === 'granted' ? '🔔 Reminders on' : 'Permission not granted');
  if (p === 'granted') checkReminders(true);
}
async function notify(title, body, force) {
  if (!('Notification' in window) || Notification.permission !== 'granted') { if (force) toast('Turn on notifications first'); return; }
  const opts = { body, icon: 'icon.svg', badge: 'icon.svg', tag: 'restock-due' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) return reg.showNotification(title, opts);
  } catch (e) { /* fall through */ }
  try { new Notification(title, opts); } catch (e) { /* ignore */ }
}
function checkReminders(force = false) {
  const s = state.settings;
  if (!s.notifications) return;
  if (!force && s.lastNotifiedDate === today()) return;
  const due = sortByDue(state.items.filter(needsAttention));
  if (!due.length) return;
  const overdue = due.filter((i) => i.nextDue < today()).length;
  const title = overdue ? `🛒 ${due.length} to buy (${overdue} overdue)` : `🛒 ${due.length} item${due.length > 1 ? 's' : ''} coming up`;
  notify(title, due.slice(0, 6).map((i) => `${i.name} — ${dueInfo(i).text}`).join('\n') + (due.length > 6 ? `\n+${due.length - 6} more` : ''));
  s.lastNotifiedDate = today(); save();
}
function updateBadge() {
  const n = state.items.filter((i) => i.active !== false && i.nextDue <= today()).length;
  try { n ? navigator.setAppBadge?.(n) : navigator.clearAppBadge?.(); } catch (e) { /* unsupported */ }
  document.title = n ? `(${n}) Restock` : 'Restock — Expenses & Reminders';
}

// ---------- Import / export ----------
function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportJSON() { download(`restock-backup-${today()}.json`, JSON.stringify({ app: 'restock', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2), 'application/json'); toast('Backup downloaded'); }
function importJSON(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!Array.isArray(d.items)) throw new Error('bad file');
      if (!confirm(`Replace current data with backup (${d.items.length} items, ${(d.purchases || []).length} purchases)?`)) return;
      snapshot();
      state = { items: d.items, purchases: d.purchases || [], settings: { ...DEFAULT_SETTINGS, ...(d.settings || {}) } };
      save(); applyTheme(); render(); toast('Backup restored', true);
    } catch (e) { toast('That file is not a valid Restock backup'); }
  };
  r.readAsText(file);
}
function exportCSV() {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const rows = [['Date', 'Item', 'Category', 'Qty', 'Amount', 'Currency'], ...[...state.purchases].sort((a, b) => a.date.localeCompare(b.date)).map((p) => [p.date, p.name, p.category, p.qty ?? 1, p.amount, state.settings.currency])];
  download(`restock-purchases-${today()}.csv`, rows.map((r) => r.map(q).join(',')).join('\r\n'), 'text/csv');
}
function exportICS() {
  const items = activeItems(); if (!items.length) return toast('No items to export');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const icsEsc = (s) => String(s).replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const ev = items.map((i) => {
    const freq = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY' }[i.freqUnit];
    const start = (i.nextDue < today() ? today() : i.nextDue).replace(/-/g, '');
    const end = addInterval(i.nextDue < today() ? today() : i.nextDue, 1, 'day').replace(/-/g, '');
    const rd = remindWindow(i);
    return ['BEGIN:VEVENT', `UID:${i.id}@restock`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`,
      `RRULE:FREQ=${freq};INTERVAL=${i.freqN}`, `SUMMARY:${icsEsc('🛒 Buy ' + i.name)}`,
      `DESCRIPTION:${icsEsc(`${freqLabel(i)}${itemCost(i) ? ' · ~' + money(itemCost(i)) : ''}${i.store ? ' · ' + i.store : ''}${i.notes ? '\n' + i.notes : ''}`)}`,
      // advance alarm at 09:00, `rd` days before (all-day events start at 00:00)
      ...(rd > 0 ? ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(`Buy ${i.name} in ${rd} day(s)`)}`, `TRIGGER:-PT${rd * 24 - 9}H`, 'END:VALARM'] : []),
      // alarm at 09:00 on the day
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc('Buy ' + i.name + ' today')}`, 'TRIGGER:PT9H', 'END:VALARM',
      'END:VEVENT'].join('\r\n');
  });
  download('restock-reminders.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Restock//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Restock', ...ev, 'END:VCALENDAR'].join('\r\n'), 'text/calendar');
  toast('Open the downloaded file to add reminders to your calendar');
}
function resetAll() {
  if (!confirm('Erase ALL items and purchase history from this device? Make a backup first if unsure.')) return;
  snapshot();
  state = { items: [], purchases: [], settings: { ...state.settings } };
  save(); render(); toast('All data erased', true);
}

// ---------- Theme / boot ----------
function applyTheme() {
  const t = state.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = t;
}

document.querySelectorAll('.tabs button').forEach((b) => b.onclick = () => { currentTab = b.dataset.tab; render(); window.scrollTo(0, 0); });
$('#add-btn').onclick = () => openItemModal();
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

// Deep links from manifest shortcuts / notifications
const params = new URLSearchParams(location.search);
if (params.get('tab') && TITLES[params.get('tab')]) currentTab = params.get('tab');

applyTheme();
render();
if (params.get('action') === 'add') openItemModal();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
checkReminders();
setInterval(() => { checkReminders(); if (document.visibilityState === 'visible') render(); }, 60 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { checkReminders(); if (!modal.open) render(); } });
