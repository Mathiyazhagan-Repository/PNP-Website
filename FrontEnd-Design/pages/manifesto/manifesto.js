/* CMS-ready issue metadata; no official policy commitments or publication metadata invented. */
(() => {
'use strict';
const icons={jobs:'M3 7h18v14H3ZM8 7V3h8v4M3 12h18M10 11v3h4v-3',education:'m2 8 10-5 10 5-10 5L2 8Zm4 3v7q6 5 12 0v-7M22 8v9',farmers:'M12 22V9M12 16C3 16 2 10 2 5c7 0 10 4 10 11ZM12 13C12 4 17 2 22 2c0 7-3 11-10 11Z',women:'M7 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM1 22v-3a6 6 0 0 1 12 0v3ZM15 14q7-1 8 5v3h-7',health:'M12 21S0 14 2 7q3-7 10-1 7-6 10 1 2 7-10 14ZM12 7v9M8 11h8',cities:'M2 22V8h6v14M8 22V2h8v20M16 22V10h6v12M5 12v1M5 16v1M11 6h2M11 10h2M11 14h2M19 14v2M1 22h22'};
const issues=[
{slug:'jobs',title:'Jobs',keywords:'employment work skills livelihoods',image:'news-public.png',accent:'#1f5599'},
{slug:'education',title:'Education',keywords:'schools learning students teachers',image:'policy-education-campus.png',accent:'#0756b1'},
{slug:'farmers',title:'Farmers',keywords:'agriculture farming rural crops',image:'news-programme.png',accent:'#239833'},
{slug:'women',title:'Women',keywords:'women participation equality opportunity',image:'story-volunteer.png',accent:'#c2185b'},
{slug:'health',title:'Health',keywords:'healthcare wellbeing care hospitals',image:'news-press.png',accent:'#d20b59'},
{slug:'cities',title:'Cities',keywords:'urban infrastructure transport development',image:'statistics-parliament.png',accent:'#166b80'}];
const grid=document.getElementById('policyIssues'),search=document.getElementById('policySearch'),filter=document.getElementById('policyIssueFilter');
function render(){const term=search.value.trim().toLocaleLowerCase();const matches=issues.filter(issue=>(!filter.value||issue.slug===filter.value)&&`${issue.title} ${issue.keywords}`.toLocaleLowerCase().includes(term));grid.replaceChildren();matches.forEach(issue=>{const card=document.createElement('a');card.className='policy-issue-card';card.href=`./policy-detail.html?issue=${issue.slug}`;card.style.setProperty('--issue-accent',issue.accent);card.setAttribute('aria-label',`View ${issue.title} policy information`);const image=document.createElement('img');image.src=`../../assets/hero/${issue.image}`;image.alt='';image.loading='lazy';card.append(image);const label=document.createElement('span');label.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[issue.slug]}"/></svg>`;label.append(document.createTextNode(issue.title));const chevron=document.createElement('b');chevron.textContent='›';chevron.setAttribute('aria-hidden','true');label.append(chevron);card.append(label);grid.append(card);});document.getElementById('policyResultCount').textContent=`${matches.length} ${matches.length===1?'issue':'issues'} found`;document.getElementById('policyNoResults').hidden=matches.length>0;}
search.addEventListener('input',render);filter.addEventListener('change',render);const form=document.getElementById('policySearchForm');form.addEventListener('submit',event=>event.preventDefault());form.addEventListener('reset',()=>setTimeout(render,0));render();
// Languages and PDF metadata can be replaced by approved CMS document records.
const documents=[{language:'English'},{language:'Hindi'},{language:'Kannada'},{language:'Telugu'},{language:'Tamil'},{language:'State Language',confirmationPending:true}];
const documentGrid=document.getElementById('manifestoDocuments');documents.forEach(doc=>{const tile=document.createElement('div');tile.className='manifesto-document-card';tile.setAttribute('aria-label',`${doc.language} manifesto PDF unavailable, pending approval`);tile.innerHTML='<svg viewBox="0 0 32 42" aria-hidden="true"><path d="M5 1h15l9 9v30H5Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19 1v11h10" fill="none" stroke="currentColor" stroke-width="2"/><rect y="20" width="32" height="15" rx="2" fill="currentColor"/><text x="16" y="31" text-anchor="middle" font-size="10" font-weight="800" fill="white">PDF</text></svg><div><strong></strong><span></span><small>PDF pending</small><small>Version pending</small></div>';tile.querySelector('strong').textContent=doc.language;tile.querySelector('span').textContent=doc.confirmationPending?'Pending confirmation':'PDF pending';tile.querySelector('small').textContent=doc.confirmationPending?'PDF pending':'Publication pending approval';documentGrid.append(tile);});
const dialog=document.getElementById('policyPlannedDialog');document.querySelectorAll('[data-planned]').forEach(button=>button.addEventListener('click',()=>{const charter=button.dataset.planned==='charter';if(charter&&document.getElementById('cleanStateCharter')){document.getElementById('cleanStateCharter').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;}if(!charter&&document.getElementById('suggestPolicy')){window.PNPPolicySuggestionDrawer?.open();return;}document.getElementById('plannedTitle').textContent=charter?'Clean State Charter':'Suggest a Policy';document.getElementById('plannedCopy').textContent=charter?'The Clean State Charter is a planned feature. Approved charter information and documents will be available after publication.':'Citizen policy suggestions are planned for a future phase. Submissions will open once the consent, spam protection and moderation systems are ready.';dialog.showModal();}));dialog.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>dialog.close()));
// Download URLs, versions and dates remain unset until approved documents are supplied.
const libraryRecords=[
 {slug:'full',title:'PNP Full Manifesto',summary:'The complete manifesto of Praja Nishchaya Party.',accent:'#1469b8'},
 ...issues.map(issue=>({slug:issue.slug,title:issue.slug==='jobs'?'Jobs & Employment Manifesto':`${issue.title} Manifesto`,summary:`Issue-wise information on ${issue.title.toLowerCase()}.`,accent:issue.accent}))
];
const languages={en:'English',hi:'Hindi',kn:'Kannada',ta:'Tamil',te:'Telugu'};
// Document titles remain in English until reviewed translations are supplied.
const libraryList=document.getElementById('manifestoDocumentList');
const typeFilter=document.getElementById('manifestoType');
const languageButtons=[...document.querySelectorAll('[data-manifesto-language]')];
let selectedLanguage='en';
function renderLibrary(){
 const matching=libraryRecords.filter(record=>!typeFilter.value||record.slug===typeFilter.value);
 libraryList.replaceChildren();
 matching.forEach((record,index)=>{
  const row=document.createElement('article');row.className='manifesto-library-row';row.style.setProperty('--library-row-order',index);row.style.setProperty('--doc-accent',record.accent);
  row.innerHTML='<svg class="library-pdf-icon" viewBox="0 0 30 38" aria-hidden="true"><path d="M3 1h14l10 10v26H3ZM17 1v11h10"/><text x="15" y="28" text-anchor="middle" font-size="9" font-weight="800" fill="currentColor" stroke="none">PDF</text></svg><div class="library-document-name"><h3></h3></div><p class="library-row-summary"></p><div class="library-row-metadata"><span><b>Version:</b> pending &nbsp; | &nbsp; <b>Size:</b> pending</span><span><b>Publication:</b> pending approval</span></div><button class="library-row-download" type="button" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v13m-5-5 5 5 5-5M3 16v6h18v-6"/></svg>Download PDF</button>';
  row.querySelector('h3').textContent=record.title;
  row.querySelector('.library-row-summary').textContent=record.summary;
  const lang=document.createElement('small');lang.textContent=languages[selectedLanguage];row.querySelector('.library-row-summary').prepend(lang);
  if(record.slug!=='full'){
   const icon=document.createElement('span');icon.className='library-topic-icon';icon.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[record.slug]}"/></svg>`;
   row.querySelector('.library-document-name').prepend(icon);
  }
  const button=row.querySelector('button');button.setAttribute('aria-label',`${record.title} in ${languages[selectedLanguage]}: PDF pending approval`);button.title=`${languages[selectedLanguage]} PDF not yet available`;
  row.setAttribute('aria-label',`${record.title}, ${languages[selectedLanguage]}, awaiting publication`);
  libraryList.append(row);
 });
 languageButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.manifestoLanguage===selectedLanguage)));
 document.getElementById('manifestoLibraryStatus').textContent=`${matching.length} ${languages[selectedLanguage]} ${matching.length===1?'document':'documents'}. PDFs pending approval.`;
}
if(libraryList){typeFilter.addEventListener('change',renderLibrary);languageButtons.forEach(button=>button.addEventListener('click',()=>{selectedLanguage=button.dataset.manifestoLanguage;renderLibrary();}));renderLibrary();}
const librarySection=document.getElementById('manifestoLibrary');
if(librarySection && window.IntersectionObserver && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 librarySection.classList.add('library-motion-ready');
 const libraryObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){librarySection.classList.add('library-motion-visible');libraryObserver.unobserve(librarySection);}});},{threshold:.1});
 libraryObserver.observe(librarySection);
 librarySection.addEventListener('focusin',()=>librarySection.classList.add('library-motion-visible'));
}
})();






