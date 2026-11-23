(() => {
  'use strict';
  const root = document.querySelector('.membership-referral');
  if (!root) return;
  const config = window.PNPMembership || {};
  const local = Boolean(window.PNPMembershipLocal?.enabled);
  const linkInput = document.getElementById('referralLink');
  const copy = document.getElementById('referralCopy');
  const share = document.getElementById('referralShare');
  const metrics = document.getElementById('referralMetrics');
  const panelStatus = document.getElementById('referralPanelStatus');
  const feedback = document.getElementById('referralFeedback');
  const socials = {
    whatsapp:document.getElementById('referralWhatsApp'),
    telegram:document.getElementById('referralTelegram'),
    facebook:document.getElementById('referralFacebook'),
    x:document.getElementById('referralX')
  };
  let referralUrl = null;
  const messages = {
    preview:'Local preview',
    copied:'Referral link copied.',
    copyUnavailable:'Select the referral link and copy it.',
    unavailable:'Sign in to access your referral link. Referral services are not connected yet.',
    failed:'We could not load your referral details. Please try again later.',
    statistics:'Your referral totals are not available yet.',
    shareCancelled:'Sharing cancelled.',
    shareFailed:'Sharing could not be opened. Copy the link to share it instead.'
  };
  function message(key) {
    const lang = document.documentElement.dataset.interfaceLanguage || 'en';
    return config.referralMessages?.[lang]?.[key] || messages[key];
  }
  function announce(key) { feedback.textContent = message(key); }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value) return null;
    try {
      const url = new URL(value,location.href);
      return url.origin === location.origin && !url.username && !url.password && (url.protocol === 'https:' || ['localhost','127.0.0.1','[::1]'].includes(url.hostname)) ? url.href : null;
    } catch { return null; }
  }
  function setShareLinks(url) {
    const targets = {
      whatsapp:['https://wa.me/','text'],
      telegram:['https://t.me/share/url','url'],
      facebook:['https://www.facebook.com/sharer/sharer.php','u'],
      x:['https://twitter.com/intent/tweet','url']
    };
    Object.entries(targets).forEach(([key,[base,param]]) => {
      const destination = new URL(base);
      destination.searchParams.set(param,url);
      socials[key].href = destination.href;
      socials[key].setAttribute('aria-disabled','false');
      socials[key].tabIndex = 0;
    });
  }
  function showLink(url) {
    referralUrl = url;
    linkInput.value = url;
    linkInput.title = url;
    copy.disabled = share.disabled = false;
    panelStatus.hidden = true;
    setShareLinks(url);
  }
  function showCounts(people,joins) {
    if (![people,joins].every(value => Number.isSafeInteger(value) && value >= 0)) return false;
    const format = value => new Intl.NumberFormat('en-IN',{notation:value >= 10000 ? 'compact' : 'standard',maximumFractionDigits:1}).format(value);
    document.getElementById('referralPeopleCount').textContent = format(people);
    document.getElementById('referralJoinedCount').textContent = format(joins);
    document.getElementById('referralPeopleCount').title = String(people);
    document.getElementById('referralJoinedCount').title = String(joins);
    metrics.hidden = false;
    return true;
  }
  async function copyLink() {
    if (!referralUrl || copy.disabled) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(referralUrl);
      announce('copied');
    } catch { linkInput.focus();linkInput.select();announce('copyUnavailable'); }
  }
  copy.addEventListener('click',copyLink);
  share.addEventListener('click', async () => {
    if (!referralUrl || share.disabled) return;
    if (!navigator.share) {await copyLink();return;}
    try { await navigator.share({title:'PNP membership referral',url:referralUrl}); }
    catch(error) { announce(error.name === 'AbortError' ? 'shareCancelled' : 'shareFailed'); }
  });
  Object.values(socials).forEach(anchor => anchor.addEventListener('click',event => {
    if (!referralUrl) event.preventDefault();
    // Sharing is an explicit user action; do not increment sample metrics or
    // claim it generated referrals/registrations. Tracking belongs to backend.
  }));
  async function loadReferral() {
    const endpoint = safeUrl(config.referralEndpoint);
    if (!endpoint) {panelStatus.textContent = message('unavailable');return;}
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),20000);
    try {
      const response = await fetch(endpoint,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      const approvedUrl = safeUrl(data.referral_url);
      if (!response.ok || data.status !== 'ready' || !approvedUrl) {panelStatus.textContent = message('unavailable');return;}
      showLink(approvedUrl);
      if (!showCounts(data.statistics?.people_referred,data.statistics?.successful_joins)) {
        panelStatus.textContent = message('statistics');
        panelStatus.hidden = false;
      }
    } catch {panelStatus.textContent = message('failed');}
    finally {clearTimeout(timeout);}
  }
  if (local) {
    // A public sample invitation code, never an actual member identifier.
    const url = new URL('./join.html',location.href);
    url.searchParams.set('ref','PREVIEW4587');
    showLink(url.href);
    showCounts(12,8);
    announce('preview');
  } else loadReferral();
})();
