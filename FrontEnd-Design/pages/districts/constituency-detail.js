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
  function dialog(title){$('DialogTitle').textContent=title;$('DialogContent').replaceChildren();if(!$('Dialog').open)$('Dialog').showModal();return $('DialogContent');}
  function addLink(content,text,url){const href=safe(url);if(href)content.append(el('a',text,{href,class:'cd-link'}));}
  function facts(){const content=dialog('Constituency facts & sources');content.append(el('p','Krishnaraja is Assembly constituency no. 216 in Mysuru district. The urban classification is supported by the Karnataka Legislative Council reply cited below.'),el('a','Karnataka Legislative Assembly constituency list ↗',{href:'https://kla.kar.nic.in/assembly/member/members.htm',target:'_blank',rel:'noopener noreferrer'}),el('p',factsRecord&&safe(factsRecord.source?.url)?'Constituency demographic values use the supplied approved source.':'A verified constituency-level population and area source has not been supplied, so those values are not asserted.'),el('a','Karnataka Legislative Council: urban constituency classification ↗',{href:'https://kla.kar.nic.in/council/Replies/unstarred/22082025/usq1409%2822082025%29.pdf',target:'_blank',rel:'noopener noreferrer'}));}
  function map(){const content=dialog('Mysuru in Karnataka');content.append(el('img',undefined,{src:'../../assets/geography/karnataka-mysuru-highlight.svg',alt:'Karnataka districts, with Mysuru district highlighted',class:'cd-large-map'}),el('p','The highlight shows Mysuru district, not the exact Krishnaraja constituency boundary. District outlines use the LGD 2024 snapshot via bharatlas.'),el('a','Map source and attribution ↗',{href:'https://bharatlas.com/layers',target:'_blank',rel:'noopener noreferrer'}));}
  const titles={leadership:'Local Leadership',activities:'Ongoing Activities',news:'News & Events',resources:'Constituency Resources'};
  function open(action){if(action==='leadership'){window.location.assign('./local-leadership.html?district=mysuru');return;}const content=dialog(titles[action]);if(action==='resources'){content.append(el('p','Official public resources for Krishnaraja and Mysuru district.'));addLink(content,'Constituency facts →','https://kla.kar.nic.in/assembly/member/members.htm');addLink(content,'District election information →','https://mysore.nic.in/en/election/');addLink(content,'Mysuru District →','./district-detail.html?district=mysuru');return;}
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
