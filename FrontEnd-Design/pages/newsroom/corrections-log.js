/* Only approved public corrections belong in this client-facing data source. */
(() => {
 'use strict';
 const body=document.getElementById('publicCorrectionsBody');if(!body)return;
 const corrections=[]; // Only approved public CMS correction records belong here.
 // Reference-design fixtures are separate from actual publication history.
 const previewCorrections=[
  {id:'preview-01',title:'About PNP',summary:'Updated district name in content',correctedAt:'2026-11-18T12:00:00+05:30',location:'About PNP',contentUrl:'../About%20PNP/index.html',originalText:'District label in the sample content.',correctedText:'Revised district label in the sample content.'},
  {id:'preview-02',title:'Press release',summary:'Fixed date in press release',correctedAt:'2026-11-12T12:00:00+05:30',location:'Newsroom',contentUrl:'./newsroom.html#newsroomDirectory',originalText:'Publication date in the sample press release.',correctedText:'Revised publication date in the sample press release.'},
  {id:'preview-03',title:'Policy chart',summary:'Corrected a data entry in chart',correctedAt:'2026-11-05T12:00:00+05:30',location:'Policy Hub',contentUrl:'../manifesto/manifesto.html',originalText:'Data entry in the sample chart.',correctedText:'Revised data entry in the sample chart.'}
 ];
 const approved=corrections.filter(record=>record.public===true&&record.status==='published'&&record.summary&&record.correctedAt&&record.location);
 const isPreview=approved.length===0;
 const records=isPreview?previewCorrections:approved;
 if(isPreview){
  const label=document.createElement('span');label.className='corrections-preview-label';label.textContent='Design preview';
  body.closest('.corrections-table-surface').prepend(label);
 }
 if(!records.length)return;
 body.replaceChildren();
 const dialog=document.createElement('dialog');dialog.className='correction-details-dialog';dialog.setAttribute('aria-labelledby','correctionDetailsTitle');
 dialog.innerHTML='<button type="button" class="correction-details-close" aria-label="Close correction details">×</button><h2 id="correctionDetailsTitle">Correction Details</h2><div class="correction-details-content"></div>';
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());document.body.append(dialog);
 const format=new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'});
 function publicUrl(value){try{const url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}}
 records.forEach((record,index)=>{
  const date=new Date(record.correctedAt);if(Number.isNaN(date.getTime()))return;
  const row=document.createElement('tr');
  [String(index+1).padStart(2,'0'),record.summary,format.format(date),record.location].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell);});
  const details=document.createElement('td');const button=document.createElement('button');button.type='button';button.className='corrections-detail-button';button.innerHTML='View Details <span aria-hidden="true">→</span>';button.setAttribute('aria-label',`View correction details: ${record.summary}`);
  button.addEventListener('click',()=>{
   const content=dialog.querySelector('.correction-details-content');content.replaceChildren();
   [[record.title||'Affected content',record.summary],['Corrected on',format.format(date)],['Published at',record.location],['Original content',record.originalText],['Corrected content',record.correctedText]].forEach(([label,text])=>{if(!text)return;const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=label+': ';p.append(strong,document.createTextNode(text));content.append(p);});
   const url=publicUrl(record.contentUrl);if(url){const link=document.createElement('a');link.href=url;link.textContent='View corrected content →';content.append(link);}
   if(isPreview){const note=document.createElement('p');note.className='corrections-preview-note';note.textContent='Illustrative correction entry for this design; not an actual publication history record.';content.append(note);}dialog.showModal();
  });
  details.append(button);row.append(details);body.append(row);
 });
})();

