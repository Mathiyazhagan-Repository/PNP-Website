(() => {
  'use strict';

  const $ = id => document.getElementById('constituency' + id);
  if (!$('Cards')) return;

  const config = window.PNPGeography || {};
  const districts = window.PNPGeographyData?.districts || [];
  const approvedPublished = record =>
    record?.approved === true && record.publication_status === 'published';

  // The fallback list contains established constituency names only.
  // PNP publication status and local organisation details must come from approved CMS/API records.
  const fallbackRecords = [
    { id:'krishnaraja', name:'Krishnaraja', districtId:'mysuru', districtName:'Mysuru', art:'mysuru', previewCategory:'published', description:'Explore constituency information in the Mysuru region.' },
    { id:'bengaluru-south', name:'Bengaluru South', districtId:'bengaluru-urban', districtName:'Bengaluru Urban', art:'bengaluru', previewCategory:'updates', description:'Discover local information for southern Bengaluru.' },
    { id:'hubballi-dharwad-central', name:'Hubballi-Dharwad Central', districtId:'dharwad', districtName:'Dharwad', art:'hubballi', previewCategory:'leadership', description:'Explore constituency information across Hubballi-Dharwad.' },
    { id:'udupi', name:'Udupi', districtId:'udupi', districtName:'Udupi', art:'udupi', previewCategory:'published', description:'Discover constituency information in coastal Karnataka.' }
  ];

  let records = [];
  let category = 'all';
  let completeDirectory = false;

  const el = (tag, text, attrs = {}) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  function safeUrl(value) {
    try {
      if (!value) return null;
      const url = new URL(value, location.href);
      return !url.username && !url.password && (url.protocol === 'https:' || url.origin === location.origin)
        ? url.href
        : null;
    } catch {
      return null;
    }
  }

  function populateDistricts() {
    const districtSelect = $('DistrictFilter');
    const configured = Array.isArray(config.constituencies)
      ? config.constituencies.filter(approvedPublished)
      : [];
    const ids = [...new Set([
      ...districts.map(record => record.id),
      ...fallbackRecords.map(record => record.districtId),
      ...configured.map(record => record.district_id).filter(Boolean)
    ])];

    ids.forEach(id => {
      const district = districts.find(item => item.id === id);
      const name = district?.name || configured.find(item => item.district_id === id)?.district_name;
      if (name) districtSelect.append(el('option', name, { value: id }));
    });
  }

  function updateConstituencyOptions() {
    const districtId = $('DistrictFilter').value;
    const constituencySelect = $('Filter');
    const matches = records.filter(record =>
      (!districtId || record.districtId === districtId)
    );
    constituencySelect.replaceChildren(el('option', 'All Constituencies', { value: '' }));
    matches
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(record => constituencySelect.append(el('option', record.name, { value: record.id })));
  }

  function categoryFor(record) {
    if (record.published) return 'published';
    if (record.updateCount) return 'updates';
    if (record.leaderCount) return 'leadership';
    return 'administrative';
  }

  function render() {
    const districtId = $('DistrictFilter').value;
    const constituencyId = $('Filter').value;
    const term = $('Search').value.trim().toLocaleLowerCase();

    let matches = records.filter(record =>
      (!districtId || record.districtId === districtId) &&
      (!constituencyId || record.id === constituencyId) &&
      (!term || (record.name + ' ' + record.districtName)
        .toLocaleLowerCase().includes(term))
    );

    if (category === 'published') matches = matches.filter(record => record.published || record.previewCategory === 'published');
    if (category === 'updates') matches = matches.filter(record => record.updateCount || record.previewCategory === 'updates');
    if (category === 'leadership') matches = matches.filter(record => record.leaderCount || record.previewCategory === 'leadership');

    $('Cards').replaceChildren();
    matches.forEach(record => {
      const card = el('article', undefined, { class: 'constituency-card' });
      const art = el('div', undefined, { class: 'constituency-card-art' });
      if(record.art) art.classList.add('art-'+record.art);
      else art.append(el('img',undefined,{src:record.image,alt:'',loading:'lazy',width:'640',height:'260'}));
      const status=record.previewCategory || (record.published?'published':record.updateCount?'updates':record.leaderCount?'leadership':null);
      if(status){const text={published:'Published',updates:'Local Updates',leadership:'Leadership Info'}[status];art.append(el('span',text+(record.isPreview?' preview':''),{class:'constituency-card-badge '+(status==='updates'?'local':status==='leadership'?'leadership':'')}));}

      const body = el('div', undefined, { class: 'constituency-card-body' });
      const name = el('h3', undefined, { class: 'constituency-card-name' });
      const pin = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      pin.setAttribute('aria-hidden', 'true');
      pin.append(document.createElementNS('http://www.w3.org/2000/svg','use'));
      pin.querySelector('use').setAttribute('href', '#constituency-pin');
      name.append(pin, document.createTextNode(record.name));

      const district = el('p', undefined, { class: 'constituency-card-district' });
      const districtPin = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      districtPin.setAttribute('aria-hidden', 'true');
      districtPin.append(document.createElementNS('http://www.w3.org/2000/svg','use'));
      districtPin.querySelector('use').setAttribute('href', '#constituency-pin');
      district.append(districtPin, document.createTextNode('District: ' + record.districtName));

      const action = el('button','View Constituency  \u2192',{type:'button',class:'constituency-card-action'});
      action.addEventListener('click',()=>{if(record.id==='krishnaraja'){window.location.assign('./constituency-detail.html?constituency=krishnaraja');return;}const url=record.published&&safeUrl(record.detailUrl);if(url)window.location.assign(url);else openDialog(record);});
      body.append(name,district,el('p',record.description||'Explore published constituency information.',{class:'constituency-card-description'}),action);
      card.append(art, body);
      $('Cards').append(card);
    });

    $('ResultCount').textContent=String(matches.length);
    $('Status').textContent=completeDirectory ? (matches.length+' matching '+(matches.length===1?'constituency':'constituencies')) : 'Illustrative cards and status badges. Karnataka has 224 Assembly constituencies; only the available directory records are shown.';
    const available=records.filter(r=>(!districtId||r.districtId===districtId)&&(!term||(r.name+' '+r.districtName).toLocaleLowerCase().includes(term)));
    const totals={all:available.length,published:available.filter(r=>r.published||r.previewCategory==='published').length,updates:available.filter(r=>r.updateCount||r.previewCategory==='updates').length,leadership:available.filter(r=>r.leaderCount||r.previewCategory==='leadership').length};
    document.querySelectorAll('.constituency-tabs button').forEach(tab=>{const labels={all:'All',published:'Published',updates:'Local Updates',leadership:'Leadership Info'};tab.textContent=labels[tab.dataset.category]+' ('+totals[tab.dataset.category]+')';});
    $('Empty').hidden = matches.length > 0;
    $('Cards').hidden = matches.length === 0;
  }

  function resetFilters() {
    $('DistrictFilter').value = '';
    $('Search').value = '';
    updateConstituencyOptions();
    $('Filter').value = '';
    category = 'all';
    document.querySelectorAll('.constituency-tabs button').forEach((tab, index) =>
      tab.setAttribute('aria-pressed', String(index === 0))
    );
    render();
    $('DistrictFilter').focus();
  }

  function openDialog(record) {
    $('DialogTitle').textContent = record.name;
    $('DialogContent').replaceChildren();
    $('DialogContent').append(
      el('p', `District: ${record.districtName}. Administrative constituency information is available for official verification.`),
      el('p', 'PNP organisational information is shown only after approved records are published.')
    );
    const detailUrl = safeUrl(record.detailUrl);
    if (record.published && detailUrl) $('DialogContent').append(el('a', 'Open constituency page →', { href: detailUrl }));
    if(record.isPreview)$('DialogContent').append(el('p','This card illustrates the directory layout; the status badge is a preview, not an official publication status.'),el('a','Official constituency information',{href:'https://kla.kar.nic.in/assembly/member/members.htm',target:'_blank',rel:'noopener noreferrer'}));
    if (!$('Dialog').open) $('Dialog').showModal();
  }

  function loadRecords() {
    $('Loading').hidden = false;
    $('Cards').hidden = true;

    const configured = Array.isArray(config.constituencies)
      ? config.constituencies.filter(approvedPublished)
      : [];

    if (Array.isArray(config.constituencies)) {
      completeDirectory = true;
      records = configured.map(record => {
        const district = districts.find(item => item.id === record.district_id);
        return {
          id: record.slug,
          name: record.name,
          districtId: record.district_id,
          districtName: district?.name || record.district_name || 'District not supplied',
          image: safeUrl(record.image_url) || '../../assets/hero/district-landmarks-sheet.png',
          detailUrl: safeUrl(record.canonical_url),
          description: record.description || '',
          published: true,
          updateCount: Array.isArray(record.updates) ? record.updates.filter(approvedPublished).length : 0,
          leaderCount: Array.isArray(record.leaders) ? record.leaders.filter(approvedPublished).length : 0
        };
      });
    } else {
      records = fallbackRecords.map(record => ({ ...record, published: false, isPreview:true }));
    }

    populateDistricts();
    const requestedDistrict = new URLSearchParams(location.search).get('district');
    if (districts.some(district => district.id === requestedDistrict)) {
      $('DistrictFilter').value = requestedDistrict;
    }
    updateConstituencyOptions();
    render();
    $('Loading').hidden = true;
    $('Cards').hidden = $('Cards').children.length === 0;
  }

  $('Filters').addEventListener('submit', event => {
    event.preventDefault();
    render();
  });
  $('DistrictFilter').addEventListener('change', () => {
    $('Filter').value = '';
    updateConstituencyOptions();
    render();
  });
  $('Filter').addEventListener('change', render);
  $('Search').addEventListener('input', render);
  $('Reset').addEventListener('click', resetFilters);
  $('EmptyReset').addEventListener('click', resetFilters);

  document.querySelectorAll('.constituency-tabs button').forEach(tab => {
    tab.addEventListener('click', () => {
      category = tab.dataset.category;
      document.querySelectorAll('.constituency-tabs button').forEach(item =>
        item.setAttribute('aria-pressed', String(item === tab))
      );
      render();
    });
  });

  document.querySelectorAll('.constituency-view-toggle button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.constituency-view-toggle button').forEach(item => {
        item.classList.toggle('is-active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      $('Cards').classList.toggle('is-list', button.dataset.view === 'list');
    });
  });

  $('DialogClose').addEventListener('click', () => $('Dialog').close());
  $('Dialog').addEventListener('click', event => {
    if (event.target === $('Dialog')) $('Dialog').close();
  });

  loadRecords();
})();
