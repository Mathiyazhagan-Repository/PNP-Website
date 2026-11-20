/* Reference-based article preview. Replace with approved published CMS records. */
(() => {
 'use strict';
 const params=new URLSearchParams(location.search);
 // No unpublished or scheduled records are shipped in frontend data.
 if(params.has('slug')){
  document.getElementById('pressArticle').hidden=true;
  document.getElementById('newsArticleMissing').hidden=false;
  document.title='Article unavailable | PNP Newsroom';return;
 }
 const referencePreviews={
  '2':{title:'PNP’s Vision for a Progressive Tomorrow',category:'News · Preview',image:'news-statement.png',paragraphs:['Explore the news article layout for PNP’s vision and public priorities.','Approved article text, supporting sources and publication details will be displayed once supplied.','This is an illustrative design preview, not a published news report.']},
  '3':{title:'Party Leaders Hold Strategic Review Meet',category:'Statement · Preview',image:'news-public.png',paragraphs:['Explore the party statement layout, including article classification and sharing options.','Approved statement text, attribution and supporting sources will be displayed after publication.','This is an illustrative design preview. No meeting or event is confirmed by this page.']}
 };
 const selected=referencePreviews[params.get('preview')];
 if(selected){document.getElementById('articleTitle').textContent=selected.title;document.querySelector('.news-article-category').textContent=selected.category;document.getElementById('articleHeroImage').src=`../../assets/hero/${selected.image}`;document.querySelectorAll('.news-article-body > p:not(.news-article-share-status)').forEach((paragraph,index)=>{if(selected.paragraphs[index])paragraph.textContent=selected.paragraphs[index];});}
 const title=document.getElementById('articleTitle').textContent.replace(/\s+/g,' ').trim();
 document.title=`${title} | Article Preview | PNP`;
 const more=document.getElementById('articleMore');const toggle=document.getElementById('articleReadMore');
 toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));more.hidden=expanded;toggle.innerHTML=`${expanded?'Read More':'Read Less'} <span aria-hidden="true">${expanded?'→':'↑'}</span>`;});
 const status=document.getElementById('articleShareStatus');
 document.querySelectorAll('[data-article-share]').forEach(button=>button.addEventListener('click',async()=>{
  const url=new URL(location.href);url.hash='';const link=encodeURIComponent(url.href);const text=encodeURIComponent(`${title} (design preview)`);
  if(button.dataset.articleShare==='copy'){
   try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url.href);status.textContent='Article link copied.';}else if(navigator.share){await navigator.share({title:`${title} (design preview)`,url:url.href});}else{status.textContent=`Article link: ${url.href}`;}}
   catch(error){if(error.name!=='AbortError')status.textContent=`Article link: ${url.href}`;}return;
  }
  const links={facebook:`https://www.facebook.com/sharer/sharer.php?u=${link}`,x:`https://twitter.com/intent/tweet?url=${link}&text=${text}`,linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${link}`,whatsapp:`https://wa.me/?text=${text}%20${link}`,telegram:`https://t.me/share/url?url=${link}&text=${text}`};
  const destination=links[button.dataset.articleShare];if(destination)window.open(destination,'_blank','noopener,noreferrer');
 }));
})();

