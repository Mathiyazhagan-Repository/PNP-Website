(() => {
  'use strict';
  const section = document.querySelector('.membership-card-section');
  if (!section) return;
  const config = window.PNPMembership || {};
  const local = window.PNPMembershipLocal;
  const stage = document.getElementById('memberCardStage');
  const mode = document.getElementById('memberCardMode');
  const feedback = document.getElementById('memberCardFeedback');
  const download = document.getElementById('memberCardDownload');
  const share = document.getElementById('memberCardShare');
  const verify = document.getElementById('memberCardVerify');
  const photo = document.getElementById('memberCardPhoto');
  const photoFallback = document.getElementById('memberCardPhotoFallback');
  const qrHost = document.getElementById('memberCardQr');
  const dialog = document.getElementById('memberCardDialog');
  const PREVIEW_QR_TEXT = 'PNP DESIGN PREVIEW - NOT A VALID MEMBERSHIP OR IDENTIFICATION CARD';
  let preview = false;
  let approvedDownload = null;
  let approvedShare = null;
  let verificationUrl = null;
  let svgPromise = null;
  const messages = {
    preview:'Sample card only. No real membership has been issued.',
    missing:'Your membership card is not available. Complete registration or sign in to continue.',
    network:'We could not load your card. Check your connection and refresh to try again.',
    loading:'Loading your confirmed membership card…',
    qrMissing:'The QR could not be loaded. Please refresh the page.',
    downloaded:'Your sample card has been downloaded. It is marked as a design preview.',
    downloadError:'The download could not be completed. Please try again.',
    copied:'Card preview description copied.',
    shareError:'Sharing is not available here. You can download the card preview instead.',
    shareCancelled:'Sharing cancelled.'
  };
  function text(key) {
    const lang = document.documentElement.dataset.interfaceLanguage || 'en';
    return config.cardMessages?.[lang]?.[key] || messages[key];
  }
  function announce(key) { feedback.textContent = text(key); }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value) return null;
    try {
      const url = new URL(value,location.href);
      return url.origin === location.origin && (url.protocol === 'https:' || ['localhost','127.0.0.1','[::1]'].includes(url.hostname)) ? url.href : null;
    } catch { return null; }
  }
  function makeQr(payload) {
    if (typeof qrcode !== 'function') throw new Error('QR encoder unavailable');
    const qr = qrcode(0,'M');
    qr.addData(payload);
    qr.make();
    return qr.createSvgTag({scalable:true,cellSize:2,margin:8});
  }
  function renderQr(payload) {
    try {
      // SVG is generated locally by the bundled encoder, never fetched from an
      // external QR service or populated with member names or mobile numbers.
      qrHost.innerHTML = makeQr(payload);
      qrHost.setAttribute('aria-label',preview ? 'QR containing a sample-card notice, not membership verification' : 'QR for the approved membership verification address');
      return true;
    } catch {
      qrHost.textContent = 'QR unavailable';
      verify.disabled = true;
      announce('qrMissing');
      return false;
    }
  }
  function showPreview() {
    preview = true;
    stage.hidden = false;
    mode.hidden = false;
    mode.textContent = 'Local design preview';
    document.getElementById('memberCardPreviewLabel').hidden = false;
    document.getElementById('memberCardQrCaption').textContent = 'Scan preview';
    document.getElementById('memberCardVerifyLabel').textContent = 'Preview QR';
    document.getElementById('memberCardBack').href = './membership-success.html?preview=1';
    download.disabled = share.disabled = verify.disabled = false;
    announce('preview');
    renderQr(PREVIEW_QR_TEXT);
  }
  function showMissing(key = 'missing') {
    stage.hidden = true;
    download.disabled = share.disabled = verify.disabled = true;
    mode.hidden = true;
    const back = document.getElementById('memberCardBack');
    back.href = './join.html';
    back.textContent = 'Return to registration →';
    announce(key);
  }
  function showInfo(title, description) {
    document.getElementById('memberCardDialogTitle').textContent = title;
    document.getElementById('memberCardDialogText').textContent = description;
    dialog.showModal();
  }
  photo.addEventListener('error', () => {photo.hidden = true;photoFallback.hidden = false;});
  async function imageData(path) {
    const response = await fetch(path,{credentials:'same-origin',cache:'force-cache'});
    if (!response.ok) throw new Error('Asset unavailable');
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset,offset+8192));
    return 'data:image/png;base64,' + btoa(binary);
  }
  function sampleSvg() {
    if (!svgPromise) svgPromise = (async () => {
      const assets = await Promise.all([
        imageData('../../assets/hero/membership-sample-portrait.png').catch(() => null),
        imageData('../../assets/hero/navbar-vidhana.png').catch(() => null)
      ]);
      const portrait = assets[0] ? `<image x="66" y="190" width="190" height="235" preserveAspectRatio="xMidYMid slice" href="${assets[0]}" clip-path="url(#portrait)"/>` : '<rect x="66" y="190" width="190" height="235" rx="15" fill="#d2e6f7"/><circle cx="161" cy="265" r="37" fill="#6187ae"/><path d="M92 425V365a69 69 0 0 1 138 0v60Z" fill="#6187ae"/>';
      const landmark = assets[1] ? `<image x="50" y="475" width="580" height="130" href="${assets[1]}" opacity=".6"/>` : '';
      const qr = makeQr(PREVIEW_QR_TEXT).replace('<svg ','<svg x="790" y="195" width="194" height="194" ');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="660" viewBox="0 0 1050 660"><defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#e7f7ff"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#f4eaff"/></linearGradient><clipPath id="portrait"><rect x="66" y="190" width="190" height="235" rx="15"/></clipPath></defs><rect x="2" y="2" width="1046" height="656" rx="40" fill="url(#paper)" stroke="#aacbe6" stroke-width="4"/><g font-family="Arial,sans-serif"><path d="M60 130Q85 52 148 35L123 75Q84 90 60 130" fill="#c2185b"/><path d="M60 140Q87 91 133 81L115 112Q83 110 60 140" fill="#f6cb00"/><path d="M60 148Q83 119 121 116L107 137Q82 131 60 148" fill="#15973d"/><text x="164" y="105" fill="#193e68" font-size="65" font-weight="bold" font-style="italic">PNP</text><text x="164" y="143" fill="#193e68" font-size="24" font-weight="bold">Praja Nishchaya Party</text><rect x="810" y="65" width="240" height="60" rx="26" fill="#bd195c"/><text x="860" y="105" fill="white" font-size="29" font-weight="bold">Member</text>${portrait}<text x="298" y="236" fill="#15385f" font-size="36" font-weight="bold">Rahul Sharma</text><path d="M298 256H740" stroke="#9bb7d1"/><text x="298" y="296" fill="#365c82" font-size="20">Member ID</text><text x="298" y="334" fill="#c2185b" font-size="36" font-weight="bold">PNP0004587</text><text x="298" y="380" fill="#365c82" font-size="20">Member Since</text><text x="298" y="414" fill="#183e68" font-size="27" font-weight="bold">20 Nov 2026</text><text x="298" y="455" fill="#365c82" font-size="20">District: Bengaluru Urban</text><rect x="776" y="181" width="221" height="252" rx="16" fill="white" stroke="#a7c3dc"/>${qr}<text x="829" y="415" fill="#193e68" font-size="21" font-weight="bold">Scan preview</text>${landmark}<text x="76" y="562" fill="#23476d" font-size="20" font-weight="bold">DESIGN PREVIEW — NOT A VALID MEMBERSHIP ID</text><path d="M0 590C320 730 730 430 1050 586V660H0Z" fill="#ffdb00"/><path d="M0 610C320 730 730 480 1050 610V660H0Z" fill="#15973d"/><path d="M0 630C320 730 730 530 1050 633V660H0Z" fill="#fff"/><path d="M0 649C320 740 730 570 1050 653V660H0Z" fill="#c2185b"/></g></svg>`;
    })();
    return svgPromise;
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url),3000);
  }
  download.addEventListener('click', async () => {
    if (download.disabled) return;
    download.disabled = true;
    try {
      if (preview) {
        const svg = await sampleSvg();
        downloadBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'PNP-membership-card-preview.svg');
        announce('downloaded');
      } else if (approvedDownload) {
        const link = document.createElement('a');
        link.href = approvedDownload;
        link.download = 'PNP-membership-card';
        document.body.append(link);
        link.click();
        link.remove();
      }
    } catch {svgPromise = null;announce('downloadError');}
    finally {download.disabled = !preview && !approvedDownload;}
  });
  share.addEventListener('click', async () => {
    if (share.disabled) return;
    const description = 'PNP membership card design preview. Sample only; not valid for membership or identification.';
    try {
      if (preview && navigator.share) {
        const file = new File([await sampleSvg()],'PNP-membership-card-preview.svg',{type:'image/svg+xml'});
        if (navigator.canShare?.({files:[file]})) await navigator.share({title:'PNP card design preview',text:description,files:[file]});
        else await navigator.share({title:'PNP card design preview',text:description});
      } else if (!preview && approvedShare && navigator.share) await navigator.share({title:'PNP membership',url:approvedShare});
      else if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(preview ? description : approvedShare);announce('copied');}
      else announce('shareError');
    } catch (error) {announce(error.name === 'AbortError' ? 'shareCancelled' : 'shareError');}
  });
  verify.addEventListener('click', () => {
    if (verify.disabled) return;
    if (preview) showInfo('Local QR Preview','This QR contains a design-preview notice. It does not authenticate a member or verify an issued membership ID. No member number or personal information is sent to a service.');
    else if (verificationUrl) location.assign(verificationUrl);
  });
  dialog.querySelector('.membership-notice-close').addEventListener('click', () => dialog.close());
  document.getElementById('memberCardPrint').addEventListener('click', () => {dialog.close();window.print();});
  async function loadConfirmedCard() {
    const url = safeUrl(config.membershipEndpoint);
    if (!url) {showMissing();return;}
    announce('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),20000);
    try {
      const response = await fetch(url,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      const member = data.member;
      if (!response.ok || data.status !== 'confirmed' || typeof member?.full_name !== 'string' || typeof member.membership_number !== 'string' || !member.membership_number.trim() || typeof member.district_name !== 'string') {showMissing();return;}
      document.getElementById('memberCardName').textContent = member.full_name;
      document.getElementById('memberCardNumber').textContent = member.membership_number;
      document.getElementById('memberCardDistrict').textContent = member.district_name;
      document.getElementById('memberCardStatus').textContent = member.status || 'Member';
      const date = Date.parse(member.registered_at);
      const dateValue = document.getElementById('memberCardDate');
      if (Number.isFinite(date)) dateValue.textContent = new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(date));
      else dateValue.closest('div').hidden = true;
      const approvedPhoto = safeUrl(data.card?.approved_photo_url);
      if (approvedPhoto) {photo.src = approvedPhoto;photo.alt = 'Membership photograph';}
      else {photo.hidden = true;photoFallback.hidden = false;}
      document.getElementById('memberCardPreviewLabel').hidden = true;
      verificationUrl = safeUrl(data.card?.verification_url);
      approvedDownload = safeUrl(data.card?.download_url);
      approvedShare = safeUrl(data.card?.share_url);
      download.disabled = !approvedDownload;
      share.disabled = !approvedShare;
      verify.disabled = !verificationUrl;
      stage.hidden = false;
      feedback.textContent = '';
      if (verificationUrl) {document.getElementById('memberCardQrCaption').textContent = 'Scan & Verify';renderQr(verificationUrl);}
      else {qrHost.textContent = 'QR pending';document.getElementById('memberCardQrCaption').textContent = 'Not yet issued';}
      document.getElementById('memberCardPrint').textContent = 'Print card';
    } catch {showMissing('network');}
    finally {clearTimeout(timer);}
  }
  if (local?.enabled) showPreview();
  else loadConfirmedCard();
})();
