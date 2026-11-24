(() => {
  'use strict';
  const $=id=>document.getElementById('district'+id);
  if(!$('Cards'))return;
  const config=window.PNPGeography||{};
  // Administrative directory, independent of any PNP unit or appointment.
  // Source: Government of Karnataka district portal, checked 24 Nov 2026.
  const initial=window.PNPGeographyData?.districts||[];
  const popular=['bengaluru-urban','mysuru','belagavi','kalaburagi'];
  let districts=initial,all=false,selected=null;
  function el(tag,text,attrs={}){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;}
  function safe(value){try{if(!value)return null;const u=new URL(value,location.href);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
  const published=r=>r?.publication_status==='published'&&r.approved===true;
  function dialog(title,eyebrow='EXPLORE KARNATAKA'){$('DialogTitle').textContent=title;$('DialogEyebrow').textContent=eyebrow;$('DialogContent').replaceChildren();if(!$('Dialog').open)$('Dialog').showModal();return $('DialogContent');}
  function openDistrict(record){if(record.id==='mysuru'){window.location.assign('./district-detail.html?district=mysuru');return;}selected=record.id;render();const content=dialog(record.name);content.append(el('p','Explore administrative information for '+record.name+' district on its official government website.'));
    const org=(config.organisations||[]).find(r=>published(r)&&r.district_id===record.id);
    content.append(el('p',org?.name||'Local PNP organisation and leadership information has not been published for this district yet.'));
    content.append(el('a','View Constituencies \u2192',{href:'./constituencies.html?district='+encodeURIComponent(record.id),class:'district-official-link district-constituencies-link'}));
    const url=safe(record.official_url);if(url)content.append(el('a','Visit district website ↗',{href:url,target:'_blank',rel:'noopener noreferrer',class:'district-official-link'}));
  }
  function render(){const term=$('Search').value.trim().toLocaleLowerCase();const matches=districts.filter(d=>(d.name+' '+(d.local_name||'')+' '+(d.aliases||[]).join(' ')).toLocaleLowerCase().includes(term));const rows=term||all?matches:popular.map(id=>matches.find(d=>d.id===id)).filter(Boolean);$('Cards').replaceChildren();rows.forEach(d=>{const button=el('button',undefined,{type:'button',class:'district-card','aria-label':'Explore '+d.name,'aria-pressed':String(selected===d.id)});button.append(el('span',undefined,{class:'district-card-art '+(popular.includes(d.id)?d.id:'generic'),'aria-hidden':'true'}));const bottom=el('span',undefined,{class:'district-card-bottom'});bottom.append(el('span',d.name),el('span','→',{class:'district-card-arrow','aria-hidden':'true'}));button.append(bottom);button.addEventListener('click',()=>openDistrict(d));$('Cards').append(button);});$('Empty').hidden=matches.length>0;$('Clear').hidden=!term;$('Count').textContent=String(districts.length);$('ResultsHeading').textContent=term?'Search Results':all?'All Districts · A–Z':'Popular Districts';$('ResultStatus').textContent=term?matches.length+' matching district'+(matches.length===1?'':'s'):all?districts.length+' districts, listed alphabetically':'';$('ViewAll').textContent=all?'Show Popular Districts':'View All Districts →';$('ViewAll').setAttribute('aria-expanded',String(all));syncMap();}
  function reset(){$('Search').value='';render();$('Search').focus();}
  function openFinder(){const content=dialog('Find Your Constituency');const label=el('label','Choose your district',{for:'districtFinderSelect'}),select=el('select',undefined,{id:'districtFinderSelect'}),status=el('p');select.append(el('option','Select district',{value:''}));districts.forEach(d=>select.append(el('option',d.name,{value:d.id})));const clabel=el('label','Constituency',{for:'districtFinderConstituency'}),constituency=el('select',undefined,{id:'districtFinderConstituency'}),go=el('a','View constituency',{class:'district-official-link'});go.hidden=true;constituency.disabled=true;constituency.append(el('option','Select a district first',{value:''}));select.addEventListener('change',()=>{const records=(config.constituencies||[]).filter(c=>published(c)&&c.district_id===select.value&&typeof c.slug==='string'&&/^[a-z0-9-]+$/.test(c.slug));constituency.replaceChildren(el('option',records.length?'Select constituency':'No published constituency records',{value:''}));records.forEach(c=>constituency.append(el('option',c.name,{value:c.slug})));constituency.disabled=!records.length;go.hidden=true;status.textContent=records.length?'Choose a constituency to continue.':'The constituency directory for this district has not been published yet.';});constituency.addEventListener('change',()=>{const c=(config.constituencies||[]).find(c=>published(c)&&c.district_id===select.value&&c.slug===constituency.value);const href=c&&safe(c.canonical_url);go.hidden=!href;if(href){go.href=href;go.target='_blank';go.rel='noopener noreferrer';}else status.textContent='This constituency page is not available yet.';});status.textContent='Select a district to see available published constituencies.';content.append(label,select,clabel,constituency,status,go);}
  function localInformation(type){const content=dialog(type==='leaders'?'Local Leadership':'District Updates','LOCAL INFORMATION');const records=(type==='leaders'?config.leaders:config.updates)||[];const available=records.filter(r=>published(r)&&(!selected||r.district_id===selected)&&safe(r.canonical_url));if(!available.length){content.append(el('p',type==='leaders'?'Approved district leadership profiles will appear here once published.':'Published district news and events will appear here when available.'));content.append(el('a',type==='leaders'?'Browse Leadership Directory →':'Browse Newsroom →',{href:type==='leaders'?'../leadership/leadership.html':'../newsroom/newsroom.html',class:'district-official-link'}));return;}available.forEach(r=>content.append(el('p',r.name||r.title),el('a','View details →',{href:safe(r.canonical_url),target:'_blank',rel:'noopener noreferrer'})));}
  $('Search').addEventListener('input',render);$('SearchForm').addEventListener('submit',e=>{e.preventDefault();render();});$('Clear').addEventListener('click',reset);$('Reset').addEventListener('click',reset);$('ViewAll').addEventListener('click',()=>{all=!all;render();});$('CountAction').addEventListener('click',()=>{all=true;render();});  $('ConstituencyAction').addEventListener('click',()=>window.location.assign('./constituencies.html'));$('LeadershipAction').addEventListener('click',()=>window.location.assign('./local-leadership.html'+(selected?'?district='+encodeURIComponent(selected):'')));$('UpdatesAction').addEventListener('click',()=>window.location.assign('./local-updates.html'+(selected?'?district='+encodeURIComponent(selected):'')));$('DialogClose').addEventListener('click',()=>$('Dialog').close());$('Source').addEventListener('click',()=>{const content=dialog('Directory sources','GEOGRAPHIC INFORMATION');content.append(el('p','District names follow the Government of Karnataka district directory. District boundaries use the Local Government Directory 2024 snapshot, via bharatlas. All 31 districts are included. Ramanagara is displayed under its current name, Bengaluru South; the source geometry is retained.'),el('a','Government of Karnataka district portal ↗',{href:'https://karnataka.s3waas.gov.in/',target:'_blank',rel:'noopener noreferrer'}),el('p','Karnataka has 224 Assembly constituencies. Administrative geography is separate from PNP organisational units.'),el('a','Election Commission: Karnataka election announcement ↗',{href:'https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1911753&lang=2&reg=48',target:'_blank',rel:'noopener noreferrer'}),el('p','Landmark card artwork is AI-generated illustrative imagery.'));});
  async function load(){if(!config.districtsEndpoint&&!config.districts){render();return;}$('ResultStatus').textContent='Loading districts…';try{let data=config.districts;if(config.districtsEndpoint){const endpoint=safe(config.districtsEndpoint);if(!endpoint||new URL(endpoint).origin!==location.origin)throw Error();const r=await fetch(endpoint,{credentials:'same-origin',headers:{Accept:'application/json'}});if(!r.ok)throw Error();data=(await r.json()).districts;}districts=(Array.isArray(data)?data:[]).filter(d=>published(d)&&typeof d.id==='string'&&typeof d.name==='string'&&safe(d.source)).sort((a,b)=>a.name.localeCompare(b.name));all=true;render();}catch{$('ResultStatus').textContent='District records could not be loaded. Showing the government directory.';districts=initial;render();const content=dialog('District records unavailable');content.append(el('p','The published directory could not be loaded. You can continue browsing administrative district names.' ));const retry=el('button','Try again',{type:'button'});retry.addEventListener('click',()=>{$('Dialog').close();load();});content.append(retry);}}
  function syncMap(){document.querySelectorAll('.district-map-region').forEach(region=>region.setAttribute('aria-pressed',String(region.dataset.district===selected)));const current=districts.find(d=>d.id===selected);if($('MapCaption'))$('MapCaption').textContent=current?current.name:'Select a district';}
  function bindMap(map) {
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = (tag) => document.createElementNS(svgNamespace, tag);
    map.querySelector('.district-map-preview')?.remove();
    const overlay = svg('g');
    overlay.setAttribute('class', 'district-map-preview');
    overlay.setAttribute('aria-hidden', 'true');
    map.append(overlay);

    let hovered = null;
    let focused = null;

    function showDistrict() {
      overlay.replaceChildren();
      const region = hovered || focused;
      if (!region) return;

      const { x, y, width, height } = region.getBBox();
      if (!width || !height) return;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const scale = 1.24;
      const shape = svg('g');
      shape.setAttribute('class', 'district-map-preview-shape');
      shape.setAttribute('transform', `translate(${centerX} ${centerY}) scale(${scale}) translate(${-centerX} ${-centerY})`);
      region.querySelectorAll('path').forEach(path => shape.append(path.cloneNode(true)));

      const badge = svg('g');
      const background = svg('rect');
      const label = svg('text');
      label.setAttribute('class', 'district-map-preview-name');
      label.textContent = districts.find(record => record.id === region.dataset.district)?.name
        || region.querySelector('title')?.textContent || region.dataset.district;
      badge.append(background, label);
      overlay.append(shape, badge);

      const labelWidth = label.getComputedTextLength() + 30;
      const bounds = map.viewBox.baseVal;
      const labelX = Math.min(Math.max(centerX, bounds.x + labelWidth / 2), bounds.x + bounds.width - labelWidth / 2);
      const labelY = Math.max(bounds.y + 21, centerY - height * scale / 2 - 26);
      badge.setAttribute('transform', `translate(${labelX} ${labelY})`);
      background.setAttribute('class', 'district-map-preview-badge');
      background.setAttribute('x', String(-labelWidth / 2));
      background.setAttribute('y', '-20');
      background.setAttribute('width', String(labelWidth));
      background.setAttribute('height', '40');
      background.setAttribute('rx', '12');
    }

    map.querySelectorAll('.district-map-region').forEach(region => {
      const activate = () => {
        const record = districts.find(d => d.id === region.dataset.district);
        if (record) openDistrict(record);
      };
      region.addEventListener('click', activate);
      region.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
      region.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        hovered = region;
        showDistrict();
      });
      region.addEventListener('pointerleave', () => {
        if (hovered === region) hovered = null;
        showDistrict();
      });
      region.addEventListener('focus', () => {
        focused = region;
        showDistrict();
      });
      region.addEventListener('blur', () => {
        if (focused === region) focused = null;
        showDistrict();
      });
    });
  }
  const map=document.querySelector('.district-boundary-map');
  if(map)bindMap(map);
  $('MapExpand')?.addEventListener('click',()=>{const content=dialog('Karnataka Districts','SELECT A DISTRICT');const enlarged=map.cloneNode(true);enlarged.classList.add('district-map-large');bindMap(enlarged);content.append(enlarged,el('p','LGD district boundaries, 2024 snapshot. Bengaluru South uses the current district name.',{class:'district-map-source-note'}),el('a','Boundary source and attribution ?',{href:'https://bharatlas.com/layers',target:'_blank',rel:'noopener noreferrer',class:'district-map-source-note'}));syncMap();});
  const requestedDistrict=new URLSearchParams(location.search).get('district');
  const requestedRecord=initial.find(d=>d.id===requestedDistrict);
  if(requestedRecord){selected=requestedRecord.id;$('Search').value=requestedRecord.name;all=true;}
  load();
})();
