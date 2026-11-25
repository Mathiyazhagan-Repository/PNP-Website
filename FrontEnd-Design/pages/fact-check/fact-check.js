(() => {
  'use strict';
  const $=id=>document.getElementById('fc'+id);
  if(!$('SearchForm'))return;
  const config=window.PNPFactCheck||{};
  const categories={factChecks:'Fact Checks',faqs:'Frequently Asked Questions',clarifications:'Official Clarifications'};
  let data={factChecks:[],faqs:[],clarifications:[]},category='all',requested=false,failed=false,limit=12;
  const el=(tag,text,attrs={})=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;};
  function safe(value){try{if(!value||typeof value!=='string')return null;const u=new URL(value,location.href);return !u.username&&!u.password&&(u.protocol==='https:'||u.origin===location.origin)?u.href:null;}catch{return null;}}
  function language(){return document.getElementById('languageSelect')?.value||'en';}
  const validDate=value=>typeof value==='string'&&!Number.isNaN(new Date(value).getTime());
  function date(value){return validDate(value)?new Intl.DateTimeFormat({en:'en-IN',kn:'kn-IN',hi:'hi-IN',ta:'ta-IN',te:'te-IN'}[language()]||'en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value)):'';}
  function publicRecords(input,type){return (Array.isArray(input)?input:[]).filter(r=>r?.approved===true&&r.publication_status==='published'&&typeof r.id==='string'&&validDate(r.publication_date||r.updated_at)&&Array.isArray(r.sources)&&r.sources.some(s=>typeof s.title==='string'&&safe(s.url))&&(type==='faqs'?typeof r.question==='string'&&typeof r.answer==='string':typeof(r.headline||r.title)==='string')&&(type!=='factChecks'||(typeof r.claim_text==='string'&&r.claim_text.trim()&&typeof r.finding_explanation==='string'&&r.finding_explanation.trim()))).map(r=>({
    id:r.id,type,category:typeof r.category==='string'?r.category.trim():'',subject:typeof r.topic==='string'?r.topic.trim():'',topic:typeof r.category==='string'?r.category.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-'):'',title:type==='faqs'?r.question:r.headline||r.title,answer:type==='faqs'?r.answer:'',summary:r.summary||'',language:r.language||'en',publication_date:r.publication_date||r.updated_at,updated_at:r.updated_at,canonical_url:safe(r.canonical_url),sources:r.sources.filter(s=>s.title&&safe(s.url)).map(s=>({title:s.title,url:safe(s.url),publisher:s.publisher||'',date:s.publication_date})),claim:r.claim_text||'',claim_source:safe(r.claim_source_url),finding_label:r.finding_label||'',finding_explanation:r.finding_explanation||'',sections:Array.isArray(r.evidence_sections)?r.evidence_sections.filter(s=>typeof s.heading==='string'&&typeof s.text==='string'):[],corrections:Array.isArray(r.corrections)?r.corrections.filter(c=>c.approved===true&&validDate(c.date)&&typeof c.summary==='string'):[],related_url:safe(r.related_url)
  }));}
  const filterIds = ['FilterCategory', 'FilterFrom', 'FilterTo', 'FilterTopic', 'FilterType'];
  const filterFields = filterIds.map($);
  const standardFaqs = [
    ['pnp', 'general', 'What is Praja Nishchaya Party (PNP)?', 'Praja Nishchaya Party (PNP) is a people-centric political party focused on good governance, transparent politics and the development of Karnataka.', '../About%20PNP/index.html'],
    ['membership', 'membership', 'How can I become a PNP member?', 'Open the Join PNP page to review the membership information and start registration.', '../membership/join.html'],
    ['membership-fee', 'membership', 'Is there a membership fee?', 'Check the Join PNP page for current membership terms before starting your registration.', '../membership/join.html'],
    ['events', 'events', 'How do I register for an event?', 'Open Events, select the event you want to attend, and use its registration or RSVP option if available.', '../events/events.html'],
    ['receipts', 'donations', 'Where can I find donation receipts?', 'Open the Donation Receipt page for receipt information.', '../donate/donation-receipt.html'],
    ['volunteer', 'volunteers', 'How can I volunteer for PNP activities?', 'Open the Volunteer Portal to review available ways to volunteer and register your interest.', '../volunteer/volunteer.html'],
    ['districts', 'general', 'How do I explore district updates?', 'Open the district directory and select your district to find local information and updates.', '../districts/districts.html']
  ].map(([id, topic, title, answer, url]) => ({
    id: 'site-faq-' + id, type: 'faqs', topic, category: topic[0].toUpperCase() + topic.slice(1),
    title, answer, subject: ({pnp:'Party information', membership:'Registration', 'membership-fee':'Membership terms', events:'Event registration', receipts:'Receipts', volunteer:'Volunteering', districts:'District updates'})[id], related_url: safe(url), language: 'en', sources: []
  }));

  function updateFacets() {
    const records = Object.values(data).flat().filter(record => record.language === language());
    for (const [id, key] of [['FilterCategory', 'category'], ['FilterTopic', 'subject']]) {
      const select = $(id);
      const selected = select.value;
      const values = [...new Set(records.map(record => record[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      select.replaceChildren(el('option', key === 'category' ? 'All categories' : 'All topics', {value: ''}),
        ...values.map(value => el('option', value, {value})));
      select.value = values.includes(selected) ? selected : '';
    }
  }

  function matchesFilters(record) {
    const [categoryValue, from, to, topic, type] = filterFields.map(field => field.value);
    const published = validDate(record.publication_date) ? new Date(record.publication_date).toISOString().slice(0, 10) : '';
    return (!categoryValue || record.category === categoryValue) &&
      (!topic || record.subject === topic) &&
      (!type || record.type === type) &&
      (!from || (published && published >= from)) &&
      (!to || (published && published <= to));
  }

  filterFields.forEach(field => field.addEventListener('change', () => search(false)));
  $('FilterReset').addEventListener('click', resetSearch);
  function resetSearch() {
    category = 'all';
    $('Search').value = '';
    filterFields.forEach(field => { field.value = ''; });
    search(false);
    $('Search').focus();
  }

  function withSiteFaqs(records) {
    const publishedQuestions = new Set(records.filter(record => record.language === 'en')
      .map(record => record.title.trim().toLowerCase()));
    return [...standardFaqs.filter(record => !publishedQuestions.has(record.title.toLowerCase())), ...records];
  }

  function sourceList(content,r){content.append(el('h3','Sources'));const list=el('ul');r.sources.forEach(s=>{const li=el('li'),link=el('a',s.title,{href:s.url,target:'_blank',rel:'noopener noreferrer'});li.append(link);if(s.publisher||validDate(s.date))li.append(el('span',' — '+[s.publisher,date(s.date)].filter(Boolean).join(' · ')));list.append(li);});content.append(list);}
  function show(r){if(r.canonical_url){window.location.assign(r.canonical_url);return;}$('DialogType').textContent=categories[r.type];$('DialogTitle').textContent=r.title;const content=$('DialogContent');content.replaceChildren(el('p','Published: '+date(r.publication_date)+(validDate(r.updated_at)?' · Updated: '+date(r.updated_at):'')));
    if(r.type==='factChecks'){if(r.claim){content.append(el('h3','Claim being examined'),el('p',r.claim));if(r.claim_source)content.append(el('a','Original claim source',{href:r.claim_source,target:'_blank',rel:'noopener noreferrer'}));}if(r.finding_label||r.finding_explanation)content.append(el('h3',r.finding_label||'Published finding'),el('p',r.finding_explanation||'A finding explanation has not been supplied.'));}
    if(r.summary)content.append(el('p',r.summary));r.sections.forEach(s=>content.append(el('h3',s.heading),el('p',s.text)));sourceList(content,r);if(r.corrections.length){content.append(el('h3','Corrections and updates'));r.corrections.forEach(c=>content.append(el('p',date(c.date)+' — '+c.summary)));}$('Dialog').showModal();
  }
  function faq(r){const item=el('details',undefined,{class:'fc-faq'});item.append(el('summary',r.title),el('p',r.answer));if(validDate(r.publication_date))item.append(el('small','Published: '+date(r.publication_date)));const sources=el('p');r.sources.forEach(s=>sources.append(el('a',s.title,{href:s.url,target:'_blank',rel:'noopener noreferrer'}),el('span',' ')));if(r.sources.length)item.append(sources);if(r.related_url)item.append(el('a','Related information →',{href:r.related_url}));return item;}
  const faqTopics = [...document.querySelectorAll('[data-faq-topic]')];
  let faqTopic = 'general';
  let loading = true;

  function renderFaqSection() {
    const term = $('FaqSearch').value.trim().toLocaleLowerCase();
    const records = data.faqs.filter(record => record.language === language());
    const matches = records.filter(record =>
      (faqTopic === 'general' || record.topic === faqTopic) &&
      (record.title + ' ' + record.answer).toLocaleLowerCase().includes(term)
    );
    faqTopics.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.faqTopic === faqTopic));
    });

    const columns = $('FaqColumns');
    const previous = columns.querySelector('details[open]')?.dataset.faqId;
    const openId = matches.some(record => record.id === previous) ? previous : matches[0]?.id;
    const split = matches.length === 7 ? 3 : Math.ceil(matches.length / 2);
    const groups = split === matches.length ? [matches] : [matches.slice(0, split), matches.slice(split)];
    columns.replaceChildren();
    if (matches.length) {
      groups.forEach(group => {
        const column = el('div', undefined, {class: 'fc-faq-column'});
        group.forEach(record => {
          const item = faq(record);
          item.dataset.faqId = record.id;
          item.open = record.id === openId;
          column.append(item);
        });
        columns.append(column);
      });
    }
    columns.hidden = !matches.length;
    const message = loading ? 'Loading frequently asked questions…' :
      failed ? 'Frequently asked questions are temporarily unavailable.' :
      !records.length ? 'No published FAQs are available in this language yet.' :
      'No FAQs match your search or category.';
    $('FaqMessage').textContent = matches.length ? '' : message;
    $('FaqMessage').hidden = Boolean(matches.length);
    $('FaqStatus').textContent = matches.length ? matches.length + ' matching FAQs' : message;
    $('FaqRetry').hidden = !failed;
  }

  $('FaqForm').addEventListener('submit', event => {
    event.preventDefault();
    renderFaqSection();
  });
  $('FaqSearch').addEventListener('input', renderFaqSection);
  faqTopics.forEach(button => button.addEventListener('click', () => {
    faqTopic = button.dataset.faqTopic;
    renderFaqSection();
  }));
  $('FaqRetry').addEventListener('click', load);

  function schema(faqs=[]){document.getElementById('fcFaqSchema')?.remove();if(!faqs.length)return;const script=el('script',JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',inLanguage:language(),mainEntity:faqs.map(r=>({'@type':'Question',name:r.title,acceptedAnswer:{'@type':'Answer',text:r.answer}}))}),{id:'fcFaqSchema',type:'application/ld+json'});document.head.append(script);}
  function render(){const term=$('Search').value.trim().toLocaleLowerCase(),list=Object.values(data).flat().filter(r=>r.language===language()&&matchesFilters(r)&&(category==='all'||r.type===category)&&(!term||([r.title,r.summary,r.answer,r.claim,r.category,r.subject].join(' ')).toLocaleLowerCase().includes(term)));$('Clear').hidden=!term;$('ResultsSection').hidden=!requested;$('ResultsHeading').textContent=categories[category]||'Search Results';$('Results').replaceChildren();list.slice(0,limit).forEach(r=>{if(r.type==='faqs'){$('Results').append(faq(r));return;}const card=el('article',undefined,{class:'fc-result-card'});card.append(el('span',categories[r.type]),el('h3',r.title),el('small','Published: '+date(r.publication_date)));if(r.summary)card.append(el('p',r.summary));const button=el('button',r.type==='factChecks'?'Read Fact Check →':'Read Clarification →',{type:'button'});button.addEventListener('click',()=>show(r));card.append(button);$('Results').append(card);});$('ResultStatus').textContent=list.length+' published '+(list.length===1?'result':'results');$('Empty').hidden=list.length>0;$('EmptyHeading').textContent=term?'No published information matches your search.':'No published '+(category==='all'?'information':categories[category].toLowerCase())+' available yet.';$('EmptyText').textContent=failed?'The content service could not be reached. Please try again.':'Only approved, dated and sourced content appears here. Try another category or search.';$('Retry').hidden=!failed;$('LoadMore').hidden=list.length<=limit;renderFaqSection();schema(data.faqs.filter(r=>r.language===language()&&r.sources.length));document.querySelectorAll('[data-fc-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fcCategory===category)));}
  function search(scroll){limit=12;requested=true;render();if(scroll)$('ResultsSection').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
  async function load(){failed=false;loading=true;renderFaqSection();$('LoadStatus').textContent=config.endpoint?'Loading published information…':'';try{let response=config;if(config.endpoint){const endpoint=safe(config.endpoint);if(!endpoint||new URL(endpoint).origin!==location.origin)throw Error();const result=await fetch(endpoint,{credentials:'same-origin',headers:{Accept:'application/json'}});if(!result.ok)throw Error();response=await result.json();}data={factChecks:publicRecords(response.factChecks,'factChecks'),faqs:withSiteFaqs(publicRecords(response.faqs,'faqs')),clarifications:publicRecords(response.clarifications,'clarifications')};$('LoadStatus').textContent='';loading=false;updateFacets();render();}catch{data={factChecks:[],faqs:standardFaqs,clarifications:[]};updateFacets();failed=true;loading=false;requested=true;$('LoadStatus').textContent='Published information is temporarily unavailable.';render();}}
  $('SearchForm').addEventListener('submit',e=>{e.preventDefault();search(true);});$('Search').addEventListener('input',()=>{limit=12;if($('Search').value.trim())requested=true;render();});$('Clear').addEventListener('click',()=>{$('Search').value='';render();$('Search').focus();});document.querySelectorAll('[data-fc-category]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.fcCategory==='factChecks'){location.href='./fact-checks.html';return;}category=b.dataset.fcCategory;search(true);}));$('ShowAll').addEventListener('click',()=>{category='all';search(false);});$('Reset').addEventListener('click',()=>{category='all';$('Search').value='';search(false);$('Search').focus();});$('LoadMore').addEventListener('click',()=>{limit+=12;render();});$('Retry').addEventListener('click',load);$('Close').addEventListener('click',()=>$('Dialog').close());document.getElementById('languageSelect')?.addEventListener('change',()=>{updateFacets();render();});load();
})();
