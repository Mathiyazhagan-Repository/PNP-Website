(() => {
  'use strict';
  const config = window.PNPFactCheck || {};
  const get = id => document.getElementById(id);
  const form = get('ocSearchForm');
  const search = get('ocSearch');
  const rows = get('ocRows');
  const status = get('ocStatus');
  const retry = get('ocRetry');
  const dialog = get('ocDetail');
  const language = get('languageSelect');
  const filters = [...document.querySelectorAll('[data-oc-type]')];
  const types = { correction: 'Correction', response: 'Response', clarification: 'Clarification', update: 'Update' };
  const examples = [
    ['Sample Correction: Clarifying a Report', 'correction', '2025-02-15', '2025-02-16'],
    ['Sample Response to Media Query', 'response', '2025-02-12', '2025-02-12'],
    ['Sample Clarification on Policy Intent', 'clarification', '2025-02-10', '2025-02-11'],
    ['Sample Update: Project Progress', 'update']
  ].map(([title, type, publication_date, updated_at]) => ({
    title, type, publication_date, updated_at, sample: true, sources: []
  }));
  const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  let records = [];
  let selected = '';
  let loading = true;
  let failed = false;

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return !url.username && !url.password &&
        (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin)) ? url : null;
    } catch {
      return null;
    }
  }

  function element(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value ?? '';
    if (className) node.className = className;
    return node;
  }

  function formatDate(value) {
    if (!validDate(value)) return '—';
    return new Intl.DateTimeFormat(language?.value || 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(value));
  }

  function showDetail(record) {
    get('ocDetailTitle').textContent = record.title;
    const content = get('ocDetailContent');
    content.replaceChildren(element('p', 'Published ' + formatDate(record.publication_date) +
      (validDate(record.updated_at) ? ' · Updated ' + formatDate(record.updated_at) : '')));
    if (record.sample) {
      content.replaceChildren(element('p', 'Illustrative entry supplied with the design reference. No official article is associated with this entry.'));
      dialog.showModal();
      return;
    }
    if (record.summary) content.append(element('p', record.summary));
    const original = safeUrl(record.original_statement_url);
    if (original) {
      const link = element('a', 'Original statement');
      link.href = original.href;
      content.append(link);
    }
    for (const section of Array.isArray(record.evidence_sections) ? record.evidence_sections : []) {
      if (typeof section?.heading !== 'string' || typeof section?.text !== 'string') continue;
      content.append(element('h3', section.heading), element('p', section.text));
    }
    const corrections = Array.isArray(record.corrections) ? record.corrections.filter(item =>
      item?.approved === true && validDate(item.date) && typeof item.summary === 'string') : [];
    if (corrections.length) {
      content.append(element('h3', 'Corrections and updates'));
      for (const item of corrections) content.append(element('p', formatDate(item.date) + ' — ' + item.summary));
    }
    content.append(element('h3', 'Sources'));
    const list = element('ul');
    for (const source of record.sources) {
      const item = element('li');
      const link = element('a', source.title);
      link.href = source.url.href;
      item.append(link);
      list.append(item);
    }
    content.append(list);
    dialog.showModal();
  }

  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const matches = records.filter(record =>
      (record.language || 'en') === (language?.value || 'en') &&
      (!selected || record.type === selected) &&
      [record.title, record.summary, types[record.type]].join(' ').toLocaleLowerCase().includes(term));
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.ocType === selected)));
    const fragment = document.createDocumentFragment();
    matches.forEach((record, index) => {
      const row = element('tr');
      const type = element('span', types[record.type], 'oc-badge');
      type.dataset.type = record.type;
      const typeCell = element('td');
      typeCell.append(type);
      const updated = validDate(record.updated_at) && Date.parse(record.updated_at) > Date.parse(record.publication_date);
      const canonical = safeUrl(record.canonical_url);
      const action = element(canonical ? 'a' : 'button', 'View Details →', 'oc-action');
      action.setAttribute('aria-label', 'View details for ' + record.title);
      if (canonical) action.href = canonical.href;
      else {
        action.type = 'button';
        action.addEventListener('click', () => showDetail(record));
      }
      const actionCell = element('td');
      actionCell.append(action);
      row.append(element('td', String(index + 1).padStart(2, '0')), element('td', record.title), typeCell,
        element('td', formatDate(record.publication_date)), element('td', formatDate(record.updated_at)),
        element('td', record.sample ? 'Sample' : updated ? '● Updated' : '● Published', record.sample ? 'oc-sample' : updated ? 'oc-updated' : 'oc-published'), actionCell);
      fragment.append(row);
    });
    rows.replaceChildren(fragment);
    status.textContent = loading ? 'Loading official clarifications…' :
      failed ? 'Official clarifications are temporarily unavailable.' :
      matches.length ? matches.length + (matches.every(record => record.sample) ? (matches.length === 1 ? ' illustrative record' : ' illustrative records') : (matches.length === 1 ? ' published record' : ' published records')) :
      term || selected ? 'No published records match your search or filter.' : 'No official clarifications have been published here yet.';
    retry.hidden = !failed;
  }

  async function load() {
    loading = true;
    failed = false;
    render();
    try {
      let data = config;
      if (config.endpoint) {
        const endpoint = safeUrl(config.endpoint);
        if (!endpoint || endpoint.origin !== location.origin) throw new Error('Invalid content endpoint');
        const response = await fetch(endpoint, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Unable to load clarifications');
        data = await response.json();
      }
      const source = Array.isArray(data.clarifications) ? data.clarifications : [];
      records = source.filter(record => record?.approved === true && record.publication_status === 'published' &&
        typeof record.title === 'string' && record.title.trim() && validDate(record.publication_date || record.updated_at))
        .map(record => {
          const type = String(record.type || record.category || '').trim().toLowerCase();
          const sources = Array.isArray(record.sources) ? record.sources
            .map(source => ({ title: source?.title, url: safeUrl(source?.url) }))
            .filter(source => typeof source.title === 'string' && source.title.trim() && source.url) : [];
          return { ...record, type: Object.hasOwn(types, type) ? type : 'clarification', sources,
            publication_date: record.publication_date || record.updated_at };
        })
        .filter(record => record.sources.length)
        .sort((a, b) => Date.parse(b.publication_date) - Date.parse(a.publication_date));
      if (!config.endpoint && !Array.isArray(config.clarifications)) records = examples;
    } catch {
      records = [];
      failed = true;
    } finally {
      loading = false;
      render();
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    render();
  });
  search.addEventListener('input', render);
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.ocType;
    render();
  }));
  retry.addEventListener('click', load);
  language?.addEventListener('change', render);
  load();
})();
