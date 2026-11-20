/* Data-driven profile template. This record is fictional design content, not an appointment. */
(() => {
  'use strict';
  const profiles = {
    'preview-1': {
      name: 'Arjun Rao', designation: 'State Coordinator', level: 'State',
      district: 'Bengaluru Urban', joined: '2018',
      portrait: '../../assets/hero/story-community.png',
      biography: 'Arjun Rao is a sample State Coordinator profile, illustrating a focus on community engagement, volunteer coordination and citizen participation.'
    }
  };
  const id = new URLSearchParams(location.search).get('id') || 'preview-1';
  const record = profiles[id];
  if (!record) {
    document.getElementById('profileLayout').hidden = true;
    document.getElementById('profileMissing').hidden = false;
    document.querySelector('.profile-module').setAttribute('aria-labelledby', 'profileMissing');
    document.title = 'Profile unavailable | PNP';
    return;
  }
  const fields = { profileName: record.name, profileDesignation: record.designation, profileLevel: record.level, profileLocation: record.district, profileJoined: record.joined, profileBio: record.biography };
  Object.entries(fields).forEach(([key, value]) => { document.getElementById(key).textContent = value; });
  document.getElementById('profilePortrait').src = record.portrait;
  document.title = `${record.name} | Leadership Profile | PNP`;
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activate(tab, focus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activate(tabs[next], true); }
    });
  });
  const status = document.getElementById('profileStatus');
  document.querySelectorAll('[data-unavailable]').forEach(button => button.addEventListener('click', () => {
    status.textContent = `${button.dataset.unavailable} details are not available for this sample profile.`;
  }));
  document.getElementById('shareProfile').addEventListener('click', async () => {
    const url = new URL(location.href);
    url.searchParams.set('id', id);
    const share = { title: `${record.name} — PNP profile preview`, url: url.href };
    try {
      if (navigator.share) { await navigator.share(share); status.textContent = 'Profile shared.'; }
      else if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url.href); status.textContent = 'Profile link copied.'; }
      else { status.textContent = `Profile link: ${url.href}`; }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = `Profile link: ${url.href}`;
    }
  });
})();
