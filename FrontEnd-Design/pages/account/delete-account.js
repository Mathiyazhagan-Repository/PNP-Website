(() => {
  'use strict';
  const config = window.PNPAccount || {};
  const get = id => document.getElementById(id);
  const form = get('deletionForm');
  const reason = get('deletionReason');
  const details = get('deletionDetails');
  const confirm = get('deletionConfirm');
  const submit = get('deletionSubmit');
  const cancel = get('deletionCancel');
  const login = get('deletionLogin');
  const status = get('deletionStatus');
  let submitted = false;

  function endpoint(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      const local = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      return url.origin === location.origin && !url.username && !url.password &&
        (url.protocol === 'https:' || local) ? url.href : null;
    } catch {
      return null;
    }
  }

  async function request(url, options = {}) {
    const response = await fetch(url, { credentials:'same-origin', cache:'no-store', redirect:'error',
      signal:AbortSignal.timeout(15000), ...options });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new Error('The deletion service could not confirm your request. Check your account before trying again.');
    return response.json();
  }

  const updateCount = () => { get('deletionCount').textContent = details.value.length + ' / 300'; };
  details.addEventListener('input', updateCount);
  cancel.addEventListener('click', () => {
    form.reset();
    updateCount();
    login.hidden = true;
    status.textContent = 'Request cleared.';
    reason.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitted || submit.disabled || !form.reportValidity()) return;
    const sessionUrl = endpoint(config.sessionEndpoint);
    const deletionUrl = endpoint(config.deletionRequestEndpoint);
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!sessionUrl || !deletionUrl || !csrf) {
      status.textContent = 'Online deletion requests are currently unavailable.';
      return;
    }
    const payload = { reason:reason.value, details:details.value.trim(), confirmed:confirm.checked };
    for (const control of [submit,cancel,reason,details,confirm]) control.disabled = true;
    login.hidden = true;
    status.textContent = 'Submitting your deletion request…';
    try {
      const session = await request(sessionUrl);
      if (session?.authenticated !== true) {
        login.hidden = false;
        status.textContent = 'Sign in to submit a data deletion request.';
        return;
      }
      const result = await request(deletionUrl, { method:'POST',
        headers:{ 'Content-Type':'application/json', Accept:'application/json', 'X-CSRF-TOKEN':csrf },
        body:JSON.stringify(payload) });
      if (!result) {
        login.hidden = false;
        status.textContent = 'Your session needs verification. Sign in again to continue.';
        return;
      }
      if (result.submitted !== true) throw new Error('The server did not confirm your deletion request.');
      submitted = true;
      form.reset();
      updateCount();
      status.textContent = 'Your deletion request was received for review.' +
        (typeof result.reference === 'string' && result.reference.trim() ? ' Reference: ' + result.reference : '');
    } catch (error) {
      status.textContent = error.message;
    } finally {
      for (const control of [submit,cancel,reason,details,confirm]) control.disabled = submitted;
    }
  });
})();
