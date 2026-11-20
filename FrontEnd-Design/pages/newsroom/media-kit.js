/* Media directory schema is ready for approved CMS files, rights and metadata. */
(() => {
 'use strict';
 const grid=document.getElementById('mediaKitResources');if(!grid)return;
 const resources=[
  {id:'party-profile',title:'Party Profile',type:'PDF',description:'An overview of PNP, its values, vision, organisation and key focus areas.',thumbnail:'profile'},
  {id:'leadership-biographies',title:'Leadership Biographies',type:'PDF',description:'Profiles of party leadership and office-bearers, subject to approval and consent.',thumbnail:'people'},
  {id:'photographs',title:'Approved Photographs',type:'JPG',description:'A collection for media use, with approved photography credits and usage conditions.',thumbnail:'photographs'},
  {id:'fact-sheet',title:'Fact Sheet',type:'PDF',description:'Key facts and figures about the party, initiatives and impact areas.',thumbnail:'chart'},
  {id:'achievements-dossier',title:'Achievements Dossier',type:'PDF',description:'A comprehensive summary of key initiatives, milestones and outcomes.',thumbnail:'dossier'}
 ].map(record=>({...record,languages:['English','Hindi'],fileSize:null,version:null,publishedAt:null,url:null,approvalStatus:'pending',rightsApproved:false}));
 const globe='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c-5 5-5 15 0 20 5-5 5-15 0-20Z"/></svg>';
 const file='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2h11l5 5v15H4ZM14 2v6h6M8 12h8M8 16h8"/></svg>';
 const layers='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 10 5-10 5L2 7l10-5ZM2 12l10 5 10-5M2 17l10 5 10-5"/></svg>';
 const download='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v13m-5-5 5 5 5-5M3 16v6h18v-6"/></svg>';
 function cover(title,dossier=false){return `<svg viewBox="0 0 90 95" aria-hidden="true"><rect width="90" height="95" fill="${dossier?'#dceff7':'#d6e8f5'}"/><g transform="translate(14 5) rotate(-7 30 40)"><rect x="3" y="2" width="60" height="82" rx="2" fill="#0b3765"/><rect x="7" y="0" width="60" height="82" rx="2" fill="#f9fcff" stroke="#a1b6c9"/><path d="M7 2h60v7H7Z" fill="#0d4f83"/><text x="37" y="31" text-anchor="middle" fill="#163865" font-family="Arial" font-size="16" font-weight="900">PNP</text><path d="M20 36q15-6 34 0" stroke="#fa9f17" stroke-width="2"/><path d="M20 39q15-6 34 0" stroke="#17a149" stroke-width="2"/><text x="37" y="51" text-anchor="middle" fill="#163865" font-family="Arial" font-size="6" font-weight="700">${title}</text><path d="M7 71q18-12 32-1t28-4v16H7Z" fill="${dossier?'#8bbd58':'#ffac2d'}"/><path d="M7 77q18-10 32-1t28-5v11H7Z" fill="#0d547c"/></g></svg>`;}
 resources.forEach(record=>{
  const card=document.createElement('article');card.className='media-resource-card';
  const thumbnail=document.createElement('div');thumbnail.className='media-resource-thumbnail';
  if(record.thumbnail==='profile')thumbnail.innerHTML=cover('Party Profile');
  else if(record.thumbnail==='dossier')thumbnail.innerHTML=cover('Achievements Dossier',true);
  else if(record.thumbnail==='photographs'){const image=document.createElement('img');image.src='../../assets/hero/news-statement.png';image.alt='';image.loading='lazy';thumbnail.append(image);}
  else if(record.thumbnail==='people')thumbnail.innerHTML='<svg viewBox="0 0 90 95" aria-hidden="true"><defs><linearGradient id="mediaBiographyGold" x2="1" y2="1"><stop stop-color="#fff4c8"/><stop offset="1" stop-color="#d9ad6c"/></linearGradient></defs><rect width="90" height="95" fill="url(#mediaBiographyGold)"/><g fill="#866c48"><circle cx="25" cy="35" r="10"/><circle cx="65" cy="35" r="10"/><path d="M8 77V61a17 17 0 0 1 34 0v16ZM49 77V61a17 17 0 0 1 34 0v16Z"/></g><g fill="#4c4b48"><circle cx="45" cy="28" r="12"/><path d="M24 88V62a21 21 0 0 1 42 0v26Z"/></g></svg>';
  else thumbnail.innerHTML='<svg viewBox="0 0 90 95" aria-hidden="true"><rect width="90" height="95" fill="#e8edf2"/><g transform="rotate(-9 45 48)"><rect x="10" y="5" width="70" height="85" rx="3" fill="white" stroke="#c3d5e2"/><path d="M20 18h45M20 23h34" stroke="#aac4d7" stroke-width="2"/><path d="M20 72h50" stroke="#96b5cb"/><path d="M26 69V53" stroke="#91c5d8" stroke-width="8"/><path d="M39 69V44" stroke="#36a5cb" stroke-width="8"/><path d="M52 69V33" stroke="#73b8a6" stroke-width="8"/><path d="M65 69V25" stroke="#286aaf" stroke-width="8"/><path d="M20 80h50" stroke="#c3d5e2" stroke-width="2"/></g></svg>';
  const content=document.createElement('div');content.className='media-resource-description';
  const badges=document.createElement('div');badges.className='media-resource-badges';const type=document.createElement('span');type.className='media-resource-type'+(record.type==='JPG'?' is-jpg':'');type.textContent=record.type;
  const status=document.createElement('span');status.className='media-resource-status';status.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 5v8l4 3"/></svg>';status.append(document.createTextNode('Pending approval'));badges.append(type,status);
  const title=document.createElement('h3');title.textContent=record.title;const description=document.createElement('p');description.textContent=record.description;content.append(badges,title,description);
  const footer=document.createElement('div');footer.className='media-resource-footer';const meta=document.createElement('div');meta.className='media-resource-meta';
  [[globe,record.languages.join(', ')],[file,record.fileSize||'File pending'],[layers,record.version||'Version pending']].forEach(([icon,text])=>{const item=document.createElement('span');item.innerHTML=icon;item.append(document.createTextNode(text));meta.append(item);});
  const canDownload=record.approvalStatus==='approved'&&record.url&&record.rightsApproved;
  const button=document.createElement(canDownload?'a':'button');button.className='media-resource-download';button.innerHTML=download+'Download';
  if(canDownload){button.href=record.url;button.setAttribute('download','');}else{button.type='button';button.disabled=true;button.title='Approved file not yet available';button.setAttribute('aria-label',`${record.title}: download pending approval`);}
  footer.append(meta,button);card.append(thumbnail,content,footer);grid.append(card);
 });
})();
