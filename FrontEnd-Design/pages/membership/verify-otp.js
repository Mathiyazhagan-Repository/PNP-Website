(() => {
  'use strict';
  const form = document.getElementById('membershipOtpForm');
  if (!form) return;
  const config = window.PNPMembership || {};
  const localPreview = window.PNPMembershipLocal;
  const code = document.getElementById('membershipOtpCode');
  const consent = document.getElementById('otpRegistrationConsent');
  const verify = document.getElementById('otpVerifyButton');
  const resend = document.getElementById('otpResendButton');
  const resendText = document.getElementById('otpResendText');
  const status = document.getElementById('otpStatus');
  const restart = document.getElementById('otpRestart');
  const cells = [...document.querySelectorAll('.otp-code-boxes span')];
  const english = {
    unavailable:'Start registration to receive an OTP. Verification is available once the registration service is connected.',
    loading:'Checking your registration session…',
    code:'Enter the six-digit OTP from your message.',
    consent:'Please review the privacy notice and terms, then confirm your consent.',
    verify:'Verify & Continue',
    verifying:'Verifying…',
    resend:'Resend OTP',
    sending:'Requesting OTP…',
    resendIn:'Resend in {time}',
    invalid:'That code could not be verified. Check your message and try again.',
    expired:'This OTP has expired. Request another code when resend is available.',
    attempts:'Too many attempts. Please wait or start registration again as directed by the verification service.',
    network:'We could not connect to the verification service. Check your connection and try again.',
    service:'Mobile verification is temporarily unavailable. Please try again later.',
    session:'Your registration session is unavailable or has expired. Please return to registration.',
    rateLimit:'Please wait before making another request. The service has temporarily limited attempts.',
    delivery:'OTP delivery has not been confirmed yet. Please try again shortly.',
    sent:'A new OTP has been sent to your registered mobile number.',
    confirmed:'Mobile verified and membership confirmed. You can sign in to access your membership when account access is available.',
    confirmationPending:'Your mobile was verified, but membership creation has not been confirmed. Please sign in or contact support when available.',
    nextUnavailable:'The verification service is not ready to complete registration. Please try again later.',
    policy:'The privacy notice or consent version has changed. Return to registration and review the current terms.',
    previewReady:'Local preview is ready. Use the test code shown above; no SMS has been sent.',
    previewComplete:'Local verification complete. No real membership or membership ID has been created.',
    previewInvalid:'The test code does not match. Use 123456 to try the local flow.',
    previewReset:'The local test code is ready again. No SMS has been sent.',
    previewStorage:'Your browser cannot save this local preview. Allow session storage for this site and try again.'
  };
  function message(key, values = {}) {
    const lang = document.documentElement.dataset.interfaceLanguage || 'en';
    const previewLabels = {resend:'Resend test code',sending:'Resetting test code…'};
    let text = config.otpMessages?.[lang]?.[key] || (localPreview?.enabled && previewLabels[key]) || english[key] || english.service;
    Object.entries(values).forEach(([name,value]) => { text = text.replace('{' + name + '}', String(value)); });
    return text;
  }
  const state = {ready:false,busy:false,locked:false,completed:false,expiresAt:0,resendAt:0,serverOffset:0,consentVersion:null};
  let clock = null;
  function now() { return Date.now() + state.serverOffset; }
  function announce(key, kind = 'info', focus = false) {
    status.textContent = message(key);
    status.dataset.kind = kind;
    status.hidden = false;
    if (focus) status.focus();
  }
  function endpoint(value) {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      const local = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
      return url.origin === location.origin && (url.protocol === 'https:' || local) ? url.href : null;
    } catch { return null; }
  }
  // Session data and verification secrets stay on the server's HttpOnly cookie
  // session. No raw OTP, member record or mobile is written to web storage/URLs.
  async function request(url, method = 'GET', body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),20000);
    try {
      const headers = {'Accept':'application/json'};
      if (method !== 'GET') {
        headers['Content-Type'] = 'application/json';
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        if (token) headers['X-CSRF-TOKEN'] = token;
      }
      const response = await fetch(url,{method,credentials:'same-origin',cache:'no-store',headers,body:body ? JSON.stringify(body) : undefined,signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      return {response,data};
    } finally { clearTimeout(timeout); }
  }
  function digits(value) {
    return value.replace(/[\u0966-\u096f\u0ce6-\u0cef\u0be6-\u0bef\u0c66-\u0c6f]/g, digit => {
      const point = digit.codePointAt(0);
      const base = [0x0966,0x0ce6,0x0be6,0x0c66].find(start => point >= start && point <= start + 9);
      return String(point - base);
    }).replace(/\D/g,'').slice(0,6);
  }
  function drawCode() {
    code.value = digits(code.value);
    cells.forEach((cell,index) => {
      cell.textContent = code.value[index] || '–';
      cell.classList.toggle('is-current', document.activeElement === code && index === Math.min(code.value.length,5));
    });
  }
  function fieldError(id, text) { document.getElementById(id).textContent = text; }
  function clearCode() {
    code.value = '';
    drawCode();
  }
  function updateControls() {
    const expired = state.expiresAt > 0 && now() >= state.expiresAt;
    verify.disabled = state.busy || state.completed || state.locked || (state.ready && expired);
    code.disabled = state.busy || state.completed || state.locked;
    consent.disabled = state.busy || state.completed;
    const remaining = state.resendAt ? Math.max(0,Math.ceil((state.resendAt - now())/1000)) : 0;
    resend.disabled = state.busy || state.completed || !state.ready || (!localPreview?.enabled && !endpoint(config.resendOtpEndpoint)) || !state.resendAt || remaining > 0;
    resendText.textContent = state.busy ? message('sending') : remaining > 0
      ? message('resendIn',{time:String(Math.floor(remaining/60)).padStart(2,'0') + ':' + String(remaining%60).padStart(2,'0')})
      : message('resend');
    if (expired && state.ready && status.dataset.expired !== 'true' && !state.completed) {
      status.dataset.expired = 'true';
      announce('expired','error');
    }
  }
  function setBusy(value, operation = 'verify') {
    state.busy = value;
    form.setAttribute('aria-busy',String(value));
    verify.setAttribute('aria-busy',String(value && operation === 'verify'));
    verify.querySelector('span').textContent = message(value && operation === 'verify' ? 'verifying' : 'verify');
    updateControls();
  }
  function startClock() {
    if (clock !== null) clearInterval(clock);
    clock = setInterval(updateControls,1000);
    updateControls();
  }
  function finishLocalPreview(navigate = false) {
    state.completed = true;
    if (clock !== null) { clearInterval(clock); clock = null; }
    announce('previewComplete','success',true);
    document.getElementById('otpMobileCaption').textContent = 'Preview complete';
    verify.querySelector('span').textContent = 'Preview complete';
    restart.textContent = 'Start another local preview →';
    restart.hidden = false;
    updateControls();
    if (navigate) location.assign('./membership-success.html');
  }
  function applyLocalPreview(record) {
    state.ready = true;
    state.serverOffset = 0;
    state.expiresAt = record.expiresAt;
    state.resendAt = record.resendAt;
    state.locked = record.attempts >= 5;
    state.completed = Boolean(record.completed);
    state.consentVersion = 'local-preview-v1';
    document.getElementById('otpMaskedMobile').textContent = record.masked_mobile;
    document.getElementById('otpMobileCaption').textContent = 'Local preview';
    const hint = document.getElementById('otpLocalHint');
    hint.textContent = 'Test code: ' + localPreview.code + ' · No SMS will be sent';
    hint.hidden = false;
    delete status.dataset.expired;
    restart.hidden = false;
    if (state.completed) { finishLocalPreview(); return; }
    announce('previewReady');
    startClock();
    if (state.locked) announce('attempts','error');
  }
  function applySession(data) {
    if (data.status !== 'otp_pending' || data.session_established !== true) return false;
    const expiry = Date.parse(data.expires_at);
    const consentData = data.registration_consent;
    if (!Number.isFinite(expiry) || consentData?.accepted !== true || !consentData.version || (config.consentVersion && consentData.version !== config.consentVersion)) {
      announce('policy','error');
      restart.hidden = false;
      return false;
    }
    const serverTime = Date.parse(data.server_time);
    state.serverOffset = Number.isFinite(serverTime) ? serverTime - Date.now() : 0;
    state.expiresAt = expiry;
    const resendAt = Date.parse(data.resend_available_at);
    state.resendAt = Number.isFinite(resendAt) ? resendAt : 0;
    state.consentVersion = consentData.version;
    state.ready = true;
    state.locked = data.attempts_remaining === 0;
    const mobile = typeof data.masked_mobile === 'string' ? data.masked_mobile.match(/([0-9]{4})$/) : null;
    document.getElementById('otpMaskedMobile').textContent = mobile ? '+91 ******' + mobile[1] : 'Your registered mobile';
    document.getElementById('otpMobileCaption').textContent = data.otp_sent === true ? 'OTP sent to' : 'Mobile verification';
    if (data.otp_sent === true) status.hidden = true;
    else announce('delivery');
    delete status.dataset.expired;
    restart.hidden = false;
    startClock();
    if (state.locked) announce('attempts','error');
    return true;
  }
  function handleFailure(response, data) {
    const error = data.code || data.error;
    if ([401,403,419].includes(response.status) || error === 'SESSION_EXPIRED') {
      state.ready = false;
      state.locked = true;
      restart.hidden = false;
      announce('session','error',true);
    } else if (error === 'CONSENT_VERSION_CHANGED') {
      state.ready = false;
      state.locked = true;
      restart.hidden = false;
      announce('policy','error',true);
    } else if (response.status === 429) {
      // Only honour a real server rate-limit duration; never invent a cooldown.
      const retryHeader = response.headers.get('Retry-After');
      const seconds = Number(retryHeader);
      const date = Date.parse(retryHeader);
      const until = retryHeader && Number.isFinite(seconds) ? now() + seconds*1000 : Number.isFinite(date) ? date : 0;
      if (until > now()) state.resendAt = Math.max(state.resendAt,until);
      state.locked = true;
      announce('rateLimit','error',true);
    } else if (error === 'OTP_EXPIRED') {
      state.expiresAt = now() - 1;
      status.dataset.expired = 'true';
      announce('expired','error',true);
    } else if (error === 'TOO_MANY_ATTEMPTS' || data.attempts_remaining === 0) {
      state.locked = true;
      announce('attempts','error',true);
    } else if (error === 'OTP_INVALID' || response.status === 422) {
      fieldError('otpCodeError',message('invalid'));
      code.setAttribute('aria-invalid','true');
      announce('invalid','error');
    } else {
      // Duplicate/member-exists states are deliberately not exposed to strangers.
      announce('service','error',true);
    }
  }
  code.addEventListener('input', () => {
    drawCode();
    fieldError('otpCodeError','');
    code.setAttribute('aria-invalid','false');
  });
  code.addEventListener('paste', event => {
    if (!event.clipboardData) return;
    event.preventDefault();
    code.value = digits(event.clipboardData.getData('text'));
    drawCode();
    fieldError('otpCodeError','');
    code.setAttribute('aria-invalid','false');
  });
  code.addEventListener('focus',drawCode);
  code.addEventListener('blur',drawCode);
  consent.addEventListener('change', () => {
    fieldError('otpConsentError','');
    consent.setAttribute('aria-invalid','false');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (state.busy || state.completed || state.locked) return;
    drawCode();
    const validCode = /^[0-9]{6}$/.test(code.value);
    fieldError('otpCodeError', validCode ? '' : message('code'));
    code.setAttribute('aria-invalid',String(!validCode));
    fieldError('otpConsentError',consent.checked ? '' : message('consent'));
    consent.setAttribute('aria-invalid',String(!consent.checked));
    if (!validCode) { code.focus(); return; }
    if (!consent.checked) { consent.focus(); return; }
    if (localPreview?.enabled) {
      try {
        const result = localPreview.attempt(code.value);
        clearCode();
        if (result.status === 'preview_complete') finishLocalPreview(true);
        else if (result.status === 'expired') { state.expiresAt = now()-1; announce('expired','error',true); }
        else if (result.status === 'too_many_attempts') { state.locked = true; announce('attempts','error',true); }
        else if (result.status === 'invalid') { fieldError('otpCodeError',message('previewInvalid')); code.setAttribute('aria-invalid','true'); code.focus(); }
        else { state.ready = false; announce('session','error',true); }
      } catch { announce('previewStorage','error',true); }
      updateControls();
      return;
    }
    const url = endpoint(config.verifyOtpEndpoint);
    if (!state.ready || !url) { clearCode(); announce('unavailable','info',true); return; }
    if (now() >= state.expiresAt) { clearCode(); announce('expired','error',true); updateControls(); return; }
    if (config.privacyApproved !== true || config.successPageReady !== true) { clearCode(); announce('nextUnavailable','info',true); return; }
    setBusy(true);
    try {
      const {response,data} = await request(url,'POST',{
        otp:code.value,
        consent:{accepted:true,version:state.consentVersion,purpose:'membership_registration',client_timestamp:new Date().toISOString()}
      });
      clearCode();
      if (!response.ok) { handleFailure(response,data); return; }
      if (data.status === 'member_created' && data.member_confirmed === true) {
        state.completed = true;
        announce('confirmed');
        location.assign('./membership-success.html');
      } else if (data.status === 'mobile_verified') {
        state.completed = true;
        announce('confirmationPending','info',true);
      } else announce('service','error',true);
    } catch { clearCode(); announce('network','error',true); }
    finally { setBusy(false); }
  });
  resend.addEventListener('click', async () => {
    if (localPreview?.enabled) {
      if (resend.disabled || state.busy || !state.ready || now() < state.resendAt) return;
      try {
        const result = localPreview.resend();
        if (result.status === 'preview_ready') {
          clearCode();
          fieldError('otpCodeError','');
          code.setAttribute('aria-invalid','false');
          applyLocalPreview(result.session);
          announce('previewReset');
          code.focus();
        } else if (result.status === 'session_expired') { state.ready = false; announce('session','error',true); }
      } catch { announce('previewStorage','error',true); }
      updateControls();
      return;
    }
    const url = endpoint(config.resendOtpEndpoint);
    if (!url || resend.disabled || state.busy || !state.ready || now() < state.resendAt) return;
    clearCode();
    setBusy(true,'resend');
    try {
      const {response,data} = await request(url,'POST',{});
      if (!response.ok) { handleFailure(response,data); return; }
      if (!applySession(data)) { state.ready = false; announce('session','error',true); return; }
      announce(data.otp_sent === true ? 'sent' : 'delivery');
    } catch { announce('network','error',true); }
    finally { setBusy(false); }
  });
  window.addEventListener('pagehide', () => {clearCode();if(clock !== null)clearInterval(clock);});
  window.addEventListener('pageshow', () => { if (state.ready && !state.completed) startClock(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') updateControls(); });
  const notice = document.getElementById('otpNotice');
  const notices = {
    privacy:{title:'Privacy Notice',text:'Your registration details are used to process your membership application and verify your mobile. The accepted consent version and server timestamp must be recorded when membership is created. Online verification remains unavailable until the approved privacy policy and secure registration service are connected.'},
    terms:{title:'Membership Terms',text:'Membership requires your agreement to the published terms, server-verified mobile confirmation and confirmed member creation. The complete membership terms have not yet been published here; no membership or ID can be issued by this page alone.'}
  };
  if (localPreview?.enabled) {
    notices.privacy.text = 'This local preview keeps only a masked mobile number, test expiry and attempt counts in this browser tab. Your name, full mobile number and entered code are not saved. No SMS is sent and no real membership is created. Close this tab to end the temporary session.';
    notices.terms.text = 'This is a local demonstration of the membership screens. Entering the test code does not register you with PNP or issue a membership ID. Real registration will require the approved terms, privacy policy and secure mobile verification service.';
    document.getElementById('otpEditMobile').addEventListener('click', () => localPreview.clear());
  }
  document.querySelectorAll('[data-otp-notice]').forEach(button => button.addEventListener('click', () => {
    const copy = notices[button.dataset.otpNotice];
    document.getElementById('otpNoticeTitle').textContent = copy.title;
    const paragraph = document.createElement('p');
    paragraph.textContent = copy.text;
    document.getElementById('otpNoticeBody').replaceChildren(paragraph);
    notice.showModal();
  }));
  notice.querySelectorAll('.membership-notice-close,.membership-notice-back').forEach(button => button.addEventListener('click', () => notice.close()));
  async function loadSession() {
    if (localPreview?.enabled) {
      try {
        applyLocalPreview(localPreview.ensure());
        if (!state.completed && !state.locked) code.focus();
      } catch { announce('previewStorage','error'); updateControls(); }
      return;
    }
    const url = endpoint(config.otpSessionEndpoint);
    if (!url) { announce('unavailable'); updateControls(); return; }
    setBusy(true,'session');
    announce('loading');
    try {
      const {response,data} = await request(url);
      if (!response.ok) { handleFailure(response,data); return; }
      if (!applySession(data)) { state.ready = false; restart.hidden = false; announce('session','error'); }
    } catch { announce('network','error'); }
    finally { setBusy(false); if (state.ready && !state.locked && now() < state.expiresAt) code.focus(); }
  }
  drawCode();
  loadSession();
})();
