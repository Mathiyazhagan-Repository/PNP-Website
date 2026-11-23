(() => {
  'use strict';
  const form = document.getElementById('memberLoginForm');
  if (!form) return;
  const config = window.PNPMembership || {};
  const preview = Boolean(window.PNPMembershipLocal?.enabled);
  const mobile = document.getElementById('memberLoginMobile');
  const password = document.getElementById('memberLoginPassword');
  const submit = document.getElementById('memberLoginSubmit');
  const showPassword = document.getElementById('memberLoginShowPassword');
  const status = document.getElementById('memberLoginStatus');
  const help = document.getElementById('memberPasswordHelp');
  let busy = false;
  const messages = {
    mobile:'Enter a valid 10-digit Indian mobile number.',
    password:'Enter your password using 6–128 characters.',
    invalid:'The mobile number or password could not be recognised. Please try again.',
    previewInvalid:'Use the local test mobile 9876543210 and password PNP12345. This is not a real login.',
    unavailable:'Account login is not connected yet. No login request has been sent.',
    network:'We could not connect. Check your connection and try again.',
    limited:'Too many attempts. Please wait before trying again.',
    loading:'Logging in…',
    submit:'Login to My Account'
  };
  function message(key) {
    const lang = document.documentElement.dataset.interfaceLanguage || 'en';
    return config.loginMessages?.[lang]?.[key] || messages[key];
  }
  function announce(key) {
    status.textContent = message(key);
    status.hidden = false;
    status.focus();
  }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value) return null;
    try {
      const url = new URL(value,location.href);
      return url.origin === location.origin && (url.protocol === 'https:' || ['localhost','127.0.0.1','[::1]'].includes(url.hostname)) ? url.href : null;
    } catch { return null; }
  }
  function normaliseMobile(value) {
    return value.trim().replace(/[\u0966-\u096f\u0ce6-\u0cef\u0be6-\u0bef\u0c66-\u0c6f]/g, digit => {
      const point = digit.codePointAt(0);
      const base = [0x0966,0x0ce6,0x0be6,0x0c66].find(start => point >= start && point <= start+9);
      return String(point-base);
    }).replace(/[\s-]/g,'').replace(/^\+91/,'');
  }
  function setError(input, id, text) {
    document.getElementById(id).textContent = text;
    input.setAttribute('aria-invalid',String(Boolean(text)));
  }
  function validate() {
    const validMobile = /^[6-9][0-9]{9}$/.test(normaliseMobile(mobile.value));
    const validPassword = password.value.length >= 6 && password.value.length <= 128;
    setError(mobile,'memberLoginMobileError',validMobile ? '' : message('mobile'));
    setError(password,'memberLoginPasswordError',validPassword ? '' : message('password'));
    if (!validMobile) mobile.focus();
    else if (!validPassword) password.focus();
    return validMobile && validPassword;
  }
  function concealPassword() {
    password.type = 'password';
    showPassword.setAttribute('aria-pressed','false');
    showPassword.setAttribute('aria-label','Show password');
    document.getElementById('memberLoginEyeSlash').style.display = '';
  }
  function clearPassword() {password.value = '';concealPassword();}
  function setBusy(value) {
    busy = value;
    form.setAttribute('aria-busy',String(value));
    submit.disabled = mobile.disabled = password.disabled = showPassword.disabled = value;
    submit.querySelector('span').textContent = message(value ? 'loading' : 'submit');
  }
  showPassword.addEventListener('click', () => {
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    showPassword.setAttribute('aria-pressed',String(reveal));
    showPassword.setAttribute('aria-label',reveal ? 'Hide password' : 'Show password');
    document.getElementById('memberLoginEyeSlash').style.display = reveal ? 'none' : '';
  });
  mobile.addEventListener('input', () => setError(mobile,'memberLoginMobileError',''));
  password.addEventListener('input', () => setError(password,'memberLoginPasswordError',''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    status.hidden = true;
    if (!validate()) return;
    if (preview) {
      // Public UI fixtures only: not authentication, no password/mobile storage,
      // no network request, no member creation and no access to private records.
      const matchesFixture = normaliseMobile(mobile.value) === '9876543210' && password.value === 'PNP12345';
      clearPassword();
      if (matchesFixture) location.assign('./membership-card.html?preview=1');
      else announce('previewInvalid');
      return;
    }
    const endpoint = safeUrl(config.loginEndpoint);
    if (!endpoint) {clearPassword();announce('unavailable');return;}
    const body = JSON.stringify({mobile:'+91' + normaliseMobile(mobile.value),password:password.value});
    clearPassword();
    setBusy(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),20000);
    try {
      const headers = {'Content-Type':'application/json',Accept:'application/json'};
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
      if (csrf) headers['X-CSRF-TOKEN'] = csrf;
      const response = await fetch(endpoint,{method:'POST',credentials:'same-origin',headers,body,signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {announce(response.status === 429 ? 'limited' : 'invalid');return;}
      if (data.status !== 'authenticated' || data.authenticated !== true) {announce('invalid');return;}
      // Real access still requires independent server authentication on the
      // destination page. No client-only logged-in flag/token is created.
      location.assign('./membership-card.html');
    } catch {announce('network');}
    finally {clearTimeout(timeout);setBusy(false);}
  });
  document.getElementById('memberForgotPassword').addEventListener('click', () => {
    clearPassword();
    const reset = safeUrl(config.passwordResetUrl);
    if (!preview && reset) {location.assign(reset);return;}
    document.getElementById('memberPasswordHelpText').textContent = preview
      ? 'For this local design preview, use mobile 9876543210 and password PNP12345. These are public test values, not real account credentials. No account or password has been changed.'
      : 'Password recovery is not connected yet. Please return when the account service is available. No reset message has been sent.';
    help.showModal();
  });
  help.querySelectorAll('.membership-notice-close,.membership-notice-back').forEach(button => button.addEventListener('click', () => help.close()));
  window.addEventListener('pagehide',clearPassword);
  if (preview) {
    document.getElementById('memberLoginPreview').hidden = false;
    form.autocomplete = 'off';
    password.autocomplete = 'off';
  }
})();
