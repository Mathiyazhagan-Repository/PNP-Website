(() => {
  'use strict';
  const form = document.getElementById('membershipForm');
  if (!form) return;
  const config = window.PNPMembership || {};
  const localPreview = window.PNPMembershipLocal;
  if (localPreview?.enabled) document.getElementById('membershipPurpose').textContent = 'Local preview: no SMS is sent and no real membership is created. Only a masked mobile is kept in this browser tab.';
  // Geographic choices, not party-unit assignments. Source: Government of India
  // district directory, https://igod.gov.in/sg/KA/E042/organizations (Nov 2026).
  // Replace the slugs with backend district IDs when the API is connected.
  const districtNames = ['Bagalkote','Ballari','Belagavi','Bengaluru Rural','Bengaluru South','Bengaluru Urban','Bidar','Chamarajanagar','Chikkaballapura','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayanagara','Vijayapura','Yadgir'];
  const districts = config.districts || districtNames.map(name => ({id:name.toLowerCase().replaceAll(' ','-'),name}));
  const fields = {
    full_name: document.getElementById('memberName'),
    mobile: document.getElementById('memberMobile'),
    district_id: document.getElementById('memberDistrict'),
    preferred_language: document.getElementById('memberLanguage'),
    registration_consent: document.getElementById('memberConsent')
  };
  const errorIds = {full_name:'memberNameError',mobile:'memberMobileError',district_id:'memberDistrictError',preferred_language:'memberLanguageError',registration_consent:'memberConsentError'};
  const english = {
    name:'Enter your full name using 2–100 characters.',
    mobile:'Enter a valid 10-digit Indian mobile number.',
    district:'Select your district.',
    language:'Select your preferred language.',
    consent:'Please read the privacy notice and terms, then confirm your consent.',
    unavailable:'Online registration is not available yet. No OTP has been sent and your details have not been submitted. Please try again when registration opens.',
    loading:'Requesting OTP…',
    continue:'Continue to OTP Verification',
    network:'We could not connect. Please check your connection and try again. No membership has been created.',
    rateLimit:'Please wait before trying again. The verification service has temporarily limited requests.',
    failed:'We could not start mobile verification. Please try again later.',
    session:'Your registration session is unavailable. Please try again.',
    login:'Use Login / Sign Up in the header to continue.'
  };
  function message(key) {
    const lang = document.documentElement.dataset.interfaceLanguage || 'en';
    return config.messages?.[lang]?.[key] || english[key];
  }
  districts.forEach(district => {
    if (!district.id || !district.name) return;
    const option = document.createElement('option');
    option.value = String(district.id);
    option.textContent = district.name;
    fields.district_id.append(option);
  });
  function normaliseMobile(value) {
    // Accept digits typed using the five configured Indian-language keyboards.
    return value.trim().replace(/[\u0966-\u096f\u0ce6-\u0cef\u0be6-\u0bef\u0c66-\u0c6f]/g, digit => {
      const point = digit.codePointAt(0);
      const base = [0x0966,0x0ce6,0x0be6,0x0c66].find(start => point >= start && point <= start + 9);
      return String(point - base);
    }).replace(/[\s-]/g,'').replace(/^\+91/,'');
  }
  function errorFor(key) {
    const input = fields[key];
    const value = input.value.trim();
    if (key === 'full_name') {
      const length = [...value].length;
      return length < 2 || length > 100 || !/^[\p{L}\p{M} .’'\-\u200c\u200d]+$/u.test(value) || !/\p{L}/u.test(value) ? message('name') : '';
    }
    if (key === 'mobile') return /^[6-9][0-9]{9}$/.test(normaliseMobile(value)) ? '' : message('mobile');
    if (key === 'district_id') return districts.some(item => String(item.id) === value) ? '' : message('district');
    if (key === 'preferred_language') return ['en','kn','hi','ta','te'].includes(value) ? '' : message('language');
    return input.checked ? '' : message('consent');
  }
  function setError(key, text) {
    document.getElementById(errorIds[key]).textContent = text;
    fields[key].setAttribute('aria-invalid', String(Boolean(text)));
  }
  function validate() {
    let first;
    Object.keys(fields).forEach(key => {
      const text = errorFor(key);
      setError(key, text);
      if (text && !first) first = fields[key];
    });
    if (first) first.focus();
    return !first;
  }
  const status = document.getElementById('membershipStatus');
  const submit = document.getElementById('membershipContinue');
  let busy = false;
  function announce(text) {
    status.textContent = text;
    status.hidden = false;
    status.focus();
  }
  function setBusy(value) {
    busy = value;
    submit.disabled = value;
    submit.setAttribute('aria-busy', String(value));
    form.setAttribute('aria-busy', String(value));
    submit.querySelector('span').textContent = message(value ? 'loading' : 'continue');
    Object.values(fields).forEach(field => { field.disabled = value; });
    document.getElementById('memberCommunications').disabled = value;
  }
  Object.entries(fields).forEach(([key, input]) => {
    input.addEventListener('blur', () => { if (input.value || input.getAttribute('aria-invalid') === 'true') setError(key,errorFor(key)); });
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') setError(key,errorFor(key)); });
    input.addEventListener('change', () => { if (input.getAttribute('aria-invalid') === 'true') setError(key,errorFor(key)); });
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    status.hidden = true;
    if (!validate()) return;
    if (localPreview?.enabled) {
      try {
        localPreview.create(normaliseMobile(fields.mobile.value));
        location.assign('./verify-otp.html');
      } catch {
        announce('Your browser could not save the local preview. Allow session storage for this site and try again.');
      }
      return;
    }
    // No personal data is persisted or transmitted without configured, approved
    // privacy documents and a real OTP endpoint. No fake success or OTP exists.
    if (!config.registrationEndpoint || !config.consentVersion || config.privacyApproved !== true || config.verificationPageReady !== true) {
      announce(message('unavailable'));
      return;
    }
    let endpoint;
    try {
      endpoint = new URL(config.registrationEndpoint, location.href);
      if (endpoint.origin !== location.origin || (endpoint.protocol !== 'https:' && !['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname))) throw new Error('Invalid endpoint');
    } catch { announce(message('unavailable')); return; }
    const payload = {
      full_name:fields.full_name.value.trim(),
      mobile:'+91' + normaliseMobile(fields.mobile.value),
      district_id:fields.district_id.value,
      preferred_language:fields.preferred_language.value,
      consent:{accepted:true,version:config.consentVersion,purpose:'membership_registration',client_timestamp:new Date().toISOString()},
      communications_consent:document.getElementById('memberCommunications').checked
    };
    // Carry an invitation source only after informed registration consent.
    // The server must validate/attribute it and prevent referral fraud itself.
    const referral = new URLSearchParams(location.search).get('ref');
    if (referral && /^[A-Za-z0-9_-]{1,64}$/.test(referral) && !referral.startsWith('PREVIEW')) payload.referral_source = referral;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),20000);
    setBusy(true);
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
      const headers = {'Content-Type':'application/json','Accept':'application/json'};
      if (csrf) headers['X-CSRF-TOKEN'] = csrf;
      const response = await fetch(endpoint.href,{method:'POST',credentials:'same-origin',headers,body:JSON.stringify(payload),signal:controller.signal});
      const data = await response.json().catch(() => ({}));
      if (response.status === 422) {
        let first;
        Object.entries(data.errors || {}).forEach(([key,value]) => {
          if (!Object.hasOwn(fields,key)) return;
          const text = Array.isArray(value) ? value[0] : value;
          setError(key,typeof text === 'string' ? text : message('failed'));
          first ||= fields[key];
        });
        if (first) { setBusy(false); first.focus(); return; }
      }
      if (!response.ok) {
        // Keep duplicate-member responses generic to avoid account enumeration.
        announce(message(response.status === 429 ? 'rateLimit' : 'failed'));
        return;
      }
      if (data.status !== 'otp_pending' || data.session_established !== true) { announce(message('session')); return; }
      // The server holds the pending details in an HttpOnly cookie session.
      // No names, mobiles, OTPs or verification secrets enter URLs/web storage.
      location.assign('./verify-otp.html');
    } catch { announce(message('network')); }
    finally { clearTimeout(timer); setBusy(false); }
  });
  document.getElementById('membershipLogin').addEventListener('click', () => {
    location.assign('./already-member.html');
  });
  const notice = document.getElementById('membershipNotice');
  const noticeCopy = {
    privacy:{title:'Privacy Notice', paragraphs:[
      'Your name, mobile number, district and preferred language are requested to process your membership application, verify your mobile number and manage your membership.',
      'Receiving updates is optional and separate from registration consent. Do not enter additional sensitive personal information.',
      'Online registration will open after the full privacy policy, membership terms and secure verification service are available. Until then, this form does not submit or save your details.'
    ]},
    terms:{title:'Membership Terms', paragraphs:[
      'The complete membership terms have not yet been published. Registration cannot be completed until the approved terms and privacy policy are available for you to review.',
      'Submitting the form alone does not create a membership. Mobile verification and confirmation from the membership service are required before an ID can be issued.'
    ]}
  };
  if (localPreview?.enabled) {
    noticeCopy.privacy.paragraphs = ['This local preview validates your entries in the browser. Only a masked mobile number and test-session controls are kept temporarily in this tab. Your name and full mobile number are not saved or sent to a server.','No SMS is sent and no real membership is created. Communications preferences are not submitted to any service. Close the tab to end the temporary session.'];
    noticeCopy.terms.paragraphs = ['This is a local demonstration of the membership registration and verification flow. Using the test code does not create a party membership or issue an ID.','Real membership registration will require published terms, a privacy policy and secure mobile verification.'];
  }
  document.querySelectorAll('[data-member-notice]').forEach(button => button.addEventListener('click', () => {
    const copy = noticeCopy[button.dataset.memberNotice];
    document.getElementById('membershipNoticeTitle').textContent = copy.title;
    const body = document.getElementById('membershipNoticeBody');
    body.replaceChildren(...copy.paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    notice.showModal();
  }));
  notice.querySelectorAll('.membership-notice-close,.membership-notice-back').forEach(button => button.addEventListener('click', () => notice.close()));
  notice.addEventListener('click', event => { if (event.target === notice) {const rect = notice.getBoundingClientRect();if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)notice.close();} });
})();
