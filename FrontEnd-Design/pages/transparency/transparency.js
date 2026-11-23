(() => {
  'use strict';
  const root = document.querySelector('.transparency-hero');
  if (!root) return;
  const config = window.PNPTransparency || {};
  const period = document.getElementById('transparencyPeriod');
  const source = document.getElementById('transparencySource');
  const status = document.getElementById('transparencyStatus');
  const retry = document.getElementById('transparencyRetry');
  const dialog = document.getElementById('transparencyRecords');
  const records = document.getElementById('transparencyRecordsList');
  const recordsStatus = document.getElementById('transparencyRecordsStatus');
  const categories = {donations:'Donation Disclosures',expenditure:'Expenditure Reports',reports:'Annual Reports',disclosures:'Statutory Disclosures',documents:'Document Library'};
  const messages = {
    awaiting:'Reporting period: Awaiting published records',
    loading:'Loading published overview…',
    empty:'No approved financial overview has been published here yet.',
    network:'Published records could not be loaded. Please try again.',
    noDocuments:'No published documents are available in this category yet.',
    fileUnavailable:'File unavailable',
    downloadFailed:'This file could not be downloaded. Please use View Document or try again later.'
  };
  let documents = [];
  let overview = null;
  let busy = false;
  function locale() {
    return {en:'en-IN',kn:'kn-IN',hi:'hi-IN',ta:'ta-IN',te:'te-IN'}[document.getElementById('languageSelect')?.value] || 'en-IN';
  }
  function message(key) {
    const lang = document.getElementById('languageSelect')?.value || 'en';
    return config.messages?.[lang]?.[key] || messages[key];
  }
  function safeUrl(value, sameOrigin = false) {
    if (typeof value !== 'string' || !value) return null;
    try {
      const url = new URL(value,location.href);
      const local = url.origin === location.origin && ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
      if (url.username || url.password || (url.protocol !== 'https:' && !local)) return null;
      return !sameOrigin || url.origin === location.origin ? url.href : null;
    } catch { return null; }
  }
  function published(record) {return record && record.approved === true && record.publication_status === 'published';}
  function setDocuments(data) {documents = Array.isArray(data) ? data.filter(published) : [];}
  function clearOverview() {
    overview = null;
    period.textContent = message('awaiting');
    source.hidden = true;
    for (const [id,placeholder] of [['transparencyDonations','₹ -- Cr'],['transparencyExpenditure','₹ -- Cr'],['transparencyReports','— —'],['transparencyFilings','— —']]) {
      const element = document.getElementById(id);
      element.textContent = placeholder;
      element.setAttribute('aria-label','Published value unavailable');
      element.removeAttribute('title');
    }
  }
  function setOverview(data) {
    clearOverview();
    const sourceUrl = safeUrl(data?.source?.url);
    if (!published(data) || typeof data.reporting_period !== 'string' || !data.reporting_period.trim() || !sourceUrl || typeof data.source.title !== 'string') return false;
    overview = data;
    period.textContent = 'Reporting period: ' + data.reporting_period;
    source.href = sourceUrl;
    source.textContent = data.source.title;
    source.hidden = false;
    const metrics = data.metrics || {};
    const currency = new Intl.NumberFormat(locale(),{maximumFractionDigits:2});
    const number = new Intl.NumberFormat(locale());
    for (const [key,id,amount] of [
      ['total_donations','transparencyDonations',true],
      ['total_expenditure','transparencyExpenditure',true],
      ['reports_published','transparencyReports',false],
      ['statutory_filings','transparencyFilings',false]
    ]) {
      const value = metrics[key];
      if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER || (!amount && !Number.isSafeInteger(value)) || (amount && data.currency !== 'INR')) continue;
      const element = document.getElementById(id);
      element.textContent = amount ? '₹ ' + currency.format(value/10000000) + ' Cr' : number.format(value);
      element.setAttribute('aria-label',(amount ? new Intl.NumberFormat(locale(),{style:'currency',currency:'INR'}).format(value) : number.format(value)) + '; ' + data.reporting_period + '; source: ' + data.source.title);
      element.title = data.reporting_period + ' · ' + data.source.title;
    }
    return true;
  }
  async function load() {
    if (busy) return;
    retry.hidden = true;
    const endpoint = safeUrl(config.overviewEndpoint,true);
    if (!endpoint) {
      setDocuments(config.documents);
      if (config.overview) setOverview(config.overview);
      return;
    }
    busy = true;
    root.setAttribute('aria-busy','true');
    status.textContent = message('loading');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),20000);
    try {
      const response = await fetch(endpoint,{headers:{Accept:'application/json'},credentials:'same-origin',cache:'no-store',signal:controller.signal});
      if (!response.ok) throw new Error('Publication service unavailable');
      const data = await response.json();
      setDocuments(data.documents);
      status.textContent = setOverview(data) ? '' : message('empty');
    } catch {clearOverview();setDocuments([]);status.textContent = message('network');retry.hidden = false;}
    finally {clearTimeout(timeout);busy = false;root.setAttribute('aria-busy','false');}
  }
  function textNode(tag,text,className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function dateLabel(value) {
    const date = Date.parse(value);
    return Number.isFinite(date) ? new Intl.DateTimeFormat(locale(),{day:'2-digit',month:'short',year:'numeric'}).format(new Date(date)) : 'Publication date unavailable';
  }
  function showRecords(category) {
    if (!Object.hasOwn(categories,category)) return;
    document.getElementById('transparencyRecordsHeading').textContent = categories[category];
    records.replaceChildren();
    const matching = documents.filter(record => category === 'documents' || record.category === category);
    recordsStatus.textContent = matching.length ? '' : message('noDocuments');
    matching.forEach(record => {
      const item = document.createElement('li');
      item.append(textNode('h3',typeof record.title === 'string' ? record.title : 'Published document'));
      if (typeof record.description === 'string') item.append(textNode('p',record.description));
      const metadata = [record.reporting_period,dateLabel(record.publication_date),record.file_type,record.file_size].filter(value => typeof value === 'string' && value.trim());
      item.append(textNode('p',metadata.join(' · ')));
      const file = safeUrl(record.file_url);
      if (file) {
        const actions = document.createElement('div');
        actions.className = 'transparency-document-actions';
        const view = textNode('a','View Document');
        view.href = file;
        view.target = '_blank';
        view.rel = 'noopener noreferrer';
        view.setAttribute('aria-label','View ' + record.title);
        const download = textNode('button','Download');
        download.type = 'button';
        download.setAttribute('aria-label','Download ' + record.title);
        download.addEventListener('click', async () => {
          download.disabled = true;
          try {
            const response = await fetch(file,{credentials:new URL(file).origin === location.origin ? 'same-origin' : 'omit'});
            if (!response.ok) throw new Error('File unavailable');
            const url = URL.createObjectURL(await response.blob());
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = new URL(file).pathname.split('/').pop() || 'published-document';
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url),3000);
          } catch {recordsStatus.textContent = message('downloadFailed');}
          finally {download.disabled = false;}
        });
        actions.append(view,download);
        item.append(actions);
      } else item.append(textNode('p',message('fileUnavailable')));
      records.append(item);
    });
    dialog.showModal();
  }
  document.querySelectorAll('[data-transparency-category]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.transparencyCategory === 'donations') location.assign('./donations.html');
    else if (button.dataset.transparencyCategory === 'expenditure') location.assign('./expenditure.html');
    else if (button.dataset.transparencyCategory === 'reports') location.assign('./reports.html');
    else if (button.dataset.transparencyCategory === 'disclosures') location.assign('./disclosures.html');
    else if (button.dataset.transparencyCategory === 'documents') location.assign('./documents.html');
    else showRecords(button.dataset.transparencyCategory);
  }));
  dialog.querySelectorAll('.transparency-dialog-close,.transparency-dialog-back').forEach(button => button.addEventListener('click', () => dialog.close()));
  retry.addEventListener('click',load);
  document.getElementById('languageSelect')?.addEventListener('change', () => {if(overview)setOverview(overview);});
  clearOverview();
  load();
})();
