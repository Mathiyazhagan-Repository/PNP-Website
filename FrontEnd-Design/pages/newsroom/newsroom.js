/* Reference-layout previews, isolated from future approved CMS article records. */
(() => {
 'use strict';
 document.querySelectorAll('a[href="#newsroomDirectory"]').forEach(link=>link.addEventListener('click',event=>{const target=document.getElementById('newsroomDirectory');if(!target)return;event.preventDefault();target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}));
 const records=[
  {preview:'1',title:'PNP Strengthens People’s Voice Across Karnataka',category:'press-release',categoryLabel:'Press Release',language:'en',district:'bengaluru-urban',tags:['pnp-updates','karnataka'],image:'story-community.png',keywords:'citizens grassroots public participation'},
  {preview:'2',title:'PNP’s Vision for a Progressive Tomorrow',category:'news',categoryLabel:'News',language:'en',district:'statewide',tags:['development','karnataka'],image:'news-statement.png',keywords:'vision progress development'},
  {preview:'3',title:'Party Leaders Hold Strategic Review Meet',category:'statement',categoryLabel:'Statement',language:'en',district:'mysuru',tags:['leadership','pnp-updates'],image:'news-public.png',keywords:'leaders strategy review meeting'}
 ];
 // Featured previews rotate independently of the article directory filters.
 const feature=document.querySelector('.press-feature');
 if(feature&&records.length>1){
  const photo=feature.querySelector('.press-feature-photo');
  const copy=feature.querySelector('.press-feature-copy');
  const headline=copy.querySelector('h3');
  const action=feature.querySelector('.press-feature-arrow');
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,changing=false,paused=motion.matches,inView=true,timer;
  feature.setAttribute('aria-roledescription','carousel');
  feature.setAttribute('aria-label','Featured newsroom previews');
  const pause=document.createElement('button');pause.type='button';pause.className='press-feature-pause';
  const pagination=document.createElement('div');pagination.className='press-feature-pagination';pagination.setAttribute('role','group');pagination.setAttribute('aria-label','Choose featured news');
  const dots=records.map((record,index)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',`Show featured preview ${index+1}: ${record.title}`);dot.addEventListener('click',()=>{showFeature(index);restart();});pagination.append(dot);return dot;});
  feature.append(pause,pagination);
  function updatePause(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Play featured news rotation':'Pause featured news rotation');pause.setAttribute('aria-pressed',String(paused));}
  function renderFeature(index){current=(index+records.length)%records.length;const record=records[current];photo.src=`../../assets/hero/${record.image}`;photo.alt=`AI-generated illustration for ${record.title}`;headline.textContent=record.title;action.href=`./news-detail.html?preview=${encodeURIComponent(record.preview)}`;action.setAttribute('aria-label',`Read featured article preview: ${record.title}`);dots.forEach((dot,index)=>dot.setAttribute('aria-current',String(index===current)));}
  function showFeature(index){if(changing||index===current)return;if(motion.matches){renderFeature(index);return;}changing=true;feature.classList.add('press-feature-changing');setTimeout(()=>{renderFeature(index);feature.classList.remove('press-feature-changing');changing=false;},250);}
  function restart(){clearInterval(timer);if(paused)return;timer=setInterval(()=>{if(!inView||document.hidden||feature.matches(':hover')||feature.contains(document.activeElement))return;showFeature((current+1)%records.length);},4000);}
  pause.addEventListener('click',()=>{paused=!paused;updatePause();restart();});
  motion.addEventListener('change',()=>{paused=motion.matches;updatePause();restart();});
  if(window.IntersectionObserver)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{threshold:.1}).observe(feature);
  renderFeature(0);updatePause();restart();
 }
 const search=document.getElementById('newsSearch');if(!search)return;
 const category=document.getElementById('newsCategory'),language=document.getElementById('newsLanguage'),district=document.getElementById('newsDistrict'),tag=document.getElementById('newsTag');
 const grid=document.getElementById('newsDirectoryCards'),status=document.getElementById('newsResultStatus'),empty=document.getElementById('newsDirectoryEmpty');
 function render(){
  const term=search.value.trim().toLocaleLowerCase();
  const found=records.filter(item=>(!term||`${item.title} ${item.categoryLabel} ${item.keywords} ${item.tags.join(' ')}`.toLocaleLowerCase().includes(term))&&(!category.value||item.category===category.value)&&(!language.value||item.language===language.value)&&(!district.value||item.district===district.value)&&(!tag.value||item.tags.includes(tag.value)));
  grid.replaceChildren();
  found.forEach(item=>{
   const article=document.createElement('article');article.className='news-directory-card';article.dataset.category=item.category;
   const href=`./news-detail.html?preview=${encodeURIComponent(item.preview)}`;
   const imageLink=document.createElement('a');imageLink.className='news-directory-card-image';imageLink.href=href;imageLink.tabIndex=-1;imageLink.setAttribute('aria-hidden','true');
   const image=document.createElement('img');image.src=`../../assets/hero/${item.image}`;image.alt='';image.loading='lazy';image.width=480;image.height=200;imageLink.append(image);
   const caption=document.createElement('span');caption.textContent='AI illustration';imageLink.append(caption);
   const content=document.createElement('div');content.className='news-directory-card-content';const metadata=document.createElement('div');metadata.className='news-directory-card-meta';
   const label=document.createElement('span');label.className='news-directory-category';label.textContent=item.categoryLabel;const preview=document.createElement('span');preview.className='news-directory-preview';preview.textContent='Design preview';metadata.append(label,preview);
   const heading=document.createElement('h3');const headingLink=document.createElement('a');headingLink.href=href;headingLink.textContent=item.title;heading.append(headingLink);
   const read=document.createElement('a');read.className='news-directory-read';read.href=href;read.innerHTML='Read More <span aria-hidden="true">→</span>';read.setAttribute('aria-label',`Read article preview: ${item.title}`);
   content.append(metadata,heading,read);article.append(imageLink,content);grid.append(article);
  });
  status.textContent=`${found.length} ${found.length===1?'article preview':'article previews'}`;empty.hidden=found.length>0;
 }
 function reset(){search.value='';[category,language,district,tag].forEach(control=>control.value='');render();}
 document.getElementById('newsSearchForm').addEventListener('submit',event=>{event.preventDefault();render();});search.addEventListener('input',render);[category,language,district,tag].forEach(control=>control.addEventListener('change',render));
 document.getElementById('newsFilterReset').addEventListener('click',reset);document.getElementById('newsEmptyReset').addEventListener('click',()=>{reset();search.focus();});
 render();
})();

/* RSS belongs with newsroom controls; article sharing stays on News Detail. */
(() => {
 'use strict';
 const button=document.getElementById('newsroomRssButton');
 const notice=document.getElementById('newsroomRssNotice');
 if(!button||!notice)return;
 // Add a real RSS alternate link only after the backend feed is published.
 const feed=document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
 button.addEventListener('click',()=>{
  if(feed){const url=new URL(feed.href,location.href);if(['https:','http:'].includes(url.protocol)){location.assign(url.href);return;}}
  const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));notice.hidden=expanded;
 });
})();
