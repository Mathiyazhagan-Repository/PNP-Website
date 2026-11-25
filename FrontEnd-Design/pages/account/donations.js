(() => {
  'use strict';
  const config = window.PNPAccount || {};
  const get = id => document.getElementById(id);
  const status = get('adStatus');
  const retry = get('adRetry');
  const manage = get('adManage');
  const manageLink = get('adManageLink');
  const dialog = get('adDialog');
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: 0 });
  const date = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const preview = location.protocol === 'http:' && loopback && !config.sessionEndpoint && !config.donationsEndpoint;
  const isAmount = value => Number.isSafeInteger(value) && value >= 0;
  const isDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  let signedIn = false;

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.origin === location.origin && !url.username && !url.password &&
        (url.protocol === 'https:' || (url.protocol === 'http:' && loopback)) ? url.href : null;
    } catch {
      return null;
    }
  }

  function cell(tag, text) {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
  }

  function notice(title, text, signIn = false) {
    get('adDialogTitle').textContent = title;
    get('adDialogText').textContent = text;
    get('adSignIn').hidden = !signIn;
    dialog.showModal();
  }

  function labelState(node, text, active) {
    node.textContent = text;
    node.classList.toggle('ad-active', active);
  }

  function render(records = [], plan = null, totals = null, empty = 'No donation history to display.') {
    const total = totals?.total_paise ?? records.reduce((sum, record) => sum + record.amount_paise, 0);
    get('adTotal').textContent = totals || signedIn || preview ? money.format(total / 100) : '—';
    get('adCount').textContent = totals || signedIn || preview ? String(totals?.count ?? records.length) : '—';
    const states = { active: 'Active', paused: 'Paused', cancelled: 'Cancelled', pending: 'Pending' };
    const planStatus = Object.hasOwn(states, plan?.status) ? states[plan.status] : (signedIn ? 'No active plan' : '—');
    labelState(get('adRecurring'), planStatus, plan?.status === 'active');
    labelState(get('adPlanStatus'), planStatus, plan?.status === 'active');
    const interval = { monthly: 'Month', weekly: 'Week', yearly: 'Year' };
    get('adPlanAmount').textContent = isAmount(plan?.amount_paise) ? money.format(plan.amount_paise / 100) +
      (Object.hasOwn(interval, plan.interval) ? ' / ' + interval[plan.interval] : '') : '—';
    get('adNextDebit').textContent = isDate(plan?.next_debit) ? date.format(new Date(plan.next_debit)) : '—';
    const url = safeUrl(plan?.manage_url);
    manageLink.hidden = !url;
    manage.hidden = Boolean(url);
    if (url) manageLink.href = url;
    else manageLink.removeAttribute('href');

    const rows = get('adRows');
    rows.replaceChildren();
    if (!records.length) {
      const row = cell('tr', '');
      const message = cell('td', empty);
      message.colSpan = 4;
      row.append(message);
      rows.append(row);
    }
    for (const record of records) {
      const row = cell('tr', '');
      const receipt = cell('td', '');
      const url = safeUrl(record.receipt_url);
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      icon.setAttribute('aria-hidden', 'true');
      icon.setAttribute('viewBox', '0 0 24 24');
      use.setAttribute('href', '#ad-download');
      icon.append(use);
      if (url || preview) {
        const action = cell(url ? 'a' : 'button', 'Download');
        action.prepend(icon);
        action.className = 'ad-secondary';
        action.setAttribute('aria-label', 'Download receipt for ' + record.campaign);
        if (url) action.href = url;
        else {
          action.type = 'button';
          action.addEventListener('click', () => notice('Receipt download', 'This local design preview uses example transactions. No receipt exists for this entry.'));
        }
        receipt.append(action);
      } else receipt.textContent = 'Unavailable';
      row.append(cell('td', date.format(new Date(record.date))), cell('td', record.campaign),
        cell('td', money.format(record.amount_paise / 100)), receipt);
      rows.append(row);
    }
  }

  async function request(url) {
    const response = await fetch(url, {
      credentials: 'same-origin', cache: 'no-store', redirect: 'error',
      headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000)
    });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new Error('Account request failed');
    return response.json();
  }

  async function load() {
    const sessionUrl = safeUrl(config.sessionEndpoint);
    const donationsUrl = safeUrl(config.donationsEndpoint);
    if (!sessionUrl || !donationsUrl) return;
    retry.hidden = true;
    signedIn = false;
    render([], null, null, 'Loading donation history…');
    status.textContent = 'Loading your donations…';
    try {
      const session = await request(sessionUrl);
      if (session?.authenticated !== true) {
        status.textContent = 'Sign in to view your donations and receipts.';
        render();
        return;
      }
      const result = await request(donationsUrl);
      if (!result) {
        status.textContent = 'Please sign in again to view your donations and receipts.';
        render();
        return;
      }
      signedIn = true;
      const donations = Array.isArray(result.donations) ? result.donations.filter(record =>
        isDate(record?.date) && typeof record.campaign === 'string' && isAmount(record.amount_paise)
      ).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)) : [];
      const totals = result.totals;
      render(donations, result.recurring, isAmount(totals?.total_paise) && isAmount(totals?.count) ? totals : null,
        'No donations have been recorded for your account.');
      status.textContent = '';
    } catch {
      signedIn = false;
      render();
      status.textContent = 'Your donations could not be loaded. Please try again.';
      retry.hidden = false;
    }
  }

  manage.addEventListener('click', () => notice('Manage Recurring',
    preview ? 'This local design preview uses an example recurring contribution.' :
      signedIn ? 'Recurring contribution management is unavailable for this account.' :
        'Sign in to manage your recurring contribution.', !preview && !signedIn));
  retry.addEventListener('click', load);
  document.querySelectorAll('.account-donations [data-account-feature]').forEach(button =>
    button.addEventListener('click', () => notice(button.textContent.trim(), 'This account feature is currently unavailable.')));

  if (preview) {
    render([
      { date: '2026-11-15', campaign: 'State Development Fund', amount_paise: 200000 },
      { date: '2026-08-10', campaign: 'Membership Support', amount_paise: 100000 },
      { date: '2026-06-20', campaign: "People’s Welfare Fund", amount_paise: 200000 }
    ], { status: 'active', amount_paise: 50000, interval: 'monthly', next_debit: '2026-12-15' });
    status.textContent = 'Design preview · Sample account data';
  } else load();
})();
