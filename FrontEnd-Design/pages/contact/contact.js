(() => {
  'use strict';
  const config = window.PNPContact || {};
  const form = document.getElementById('cuForm');
  const status = document.getElementById('cuStatus');
  const directory = document.getElementById('cuDirectory');
  const district = document.getElementById('cuDistrict');
  const quickDistrict = document.getElementById('cuQuickDistrict');
  const offices = Array.isArray(config.offices) ? config.offices.filter(office =>
    office?.approved === true && [office.name, office.district, office.address].every(value => typeof value === 'string' && value.trim())
  ) : [];
  const phone = value => typeof value === 'string' && /^\+[1-9]\d{7,14}$/.test(value) ? value : '';
  const email = value => typeof value === 'string' && /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(value) ? value : '';
  const element = (tag, value) => {
    const node = document.createElement(tag);
    node.textContent = value;
    return node;
  };

  const methods = config.methods?.approved === true ? config.methods : {};
  const approvedPhone = phone(methods.phone);
  const approvedEmail = email(methods.email);
  const approvedWhatsApp = phone(methods.whatsapp);
  for (const [type, value, href] of [
    ['phone', approvedPhone, 'tel:' + approvedPhone],
    ['mail', approvedEmail, 'mailto:' + approvedEmail],
    ['chat', approvedWhatsApp, 'https://wa.me/' + approvedWhatsApp.slice(1)]
  ]) {
    if (!value) continue;
    const card = document.querySelector('[data-contact="' + type + '"]');
    const link = document.createElement('a');
    link.className = card.className;
    link.href = href;
    link.append(...card.childNodes);
    link.querySelector('small').textContent = value;
    card.replaceWith(link);
  }

  const officeButton = document.querySelector('.cu-method[data-office-open]');
  if (offices.length) officeButton.querySelector('small').textContent = 'Browse published office locations';
  for (const name of [...new Set(offices.map(office => office.district))].sort((a,b) => a.localeCompare(b))) {
    const option = element('option', name);
    option.value = name;
    district.append(option);
    quickDistrict.append(option.cloneNode(true));
  }
  function renderOffices() {
    const list = document.getElementById('cuOffices');
    list.replaceChildren();
    const visible = offices.filter(office => !district.value || office.district === district.value);
    if (!visible.length) {
      list.append(element('p', 'Approved office locations will appear here when available.'));
      return;
    }
    for (const office of visible) {
      const card = document.createElement('article');
      const address = office.address + ', ' + office.district;
      const map = element('a', 'Get Directions in Google Maps');
      map.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address);
      card.append(element('h3', office.name), element('p', address), map);
      list.append(card);
    }
  }
  district.addEventListener('change', renderOffices);
  document.querySelectorAll('[data-office-open]').forEach(button => button.addEventListener('click', () => {
    district.value = quickDistrict.value;
    renderOffices();
    directory.showModal();
  }));

  document.querySelectorAll('[data-enquiry-subject]').forEach(link => link.addEventListener('click', () => {
    const subject = form.elements.namedItem('subject');
    if (!subject.value.trim()) subject.value = link.dataset.enquirySubject;
  }));

  function enquiryEndpoint() {
    if (typeof config.enquiryEndpoint !== 'string' || !config.enquiryEndpoint.trim()) return null;
    try {
      const url = new URL(config.enquiryEndpoint, location.href);
      const local = url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
      return url.origin === location.origin && !url.username && !url.password && (url.protocol === 'https:' || local) ? url : null;
    } catch {
      return null;
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const endpoint = enquiryEndpoint();
    if (!endpoint) {
      const local = location.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
      location.assign(local ? 'contact-success.html?preview=1&status=unavailable' : 'contact-success.html?status=unavailable');
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const payload = Object.fromEntries(data);
    for (const key of Object.keys(payload)) payload[key] = payload[key].trim();
    if (!payload.full_name || !payload.subject || !payload.message) {
      status.textContent = 'Enter your name, subject, and message before submitting.';
      return;
    }
    payload.mobile = '+91' + payload.mobile.replace(/^\+91\s?/, '');
    payload.consent = data.has('consent');
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
    submit.disabled = true;
    status.textContent = 'Sending enquiry…';
    try {
      const response = await fetch(endpoint, { method:'POST', credentials:'same-origin', redirect:'error',
        headers:{ 'Content-Type':'application/json', Accept:'application/json', ...(csrf ? {'X-CSRF-TOKEN':csrf} : {}) },
        body:JSON.stringify(payload), signal:AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (result?.submitted !== true) throw new Error();
      form.reset();
      status.textContent = 'Your enquiry was received.' +
        (typeof result.reference === 'string' && result.reference ? ' Reference: ' + result.reference : '');
      try {
        sessionStorage.setItem('pnp-enquiry-confirmation', JSON.stringify({
          confirmedAt: Date.now(),
          reference: result.reference,
          submittedAt: result.submitted_at,
          subject: result.summary?.subject || payload.subject,
          name: result.summary?.display_name || payload.full_name,
          contactMethod: result.summary?.contact_method || (payload.email ? 'email' : 'mobile'),
          trackingUrl: result.tracking_url
        }));
        location.assign('contact-success.html');
      } catch {
        // The inline confirmation remains visible when browser storage is unavailable.
      }
    } catch {
      status.textContent = 'We could not confirm receipt of your enquiry. Please try again or use Grievance & Hotline.';
    } finally {
      submit.disabled = false;
    }
  });
})();
