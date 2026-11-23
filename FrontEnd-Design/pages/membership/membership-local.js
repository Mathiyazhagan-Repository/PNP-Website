/* Explicit local UI preview. This is not authentication or a membership service. */
(() => {
  'use strict';
  const config = window.PNPMembership || {};
  const hasApi = Boolean(config.registrationEndpoint || config.otpSessionEndpoint || config.membershipEndpoint || config.loginEndpoint || config.referralEndpoint);
  const enabled = config.localPreview === true || (config.localPreview !== false && !hasApi);
  const storageKey = 'pnp_membership_local_preview_v1';
  const TEST_CODE = '123456'; // Public test fixture, never a real OTP or secret.
  const expiryMs = 5 * 60 * 1000;
  const resendMs = 30 * 1000;
  function read() {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey));
      return value?.kind === 'local-preview' && typeof value.masked_mobile === 'string' && Number.isFinite(value.expiresAt) ? value : null;
    } catch { return null; }
  }
  function save(value) {
    // Only a masked mobile and preview controls are retained for this tab.
    // No name, full mobile, entered OTP, member ID or private token is stored.
    sessionStorage.setItem(storageKey,JSON.stringify(value));
    return value;
  }
  function create(mobile = '') {
    const suffix = String(mobile).replace(/\D/g,'').slice(-4);
    return save({kind:'local-preview',masked_mobile:'+91 ******' + (suffix.length === 4 ? suffix : '4321'),expiresAt:Date.now()+expiryMs,resendAt:Date.now()+resendMs,attempts:0,completed:false});
  }
  function ensure() { return read() || create(); }
  function attempt(value) {
    const record = read();
    if (!record) return {status:'session_expired'};
    if (record.completed) return {status:'preview_complete',session:record};
    if (Date.now() >= record.expiresAt) return {status:'expired',session:record};
    if (record.attempts >= 5) return {status:'too_many_attempts',session:record};
    if (value !== TEST_CODE) {
      record.attempts++;
      save(record);
      return {status:record.attempts >= 5 ? 'too_many_attempts' : 'invalid',session:record};
    }
    record.completed = true;
    save(record);
    return {status:'preview_complete',session:record};
  }
  function resend() {
    const record = read();
    if (!record) return {status:'session_expired'};
    if (record.completed) return {status:'preview_complete',session:record};
    if (Date.now() < record.resendAt) return {status:'wait',session:record};
    record.expiresAt = Date.now()+expiryMs;
    record.resendAt = Date.now()+resendMs;
    record.attempts = 0;
    return {status:'preview_ready',session:save(record)};
  }
  window.PNPMembershipLocal = Object.freeze({enabled,code:TEST_CODE,create,ensure,read,attempt,resend,clear(){try{sessionStorage.removeItem(storageKey);}catch{}}});
})();
