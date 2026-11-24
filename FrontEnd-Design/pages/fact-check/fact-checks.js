(() => {
  'use strict';
  const $ = id => document.getElementById('fd' + id), config = window.PNPFactCheck || {};
  const asset = '../../assets/hero/';
  const examples = [
    ['Sample fact-check article: illustrative policy topic review.', 'A placeholder summary of the public claim or topic.', 'Policy Topic', '2025-03-15', 'our-vision-reference.png'],
    ['Review article: Sample public claim analysis', 'A short, illustrative summary of the claim being reviewed.', 'Public Claim Review', '2025-03-10', 'fact-check-hero-art.png'],
    ['Design preview content: Illustrative topic in focus', 'A placeholder summary for design demonstration.', 'Context Article', '2025-03-08', 'news-public.png'],
    ['Sample article: A broader context review', 'An illustrative summary of the topic under discussion.', 'Under Review Topic', '2025-03-01', 'fact-check-hero-art.png']
  ].map((r,i) => ({id:'preview-'+i,title:r[0],summary:r[1],topic:r[2],date:r[3],image:asset+r[4],language:'en',preview:true,tone:i,sources:[]}));
  let records=[], page=1, preview=false, failed=false;
  const size=8;
  function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function safe(value){try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}}
  function language(){return document.getElementById('languageSelect')?.value||'en';}
  function date(value){return new Intl.DateTimeFormat({en:'en-US',kn:'kn-IN',hi:'hi-IN',ta:'ta-IN',te:'te-IN'}[language()]||'en-US',{month:'short',day:'2-digit',year:'numeric',timeZone:'UTC'}).format(new Date(value));}
  function published(input){return (Array.isArray(input)?input:[]).filter(r=>r&&r.approved===true&&r.publication_status==='published'&&typeof r.id==='string'&&typeof(r.title||r.headline)==='string'&&Number.isFinite(Date.parse(r.publication_date||r.updated_at))&&typeof r.claim_text==='string'&&r.claim_text.trim()&&typeof r.finding_explanation==='string'&&r.finding_explanation.trim()&&Array.isArray(r.sources)&&r.sources.some(s=>s.title&&safe(s.url))).map((r,i)=>({id:r.id,title:r.title||r.headline,summary:r.summary||'',topic:r.topic||r.category||'Fact Check',date:r.publication_date||r.updated_at,language:r.language||'en',image:safe(r.image_url)||asset+'fact-check-hero-art.png',sources:r.sources.filter(s=>s.title&&safe(s.url)),claim:r.claim_text,finding:r.finding_explanation,label:r.finding_label||'Published finding',url:safe(r.canonical_url),tone:i%4}));}
  function show(r){
    if(r.preview){location.href="./fact-check-detail.html?preview=1&id="+encodeURIComponent(r.id);return;}
    if(r.url){location.href=r.url;return;}
    $('DialogTitle').textContent=r.title;$('DialogType').textContent=r.preview?'ILLUSTRATIVE DESIGN PREVIEW':r.topic;$('DialogContent').replaceChildren();
    const content=$('DialogContent');
    if(r.preview){content.append(el('p','This fictional article demonstrates the directory design. It is not an official fact check, finding or source record.'),el('p','Sample publication date: '+date(r.date)),el('h3','Claim (sample)'),el('p',r.summary),el('h3','Evidence and sources'),el('p','Approved evidence, references and findings will appear with published articles. No official claim or verdict is presented in this preview.'));}
    else{content.append(el('p','Published: '+date(r.date)),el('h3','Claim being examined'),el('p',r.claim),el('h3',r.label),el('p',r.finding),el('h3','Sources and references'));const list=el('ul');r.sources.forEach(s=>{const li=el('li'),a=el('a',s.title);a.href=safe(s.url);a.target='_blank';a.rel='noopener noreferrer';li.append(a);list.append(li);});content.append(list);}
    $('Dialog').showModal();
  }
  function render(){
    const term=$('Search').value.trim().toLocaleLowerCase();
    const list=records.filter(r=>r.language===language()&&(!$('Topic').value||r.topic===$('Topic').value)&&(!$('Year').value||String(new Date(r.date).getUTCFullYear())===$('Year').value)&&(!term||(r.title+' '+r.summary+' '+r.topic).toLocaleLowerCase().includes(term))).sort((a,b)=>$('Sort').value==='title'?a.title.localeCompare(b.title):$('Sort').value==='oldest'?Date.parse(a.date)-Date.parse(b.date):Date.parse(b.date)-Date.parse(a.date));
    const pages=Math.max(1,Math.ceil(list.length/size));page=Math.min(page,pages);$('Rows').replaceChildren();
    list.slice((page-1)*size,page*size).forEach(r=>{
      const row=el('tr'),article=el('td'),wrap=el('div',undefined,'fd-article'),img=el('img',undefined,'fd-thumb '+(r.tone===3?'magnifier':r.tone===1?'books':''));img.src=r.image;img.alt='';img.loading='lazy';const text=el('div');text.append(el('h2',r.title),el('p',(r.preview?'Claim (sample): ':'')+r.summary));wrap.append(img,text);article.append(wrap);
      const topic=el('td');topic.append(el('span',r.topic,'fd-topic tone-'+r.tone));const source=el('td');if(r.preview)source.append(el('span','Sample Reference','fd-source'));else{const a=el('a',r.sources[0].title,'fd-source');a.href=safe(r.sources[0].url);a.target='_blank';a.rel='noopener noreferrer';source.append(a);}
      const action=el('td'),button=el('button','Read Full Fact Check \u2192','fd-read');button.type='button';button.setAttribute('aria-label','Read '+r.title);button.addEventListener('click',()=>show(r));action.append(button);row.append(article,topic,el('td',date(r.date),'fd-date'),source,action);$('Rows').append(row);
    });
    $('Count').textContent=list.length+' fact '+(list.length===1?'check':'checks')+' found'+(preview?' (sample directory)':'');$('PreviewNote').hidden=!preview;$('Empty').hidden=!!list.length;$('EmptyText').textContent=failed?'The content service could not be reached. Please try again.':'Try a different keyword, topic or year. Only approved articles appear in the live directory.';$('Retry').hidden=!failed;$('Pagination').hidden=pages<=1;$('Page').textContent='Page '+page+' of '+pages;$('Previous').disabled=page===1;$('Next').disabled=page===pages;
  }
  function options(){[['Topic',[...new Set(records.map(r=>r.topic))].sort()],['Year',[...new Set(records.map(r=>String(new Date(r.date).getUTCFullYear())))].sort().reverse()]].forEach(([id,values])=>{const select=$(id);while(select.options.length>1)select.remove(1);values.forEach(v=>{const o=el('option',v);o.value=v;select.append(o);});});}
  function reset(){ $('Filters').reset();page=1;render(); }
  async function load(){failed=false;try{let data=config;const endpoint=config.directoryEndpoint||config.endpoint;if(endpoint){const url=safe(endpoint);if(!url||new URL(url).origin!==location.origin)throw Error('Invalid endpoint');const response=await fetch(url,{credentials:'same-origin',headers:{Accept:'application/json'}});if(!response.ok)throw Error('Unavailable');data=await response.json();}preview=config.directoryPreview===true||(!endpoint&&!Array.isArray(config.factChecks)&&config.directoryPreview!==false);records=preview?examples:published(data.factChecks);options();render();}catch{preview=false;failed=true;records=[];render();}}
  $('Filters').addEventListener('submit',e=>{e.preventDefault();page=1;render();});$('Search').value=new URLSearchParams(location.search).get('q')||'';$('Search').addEventListener('input',()=>{page=1;render();});['Topic','Year','Sort'].forEach(id=>$(id).addEventListener('change',()=>{page=1;render();}));$('Reset').addEventListener('click',reset);$('EmptyReset').addEventListener('click',reset);$('Retry').addEventListener('click',load);$('Previous').addEventListener('click',()=>{page--;render();});$('Next').addEventListener('click',()=>{page++;render();});$('Close').addEventListener('click',()=>$('Dialog').close());document.getElementById('languageSelect')?.addEventListener('change',()=>{page=1;render();});load();
})();
