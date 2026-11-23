(() => {
  'use strict';
  const root = document.querySelector('.membership-confirmation');
  if (!root) return;
  const config = window.PNPMembership || {};
  const local = window.PNPMembershipLocal;
  const title = document.getElementById('confirmationTitle');
  const highlight = document.getElementById('confirmationHighlight');
  const welcome = document.getElementById('confirmationWelcome');
  const status = document.getElementById('confirmationStatus');
  const numberPanel = document.getElementById('confirmationNumberPanel');
  const number = document.getElementById('confirmationNumber');
  const numberLabel = document.getElementById('confirmationNumberLabel');
  const previewLabel = document.getElementById('confirmationPreviewLabel');
  const view = document.getElementById('confirmationView');
  const download = document.getElementById('confirmationDownload');
  const share = document.getElementById('confirmationShare');
  const next = document.getElementById('confirmationNext');
  const dialog = document.getElementById('confirmationCardDialog');
  const messages = {
    pending:'Complete mobile verification to continue. No membership has been issued by this page.',
    preview:'Local design preview only. No real membership or membership ID has been issued.',
    unavailable:'Membership details are unavailable. Please sign in or return to registration.',
    loading:'Loading your confirmed membership details…',
    network:'We could not load your membership details. Check your connection and refresh to try again.',
    downloaded:'The sample membership card was downloaded. It is not valid for identification.',
    copied:'Preview description copied. No private membership information was shared.',
    shared:'Sharing options opened for the design preview.',
    unsupported:'Sharing is not available in this browser. You can download the preview instead.',
    cancelled:'Sharing cancelled.',
    shareFailed:'Sharing could not be completed. Please try again.',
    downloadFailed:'The download could not be started. Please try again.'
  };
  function message(key) {
    const lang = document.documentElement.dataset.interfaceLanguage || 'en';
    return config.successMessages?.[lang]?.[key] || messages[key];
  }
  function announce(key) { status.textContent = message(key); }
  let preview = false;
  let card = null;
  function safeUrl(value) {
    if (typeof value !== 'string' || !value) return null;
    try {
      const url = new URL(value,location.href);
      const localHost = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
      return url.origin === location.origin && (url.protocol === 'https:' || localHost) ? url.href : null;
    } catch { return null; }
  }
  function pending(key = 'pending') {
    title.textContent = 'Complete Your';
    highlight.textContent = 'Mobile Verification';
    welcome.textContent = 'Your membership journey starts with verified details.';
    numberPanel.hidden = true;
    view.disabled = download.disabled = share.disabled = true;
    next.hidden = false;
    next.href = './join.html';
    next.textContent = 'Return to registration →';
    announce(key);
  }
  function showPreview() {
    preview = true;
    previewLabel.hidden = false;
    title.textContent = 'Your PNP Member';
    highlight.textContent = 'Preview Is Ready!';
    welcome.textContent = 'Explore your digital membership card design.';
    numberLabel.textContent = 'Sample Membership Number';
    number.textContent = 'PNP0004587';
    numberPanel.hidden = false;
    view.disabled = download.disabled = share.disabled = false;
    view.querySelector('span').textContent = 'View Member ID';
    next.href = '../../index.html';
    next.textContent = 'Back to Homepage →';
    announce('preview');
  }
  // Public, illustrative vector sample. It contains no real member information,
  // verification credentials or QR, and is clearly labelled on the download.
  function previewSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="660" viewBox="0 0 1050 660"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#124c83"/><stop offset="1" stop-color="#061d43"/></linearGradient></defs><rect width="1050" height="660" rx="36" fill="url(#bg)"/><g font-family="Arial,sans-serif" fill="#fff"><text x="60" y="63" font-size="20" fill="#c9e7ff">DESIGN PREVIEW — NOT VALID FOR IDENTIFICATION</text><text x="60" y="170" font-size="83" font-weight="bold" font-style="italic">PNP</text><text x="60" y="216" font-size="27">Praja Nishchaya Party</text><path d="M60 250H990" stroke="#7badd7"/><text x="60" y="322" font-size="44" font-weight="bold">Preview Member</text><text x="60" y="382" font-size="23" fill="#d1e7ff">Sample membership number</text><text x="60" y="438" font-size="42" font-weight="bold" fill="#ffdd22">PNP0004587</text><text x="60" y="513" font-size="22">This sample does not confirm registration or membership.</text></g><path d="M0 610Q260 560 520 603T1050 575V660H0Z" fill="#ffcc00"/><path d="M0 629Q260 578 520 621T1050 593V660H0Z" fill="#c2185b"/></svg>`;
  }
  function downloadPreview() {
    const blob = new Blob([previewSvg()],{type:'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PNP-membership-design-preview.svg';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url),3000);
    announce('downloaded');
  }
  view.addEventListener('click', () => {
    if (view.disabled) return;
    if (preview) location.assign('./membership-card.html?preview=1');
    else if (card?.view) location.assign(card.view);
  });
  download.addEventListener('click', () => {
    if (download.disabled) return;
    try {
      if (preview) downloadPreview();
      else if (card?.download) {
        const link = document.createElement('a');
        link.href = card.download;
        link.download = 'PNP-membership-card';
        document.body.append(link);
        link.click();
        link.remove();
      }
    } catch { announce('downloadFailed'); }
  });
  share.addEventListener('click', async () => {
    if (share.disabled) return;
    try {
      if (preview) {
        const text = 'PNP membership card design preview. This is a sample, not a valid membership or identification card.';
        if (navigator.share) {
          const file = new File([previewSvg()],'PNP-membership-design-preview.svg',{type:'image/svg+xml'});
          if (navigator.canShare?.({files:[file]})) await navigator.share({title:'PNP membership design preview',text,files:[file]});
          else await navigator.share({title:'PNP membership design preview',text});
          announce('shared');
        } else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); announce('copied'); }
        else announce('unsupported');
      } else if (card?.share) {
        // Only a backend-approved public verification/share link is shared.
        // Names, membership records and private download links are never added.
        if (navigator.share) await navigator.share({title:'PNP membership',url:card.share});
        else if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(card.share);status.textContent = 'Approved membership link copied.';}
        else announce('unsupported');
      }
    } catch (error) { announce(error.name === 'AbortError' ? 'cancelled' : 'shareFailed'); }
  });
  dialog.querySelector('.membership-notice-close').addEventListener('click', () => dialog.close());
  document.getElementById('confirmationDialogDownload').addEventListener('click', () => { if (preview) {try{downloadPreview();}catch{announce('downloadFailed');}} });
  async function loadConfirmedMember() {
    const endpoint = safeUrl(config.membershipEndpoint);
    if (!endpoint) { pending('unavailable'); return; }
    announce('loading');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),20000);
    try {
      const response = await fetch(endpoint,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      const member = data.member;
      if (!response.ok || data.status !== 'confirmed' || typeof member?.membership_number !== 'string' || !member.membership_number.trim() || typeof member.full_name !== 'string') {pending('unavailable');return;}
      title.textContent = 'You Are Now a';
      highlight.textContent = 'PNP Member!';
      welcome.textContent = 'Welcome, ' + member.full_name + '.';
      number.textContent = member.membership_number;
      numberPanel.hidden = false;
      status.textContent = '';
      card = {view:safeUrl(data.card?.view_url),download:safeUrl(data.card?.download_url),share:safeUrl(data.card?.share_url)};
      view.disabled = !card.view;
      download.disabled = !card.download;
      share.disabled = !card.share;
      next.href = '../../index.html';
      next.textContent = 'Back to Homepage →';
    } catch { pending('network'); }
    finally { clearTimeout(timeout); }
  }
  if (local?.enabled) {
    const explicitPreview = new URLSearchParams(location.search).get('preview') === '1';
    if (local.read()?.completed || explicitPreview) showPreview();
    else pending();
  } else loadConfirmedMember();
})();
