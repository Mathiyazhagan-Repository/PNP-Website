(() => {
  'use strict';
  const config = window.PNPAccount || {};
  const get = id => document.getElementById(id);
  const page = document.querySelector('.account-settings');
  const tabs = [...page.querySelectorAll('[data-settings-view]')];
  const themes = [...page.querySelectorAll('[name="theme"]')];
  const switches = [...page.querySelectorAll('[data-notification]')];
  const system = matchMedia('(prefers-color-scheme: dark)');
  const loopback = location.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const preview = loopback && !config.sessionEndpoint && !config.settingsEndpoint;
  const storageKey = 'pnp-account-settings-preview';
  const languages = ['en', 'kn', 'hi', 'ta', 'te'];
  let available = false;
  let saved = normalize();

  function endpoint(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.origin === location.origin && !url.username && !url.password &&
        (url.protocol === 'https:' || loopback) ? url.href : null;
    } catch {
      return null;
    }
  }

  function normalize(value = {}) {
    return {
      preferred_language: languages.includes(value?.preferred_language) ? value.preferred_language : 'en',
      theme: ['light', 'dark', 'system'].includes(value?.theme) ? value.theme : 'light',
      notifications: Object.fromEntries(switches.map(input => {
        const key = input.dataset.notification;
        return [key, value?.notifications?.[key] === true];
      }))
    };
  }

  function message(text) {
    get('asStatus').textContent = text;
  }

  function applyTheme() {
    const theme = themes.find(input => input.checked)?.value;
    page.dataset.theme = theme === 'dark' || (theme === 'system' && system.matches) ? 'dark' : 'light';
  }

  function restore() {
    get('asLanguage').value = saved.preferred_language;
    for (const input of themes) input.checked = input.value === saved.theme;
    for (const input of switches) input.checked = saved.notifications[input.dataset.notification];
    applyTheme();
  }

  function values() {
    return normalize({
      preferred_language: get('asLanguage').value,
      theme: themes.find(input => input.checked)?.value,
      notifications: Object.fromEntries(switches.map(input => [input.dataset.notification, input.checked]))
    });
  }

  function section(view) {
    for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.settingsView === view));
    get('asGeneral').hidden = view !== 'general';
    get('asNotifications').hidden = !['general', 'notifications'].includes(view);
    get('asPrivacy').hidden = view !== 'privacy';
    get('asAccount').hidden = view !== 'account';
    get('asActions').hidden = view === 'account';
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin', cache: 'no-store', redirect: 'error',
      signal: AbortSignal.timeout(15000), ...options
    });
    if (response.status === 401 || response.status === 403) {
      available = false;
      throw new Error('Sign in to load or save your account settings.');
    }
    if (!response.ok) throw new Error('Account settings could not be saved or loaded. Please try again.');
    return response.json();
  }

  async function load() {
    if (preview) {
      saved = normalize({ notifications: { party: true, events: true, membership: true } });
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) saved = normalize(JSON.parse(stored));
      } catch {}
      restore();
      return;
    }
    const sessionUrl = endpoint(config.sessionEndpoint);
    const settingsUrl = endpoint(config.settingsEndpoint);
    if (!sessionUrl || !settingsUrl) return;
    const saveButton = get('asSave');
    saveButton.disabled = true;
    message('Loading your account settings…');
    try {
      const session = await request(sessionUrl);
      if (session?.authenticated !== true) {
        message('Sign in to load and save your account settings.');
        return;
      }
      const result = await request(settingsUrl);
      saved = normalize(result.settings);
      restore();
      available = true;
      message('');
    } catch (error) {
      message(error.message);
    } finally {
      saveButton.disabled = false;
    }
  }

  async function save(event) {
    event.preventDefault();
    const next = values();
    if (preview) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        saved = next;
        message('Preview preferences saved in this browser.');
      } catch {
        message('This browser did not allow preview preferences to be saved.');
      }
      return;
    }
    const url = endpoint(config.settingsEndpoint);
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!available || !url || !csrf) {
      message('Account saving is unavailable. Sign in to save your changes.');
      return;
    }
    const button = get('asSave');
    button.disabled = true;
    message('Saving your account settings…');
    try {
      const result = await request(url, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrf },
        body: JSON.stringify(next)
      });
      if (result?.saved !== true) throw new Error('The server did not confirm your changes.');
      saved = result.settings ? normalize(result.settings) : next;
      restore();
      message('Your account settings have been saved.');
    } catch (error) {
      message(error.message);
    } finally {
      button.disabled = false;
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => section(tab.dataset.settingsView)));
  themes.forEach(input => input.addEventListener('change', applyTheme));
  system.addEventListener('change', applyTheme);
  get('asForm').addEventListener('submit', save);
  get('asCancel').addEventListener('click', () => {
    restore();
    message('Unsaved changes discarded.');
  });
  get('asWithdraw').addEventListener('click', () => {
    for (const input of switches) input.checked = false;
    message('Optional updates turned off. Select Save Changes to apply.');
  });
  page.querySelectorAll('[data-account-feature]').forEach(button => {
    button.addEventListener('click', () => {
      get('asDialogTitle').textContent = button.textContent.trim();
      get('asDialogText').textContent = 'This account feature is currently unavailable.';
      get('asDialog').showModal();
    });
  });
  load();
})();
