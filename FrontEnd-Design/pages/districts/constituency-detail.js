(() => {
  'use strict';
  const $=id=>document.getElementById('cd'+id);
  if(!$('Section'))return;
  const slug=new URLSearchParams(location.search).get('constituency')||'krishnaraja';
  if(slug!=='krishnaraja'){$('Section').hidden=true;$('Unavailable').hidden=false;document.title='Constituency unavailable | PNP';return;}
  const config=window.PNPGeography||{};
  const published=r=>r?.approved===true&&r.publication_status==='published'&&r.constituency_id==='krishnaraja';
  const el=(tag,text,attrs={})=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};
  function safe(value){try{if(!value)return null;const u=new URL(value,location.href);return !u.username&&!u.password&&(u.protocol==='https:'||u.origin===location.origin)?u.href:null;}catch{return null;}}
  function dialog(title,theme=''){ $('DialogTitle').textContent=title;$('DialogEyebrow').textContent='KRISHNARAJA · MYSURU';$('DialogContent').replaceChildren(); if(theme) $('Dialog').dataset.cdTheme=theme; else delete $('Dialog').dataset.cdTheme;if(!$('Dialog').open)$('Dialog').showModal();return $('DialogContent');}
  function addLink(content,text,url){const href=safe(url);if(href)content.append(el('a',text,{href,class:'cd-link'}));}
  function dialogFeature(title,text,iconId){
    const feature=el('article',undefined,{class:'cd-dialog-feature'});
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('aria-hidden','true');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href','#'+iconId);
    icon.append(use);
    const iconWrap=el('span',undefined,{class:'cd-dialog-feature-icon'});
    iconWrap.append(icon);
    const copy=el('div');
    copy.append(el('strong',title),el('p',text));
    feature.append(iconWrap,copy);
    return feature;
  }
  function facts(){const content=dialog('Constituency facts & sources');content.append(el('p','Krishnaraja is Assembly constituency no. 216 in Mysuru district. The urban classification is supported by the Karnataka Legislative Council reply cited below.'),el('a','Karnataka Legislative Assembly constituency list ↗',{href:'https://kla.kar.nic.in/assembly/member/members.htm',target:'_blank',rel:'noopener noreferrer'}),el('p',factsRecord&&safe(factsRecord.source?.url)?'Constituency demographic values use the supplied approved source.':'A verified constituency-level population and area source has not been supplied, so those values are not asserted.'),el('a','Karnataka Legislative Council: urban constituency classification ↗',{href:'https://kla.kar.nic.in/council/Replies/unstarred/22082025/usq1409%2822082025%29.pdf',target:'_blank',rel:'noopener noreferrer'}));}
  function map(){const content=dialog('Mysuru in Karnataka');content.append(el('img',undefined,{src:'../../assets/geography/karnataka-mysuru-highlight.svg',alt:'Karnataka districts, with Mysuru district highlighted',class:'cd-large-map'}),el('p','The highlight shows Mysuru district, not the exact Krishnaraja constituency boundary. District outlines use the LGD 2024 snapshot via bharatlas.'),el('a','Map source and attribution ↗',{href:'https://bharatlas.com/layers',target:'_blank',rel:'noopener noreferrer'}));}
  const titles={leadership:'Local Leadership',activities:'Ongoing Activities',news:'News & Events',resources:'Constituency Resources'};
  function open(action){if(action==='news'){window.location.assign('./local-updates.html?district=mysuru&constituency=krishnaraja');return;}if(action==='leadership'){window.location.assign('./local-leadership.html?district=mysuru');return;}const content=dialog(titles[action],action==='activities'||action==='resources'?action:'');if(action==='resources'){content.append(el('p','Official public resources for Krishnaraja and Mysuru district.'));
    const grid=el('div',undefined,{class:'cd-dialog-grid'});
    grid.append(dialogFeature('Constituency Information','Review the official Assembly constituency directory and membership records.','cd-building'),dialogFeature('Election Information','Access Mysuru district election notices and public administrative updates.','cd-government'));
    content.append(grid);
    const links=el('div',undefined,{class:'cd-dialog-links'});
    ['https://kla.kar.nic.in/assembly/member/members.htm','https://mysore.nic.in/en/election/','./district-detail.html?district=mysuru'].forEach((url,index)=>{
      const label=['Constituency directory','District election information','Mysuru district'][index];
      const href=safe(url);if(href)links.append(el('a',label+' →',{href:href.startsWith(location.origin)?href:url,class:'cd-link',...(href.startsWith(location.origin)?{}:{target:'_blank',rel:'noopener noreferrer'})}));
    });
    content.append(links);return;}
    if(action==='activities'){
      content.append(el('p','Published constituency activities will appear here when approved records are available.'));
      const grid=el('div',undefined,{class:'cd-dialog-grid'});
      grid.append(dialogFeature('No published activities','There are no approved ongoing activity records for Krishnaraja at present.','cd-handshake'),dialogFeature('Community updates','News, programmes and public meetings can be viewed from the local updates hub.','cd-news'));
      content.append(grid);
      const links=el('div',undefined,{class:'cd-dialog-links'});
      links.append(el('a','View local news & events →',{href:'./local-updates.html?district=mysuru&constituency=krishnaraja',class:'cd-link'}));
      content.append(links);return;
    }
    const collection=action==='leadership'?config.leaders:action==='activities'?config.activities:config.updates;
    const records=(Array.isArray(collection)?collection:[]).filter(published);
    if(!records.length){content.append(el('p',action==='leadership'?'Approved local leadership profiles have not been published for this constituency yet.':action==='activities'?'There are no published ongoing constituency activities at present.':'There are no published local news or event records for this constituency yet.'));addLink(content,action==='leadership'?'Browse Leadership Directory →':'Browse Newsroom →',action==='leadership'?'../leadership/leadership.html':'../newsroom/newsroom.html');return;}
    records.forEach(r=>{content.append(el('h3',r.name||r.title),el('p',r.designation||r.excerpt||r.description||''));addLink(content,'View details →',r.canonical_url);});}
  const factsRecord=(config.constituencyFacts||[]).find(published);
  if(factsRecord&&safe(factsRecord.source?.url)){
    if(Number.isSafeInteger(factsRecord.population)&&factsRecord.population>=0)$('PopulationValue').textContent=factsRecord.population.toLocaleString('en-IN');
    if(Number.isFinite(factsRecord.area_km2)&&factsRecord.area_km2>0)$('AreaValue').textContent=new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(factsRecord.area_km2)+' km²';
  }
  document.querySelectorAll('[data-cd-action]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.cdAction)));
  $('MapButton').addEventListener('click',map);$('Population').addEventListener('click',facts);$('Area').addEventListener('click',facts);$('Type').addEventListener('click',facts);$('District').addEventListener('click',()=>window.location.assign('./district-detail.html?district=mysuru'));$('Close').addEventListener('click',()=>$('Dialog').close());
})();
