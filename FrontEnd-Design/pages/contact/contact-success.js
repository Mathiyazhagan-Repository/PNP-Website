(() => {
  'use strict';
  const key = 'pnp-enquiry-confirmation';
  const get = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const local = location.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const preview = local && params.get('preview') === '1';
  get('csPreview').hidden = !local;
  if (!preview && params.get('status') === 'unavailable') {
    get('csHeading').firstChild.textContent = 'Enquiry ';
    get('csHeading').querySelector('span').textContent = 'Unavailable';
    get('csIntro').textContent = 'Online enquiry submission is currently unavailable. Your enquiry was not sent. Use Grievance & Hotline if you need help.';
    get('csHelp').hidden = false;
    return;
  }
  let receipt;
  try {
    receipt = JSON.parse(sessionStorage.getItem(key));
    sessionStorage.removeItem(key);
  } catch {
    return;
  }
  if (preview) {
    receipt = {
      confirmedAt: Date.now(),
      reference: 'PNP-ENQ-2026-1048',
      name: 'Ravi Kumar S.',
      subject: 'Joining PNP as a Volunteer',
      contactMethod: 'email',
      submittedAt: '2026-01-28T11:24:00+05:30'
    };
    get('csPreviewNote').hidden = false;
    if (params.get('status') === 'unavailable') get('csPreviewNote').textContent = 'Design preview · Your enquiry was not sent. The details below are examples.';
  }
  const age = Date.now() - receipt?.confirmedAt;
  if (!Number.isFinite(age) || age < 0 || age > 300000) return;
  const put = (id, value, fallback = '—') => {
    get(id).textContent = typeof value === 'string' && value.trim() ? value : fallback;
  };
  const heading = get('csHeading');
  const strong = document.createElement('span');
  strong.textContent = 'Successfully';
  heading.replaceChildren('Enquiry', document.createElement('br'), 'Submitted', strong);
  get('csPreview').hidden = true;
  get('csIntro').textContent = 'Thank you for contacting Praja Nishchaya Party (PNP). Your enquiry has been received successfully.';
  get('csBadge').hidden = false;
  get('csReceived').classList.add('is-received');
  get('csReceived').querySelector('p').textContent = 'Your enquiry has been successfully submitted.';
  put('csReference', receipt.reference, 'Reference unavailable');
  put('csName', receipt.name);
  put('csSubject', receipt.subject);
  const method = { email:'Email', mobile:'Mobile', phone:'Phone', whatsapp:'WhatsApp' };
  put('csMethod', preview ? 'Email (ravi.kumar@example.com)' : Object.hasOwn(method, receipt.contactMethod) ? method[receipt.contactMethod] : '');
  const submitted = new Date(receipt.submittedAt || receipt.confirmedAt);
  if (Number.isFinite(submitted.getTime())) {
    put('csDate', new Intl.DateTimeFormat('en-IN', {
      dateStyle:'medium', timeStyle:'short', timeZone:'Asia/Kolkata'
    }).format(submitted));
  }

  if (preview) {
    const track = get('csTrack');
    track.href = '#csPreviewNote';
    track.hidden = false;
    track.addEventListener('click', event => {
      event.preventDefault();
      get('csPreviewNote').textContent = 'Design preview · Tracking becomes available for a real enquiry with a server-issued tracking link.';
    });
    return;
  }
  if (typeof receipt.trackingUrl !== 'string' || !receipt.trackingUrl.trim()) return;
  try {
    const url = new URL(receipt.trackingUrl, location.href);
    if (url.origin !== location.origin || url.username || url.password || !['https:','http:'].includes(url.protocol)) return;
    const track = get('csTrack');
    track.href = url.href;
    track.hidden = false;
  } catch {
    // A missing or invalid tracking destination leaves the return link available.
  }
})();
