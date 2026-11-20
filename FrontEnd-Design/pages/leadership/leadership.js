/* Neutral design records only. Replace with published CMS records once approved.
   Never place private contact data or consent documents in frontend records. */
(() => {
  'use strict';
  const levels = { state: 'State Leadership', district: 'District Leadership', constituency: 'Constituency Leadership' };
  const records = ['state', 'district', 'constituency', 'district', 'constituency', 'state'].map((level, index) => ({
    id: `preview-${index + 1}`, name: 'Leader Name', role: 'unassigned', district: 'unassigned', level, isPreview: true
  }));
  // Fictional sample for the first card only; not an official party appointment.
  Object.assign(records[0], {
    name: 'Arjun Rao', role: 'state-coordinator', district: 'bengaluru-urban',
    designation: 'State Coordinator', location: 'Bengaluru Urban',
    biography: 'Focused on community engagement, volunteer coordination and citizen participation.',
    portrait: '../../assets/hero/story-community.png'
  });
  const form = document.getElementById('directoryFilters');
  const search = document.getElementById('leaderSearch');
  const district = document.getElementById('leaderDistrict');
  const role = document.getElementById('leaderRole');
  const level = document.getElementById('leaderLevel');
  [['leaderDistrict', 'bengaluru-urban', 'Bengaluru Urban'], ['leaderRole', 'state-coordinator', 'State Coordinator']].forEach(([id, value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    document.getElementById(id).append(option);
  });
  const grid = document.getElementById('leadershipCards');
  const result = document.getElementById('leaderResults');
  const empty = document.getElementById('directoryEmpty');
  const tabs = [...document.querySelectorAll('[data-level]')];
  const dialog = document.getElementById('leaderPreview');
  const silhouette = '<svg viewBox="0 0 70 80" fill="currentColor" aria-hidden="true"><path d="M35 4c-12 0-17 9-16 21 1 9 7 16 16 17 9-1 15-8 16-17C52 13 47 4 35 4Zm-7 39C10 46 4 55 3 77h64c-1-22-7-31-25-34l-7 6Z"/></svg>';
  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const matches = records.filter(record => record.name.toLocaleLowerCase().includes(term) && (!district.value || record.district === district.value) && (!role.value || record.role === role.value) && (!level.value || record.level === level.value));
    grid.replaceChildren();
    matches.forEach(record => {
      const card = document.createElement('article');
      card.className = 'leader-card';
      card.dataset.level = record.level;
      // All strings below are controlled neutral placeholders; CMS fields must use textContent.
      card.innerHTML = `<div class="leader-card-head"><div class="leader-avatar">${silhouette}</div><div class="leader-card-info"><span class="leader-level-badge">${levels[record.level]}</span><h3>Leader Name</h3><p>Official Role</p><p>${record.level === 'state' ? 'State Level' : record.level === 'district' ? 'District Level' : 'Constituency Level'}</p></div></div><p class="leader-card-bio">Biography preview.</p><button class="leader-profile-preview" type="button" aria-label="View ${levels[record.level]} layout preview">View Profile <span aria-hidden="true">→</span></button>`;
      if (record.portrait) {
        const image = document.createElement('img');
        image.src = record.portrait;
        image.alt = 'Illustrative portrait for the sample profile';
        image.className = 'leader-sample-portrait';
        image.loading = 'lazy';
        card.querySelector('.leader-avatar').replaceChildren(image);
        card.querySelector('h3').textContent = record.name;
        const details = card.querySelectorAll('.leader-card-info > p');
        details[0].textContent = record.designation;
        details[1].textContent = record.location;
        card.querySelector('.leader-card-bio').textContent = record.biography;
        card.querySelector('button').setAttribute('aria-label', `View ${record.name} sample profile`);
      }
      card.querySelector('button').addEventListener('click', () => {
        if (record.portrait) {
          location.href = `./leader-profile.html?id=${encodeURIComponent(record.id)}`;
          return;
        }
        document.getElementById('previewTitle').textContent = record.portrait ? `${record.name} — Sample profile` : 'Profile preview';
        dialog.querySelector('p:last-of-type').textContent = record.portrait
          ? `${record.designation} · ${record.location}. ${record.biography} Fictional design content; not an official appointment.`
          : 'This is a neutral layout placeholder. Approved names, photographs, biographies and consented public contact details will appear here when provided.';
        document.getElementById('previewLevel').textContent = levels[record.level];
        dialog.showModal();
      });
      grid.append(card);
    });
    result.textContent = `Showing ${matches.length} of ${records.length} results (design placeholders)`;
    empty.hidden = matches.length > 0;
    const chips = document.getElementById('leaderFilterChips');
    chips.replaceChildren();
    [[search, 'Name'], [district, 'District'], [role, 'Role'], [level, 'Level']].forEach(([control, label]) => {
      if (!control.value.trim()) return;
      const value = control === search ? control.value.trim() : control.options[control.selectedIndex].text;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'compact-filter-chip';
      chip.textContent = `${label}: ${value}`;
      const close = document.createElement('span');
      close.textContent = '×'; close.setAttribute('aria-hidden', 'true'); chip.append(close);
      chip.setAttribute('aria-label', `Remove ${label.toLowerCase()} filter: ${value}`);
      chip.addEventListener('click', () => { control.value = ''; render(); control.focus(); });
      chips.append(chip);
    });
    if (!chips.children.length) {
      const note = document.createElement('span'); note.className = 'compact-filter-none';
      note.textContent = 'All leaders'; chips.append(note);
    }
    tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.level === level.value)));
  }
  form.addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', render);
  [district, role, level].forEach(control => control.addEventListener('change', render));
  form.addEventListener('reset', () => { setTimeout(render, 0); });
  document.getElementById('emptyReset').addEventListener('click', () => { form.reset(); search.focus(); });
  tabs.forEach(tab => tab.addEventListener('click', () => { level.value = level.value === tab.dataset.level ? '' : tab.dataset.level; render(); }));
  dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  // Illustrative organisational data for design; replace with approved CMS relationships.
  const organisation = {
    title: 'State Organisation', role: 'State President',
    districts: [
      { name: 'Bengaluru Urban', children: ['Gandhinagar', 'Shivajinagar'] },
      { name: 'Mysuru', children: ['Chamaraja', 'Krishnaraja'] },
      { name: 'Belagavi', children: ['Belagavi North', 'Belagavi South'] }
    ]
  };
  const chart = document.getElementById('leadershipOrgChart');
  if (chart) {
    chart.setAttribute('aria-label', 'Illustrative State, District and Constituency organisation hierarchy');
    const root = document.createElement('div');
    root.className = 'org-root-card';
    root.innerHTML = '<div class="org-root-avatar"><img src="../../assets/hero/story-community.png" alt="Illustrative sample portrait" loading="lazy"></div><div class="org-root-copy"><h3></h3><span class="org-role-pill"></span></div>';
    const laurelArtwork = '<svg viewBox="0 0 46 90" aria-hidden="true"><path d="M37 83C10 73 6 38 23 8" fill="none" stroke="#e9b51b" stroke-width="1.5" stroke-linecap="round"/><g fill="#ffd22f"><path d="M23 9Q16 3 22 0q5 3 1 9ZM19 18Q8 16 12 7q8 3 7 11ZM17 24Q17 13 26 13q0 8-9 11ZM14 31Q3 28 7 20q8 3 7 11ZM14 37Q14 27 23 27q0 8-9 10ZM13 45Q2 42 4 34q8 3 9 11ZM15 51Q13 40 22 39q2 8-7 12ZM17 60Q5 59 5 50q8 0 12 10ZM21 64Q16 54 24 50q5 7-3 14ZM25 73Q13 75 10 66q8-2 15 7ZM29 76Q23 66 30 62q6 6-1 14ZM37 83Q25 86 21 78q7-4 16 5Z"/></g></svg>';
    ['left', 'right'].forEach(side => {
      const wreath = document.createElement('span');
      wreath.className = `org-gold-laurel org-gold-laurel-${side}`;
      wreath.innerHTML = laurelArtwork;
      root.append(wreath);
    });
    root.querySelector('h3').textContent = organisation.title;
    root.querySelector('.org-role-pill').textContent = organisation.role;
    const branches = document.createElement('ul');
    branches.className = 'org-branches';
    organisation.districts.forEach((district, index) => {
      const branch = document.createElement('li');
      branch.className = 'org-branch';
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'org-district-toggle';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-controls', `org-constituencies-${index}`);
      toggle.setAttribute('aria-label', `${district.name} District Unit: expand or collapse constituency units`);
      toggle.innerHTML = `<span class="org-person-avatar">${silhouette}</span><span class="org-district-copy"><h4>District Unit<span></span></h4><span class="org-role-pill">District Leadership</span></span>`;
      toggle.querySelector('h4 span').textContent = district.name;
      const units = document.createElement('ul');
      units.className = 'org-constituencies'; units.id = `org-constituencies-${index}`;
      units.setAttribute('aria-label', `${district.name} constituency units`);
      district.children.forEach(name => {
        const unit = document.createElement('li'); unit.className = 'org-constituency';
        unit.innerHTML = `<span class="org-person-avatar">${silhouette}</span><h5></h5><p>Constituency Head</p>`;
        unit.querySelector('h5').textContent = name;
        units.append(unit);
      });
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded)); units.hidden = expanded;
      });
      branch.append(toggle, units); branches.append(branch);
    });
    chart.replaceChildren(root, branches);
    const section = document.getElementById('organisationStructure');
    if (section && window.IntersectionObserver && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      chart.querySelectorAll('.org-branch').forEach((branch, index) => branch.style.setProperty('--org-order', index));
      section.classList.add('org-motion-ready');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= .15) section.classList.add('org-motion-visible');
          else if (!entry.isIntersecting) section.classList.remove('org-motion-visible');
        });
      }, { threshold: [0, .15] });
      observer.observe(chart);
      section.addEventListener('focusin', () => section.classList.add('org-motion-visible'));
    }
  }
  // Reference-based sample content only; no confirmed council appointments or endorsements.
  // CMS records must be approved, published, and carry active written consent before display.
  const councilPreview = [
    { name: 'Dr. Arun Mehta', expertise: 'Public Policy Expert', quote: 'Policy should be people-centric, practical and built for long-term public good.', portrait: '../../assets/hero/story-community.png' },
    { name: 'Council Profile', expertise: 'Academia & Education', quote: 'Explore perspectives on education, research and opportunities for the next generation.' },
    { name: 'Council Profile', expertise: 'Industry & Innovation', quote: 'Explore perspectives on skills, enterprise and sustainable economic opportunity.' },
    { name: 'Council Profile', expertise: 'Civil Society', quote: 'Explore perspectives on inclusive communities and meaningful citizen participation.' }
  ];
  const voices = document.getElementById('eminentVoicesCouncil');
  if (voices) {
    let current = 0;
    const portrait = document.getElementById('voicesPortrait');
    const pagination = document.getElementById('voicesPagination');
    const councilDialog = document.getElementById('voicesDialog');
    const dialogTitle = document.getElementById('voicesDialogTitle');
    const dialogContent = document.getElementById('voicesDialogContent');
    const dots = councilPreview.map((member, index) => {
      const dot = document.createElement('button'); dot.type = 'button';
      dot.setAttribute('aria-label', `Show council profile ${index + 1}: ${member.expertise}`);
      dot.addEventListener('click', () => showCouncil(index)); pagination.append(dot); return dot;
    });
    function renderCouncilSlide(index) {
      current = (index + councilPreview.length) % councilPreview.length;
      const member = councilPreview[current];
      document.getElementById('voicesName').textContent = member.name;
      document.getElementById('voicesExpertise').textContent = member.expertise;
      document.getElementById('voicesQuote').textContent = member.quote;
      document.getElementById('voicesSlide').setAttribute('aria-label', `${current + 1} of ${councilPreview.length}: design preview`);
      portrait.replaceChildren();
      if (member.portrait) {
        const image = document.createElement('img'); image.src = member.portrait; image.alt = 'Illustrative council profile portrait'; image.loading = 'lazy'; portrait.append(image);
      } else portrait.innerHTML = silhouette;
      dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === current)));
    }
    const reducedCouncilMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let councilAnimating = false;
    let councilStarted = false;
    let councilInView = !window.IntersectionObserver;
    let councilTimer;
    const councilSlideElements = [portrait, document.getElementById('voicesSlide')];
    function showCouncil(index) {
      if (councilAnimating) return;
      if (!councilStarted || reducedCouncilMotion.matches || !portrait.animate) {
        renderCouncilSlide(index); councilStarted = true; return;
      }
      const next = (index + councilPreview.length) % councilPreview.length;
      if (next === current) return;
      const direction = index < current ? -1 : 1;
      councilAnimating = true;
      const exiting = councilSlideElements.map(element => element.animate(
        [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-direction * 24}px)` }],
        { duration: 220, easing: 'ease-in', fill: 'forwards' }
      ));
      Promise.all(exiting.map(animation => animation.finished)).then(() => {
        renderCouncilSlide(next);
        const entering = councilSlideElements.map(element => element.animate(
          [{ opacity: 0, transform: `translateX(${direction * 48}px)` }, { opacity: 1, transform: 'translateX(0)' }],
          { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
        ));
        exiting.forEach(animation => animation.cancel());
        return Promise.all(entering.map(animation => animation.finished)).then(() => entering.forEach(animation => animation.cancel()));
      }).catch(() => {}).finally(() => { councilAnimating = false; });
    }
    function startCouncilSlides() {
      clearInterval(councilTimer);
      if (reducedCouncilMotion.matches) return;
      councilTimer = setInterval(() => {
        if (!councilInView || document.hidden || councilDialog.open || voices.matches(':hover') || voices.contains(document.activeElement)) return;
        showCouncil(current + 1);
      }, 4000);
    }
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(entries => {
        councilInView = entries[0].isIntersecting;
      }, { threshold: .15 });
      observer.observe(voices);
    }
    reducedCouncilMotion.addEventListener('change', startCouncilSlides);
    startCouncilSlides();
    function showCouncilProfile(index) {
      const member = councilPreview[index];
      dialogTitle.textContent = member.name;
      dialogContent.replaceChildren();
      const expertise = document.createElement('p'); expertise.textContent = member.expertise;
      const quote = document.createElement('p'); quote.textContent = member.quote;
      const note = document.createElement('p'); note.className = 'voices-preview-caption'; note.textContent = 'Illustrative design preview. This does not confirm council membership, credentials or endorsement.';
      dialogContent.append(expertise, quote, note);
      if (!councilDialog.open) councilDialog.showModal();
    }
    document.getElementById('voicesPrevious').addEventListener('click', () => showCouncil(current - 1));
    document.getElementById('voicesNext').addEventListener('click', () => showCouncil(current + 1));
    document.getElementById('voicesViewProfile').addEventListener('click', () => showCouncilProfile(current));
    document.getElementById('voicesExplore').addEventListener('click', () => {
      dialogTitle.textContent = 'Explore Council Profiles'; dialogContent.replaceChildren();
      const list = document.createElement('ul'); list.className = 'voices-member-list';
      councilPreview.forEach((member, index) => {
        const item = document.createElement('li'); const button = document.createElement('button'); button.type = 'button'; button.textContent = member.name;
        const field = document.createElement('small'); field.textContent = member.expertise; button.append(field);
        button.addEventListener('click', () => { showCouncil(index); showCouncilProfile(index); }); item.append(button); list.append(item);
      });
      const note = document.createElement('p'); note.className = 'voices-preview-caption'; note.textContent = 'Design previews only. Approved council profiles require active written consent.';
      dialogContent.append(list, note); councilDialog.showModal();
    });
    councilDialog.querySelectorAll('.voices-dialog-close, .voices-dialog-back').forEach(button => button.addEventListener('click', () => councilDialog.close()));
    showCouncil(0);
  }
  render();
})();











