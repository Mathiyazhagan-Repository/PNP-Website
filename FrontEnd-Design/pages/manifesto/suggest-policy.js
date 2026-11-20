/* Frontend preview only. Production requires a server-validated CAPTCHA, CSRF,
   rate limiting, consent recording and a moderation queue before enabling submission.
   No suggestion or personal contact information is persisted or sent by this preview. */
(() => {
 'use strict';
 const form=document.getElementById('policySuggestionForm');if(!form)return;
 const status=document.getElementById('suggestionFormStatus');
 const canvas=document.getElementById('suggestionCaptchaCanvas');
 const captchaInput=document.getElementById('suggestionCaptcha');
 const description=document.getElementById('suggestionDescription');
 let code='';
 function refreshCode(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const numbers=new Uint32Array(6);crypto.getRandomValues(numbers);code=Array.from(numbers,value=>alphabet[value%alphabet.length]).join('');
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,220,52);ctx.fillStyle='#edf5ff';ctx.fillRect(0,0,220,52);
  ctx.strokeStyle='#aecae14d';for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(0,8+i*8);ctx.lineTo(220,44-i*6);ctx.stroke();}
  ctx.fillStyle='#102e59';ctx.font='italic 800 28px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  [...code].forEach((letter,index)=>{ctx.save();ctx.translate(30+index*32,27+(index%2?2:-2));ctx.rotate((index%2?.06:-.06));ctx.fillText(letter,0,0);ctx.restore();});
  canvas.setAttribute('aria-label','Security code. Use the read-aloud button for an accessible alternative.');captchaInput.value='';setError(captchaInput,'');
 }
 function setError(control,message){control.setAttribute('aria-invalid',message?'true':'false');const error=document.getElementById(control.id+'Error');if(error)error.textContent=message;}
 function validate(control){let message='';const value=control.value.trim();
  if(control.type==='checkbox'){if(!control.checked)message='Please provide consent before continuing.';}
  else if(!value)message='This field is required.';
  else if(control.id==='suggestionEmail'&&!control.validity.valid)message='Enter a valid email address.';
  else if(control.id==='suggestionMobile'&&!/^[6-9][0-9]{9}$/.test(value))message='Enter a valid 10-digit mobile number.';
  else if(control.id==='suggestionName'&&value.length<2)message='Enter your full name.';
  else if(control.id==='suggestionTitle'&&value.length<5)message='Use at least 5 characters for the title.';
  else if(control.id==='suggestionDescription'&&value.length<30)message='Describe your idea in at least 30 characters.';
  else if(control.id==='suggestionCaptcha'&&value.toUpperCase()!==code)message='The code does not match. Please try again.';
  setError(control,message);return !message;
 }
 const required=[...form.querySelectorAll('[required]')];
 required.forEach(control=>{control.addEventListener('blur',()=>{if(control.value||control.checked)validate(control);});control.addEventListener(control.type==='checkbox'||control.tagName==='SELECT'?'change':'input',()=>{if(control.getAttribute('aria-invalid')==='true')validate(control);});});
 description.addEventListener('input',()=>{document.getElementById('suggestionCharacterCount').textContent=`${description.value.length} / 1000`;});
 document.getElementById('suggestionCaptchaRefresh').addEventListener('click',refreshCode);
 document.getElementById('suggestionCaptchaRead').addEventListener('click',()=>{if('speechSynthesis' in window){window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance([...code].join(', '));speech.rate=.7;speech.lang='en-IN';window.speechSynthesis.speak(speech);}else{status.textContent=`Security code: ${[...code].join(' ')}`;}});
 form.addEventListener('submit',event=>{event.preventDefault();status.classList.remove('is-error');if(document.getElementById('suggestionWebsite').value){status.textContent='The security check could not be completed. Please try again.';status.classList.add('is-error');return;}
 const invalid=required.filter(control=>!validate(control));if(invalid.length){status.textContent='Please review the highlighted fields.';status.classList.add('is-error');invalid[0].focus();return;}
 status.textContent='Your form is valid. Online submissions are not open yet, so no suggestion has been sent. Please keep a copy of your idea.';
 });
 const privacy=document.getElementById('suggestionPrivacyDialog');document.getElementById('suggestionPrivacyOpen').addEventListener('click',()=>privacy.showModal());privacy.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>privacy.close()));
 refreshCode();
})();
/* Non-modal suggestion drawer: outside page activity dismisses it without clearing input. */
(() => {
 'use strict';
 const drawer=document.getElementById('policySuggestionDrawer');if(!drawer)return;
 const launcher=document.getElementById('suggestionDrawerLauncher');
 const closeButton=document.getElementById('suggestionDrawerClose');
 const privacy=document.getElementById('suggestionPrivacyDialog');
 const header=document.querySelector('.site-header');
 let returnFocus=null,restoreFocus=true,openedAt=0;
 function updateDrawerPosition(){const bottom=header?Math.max(0,header.getBoundingClientRect().bottom):0;drawer.style.setProperty('--policy-drawer-top',`${bottom}px`);}
 function close(restore=true){if(!drawer.open)return;restoreFocus=restore;drawer.close();}
 function open(){
  if(drawer.open)return;
  returnFocus=document.activeElement;restoreFocus=true;openedAt=performance.now();
  launcher.hidden=true;launcher.setAttribute('aria-expanded','true');
  document.body.classList.add('policy-drawer-open');
  drawer.show();updateDrawerPosition();closeButton.focus({preventScroll:true});
 }
 drawer.addEventListener('close',()=>{
  launcher.hidden=false;launcher.setAttribute('aria-expanded','false');
  document.body.classList.remove('policy-drawer-open');
  if(restoreFocus){if(returnFocus&&returnFocus.isConnected&&returnFocus!==document.body&&returnFocus!==launcher)returnFocus.focus({preventScroll:true});else launcher.focus({preventScroll:true});}
 });
 closeButton.addEventListener('click',()=>close());
 launcher.addEventListener('click',open);
 window.addEventListener('resize',updateDrawerPosition,{passive:true});
 window.addEventListener('scroll',()=>{
  if(drawer.open&&!privacy?.open&&performance.now()-openedAt>400)close(false);
 },{passive:true});
 document.addEventListener('click',event=>{
  if(!drawer.open||privacy?.open||drawer.contains(event.target)||launcher.contains(event.target)||event.target.closest('[data-planned="suggest"]'))return;
  close(false);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&drawer.open&&!privacy?.open){event.preventDefault();close();}});
 if(header&&window.ResizeObserver)new ResizeObserver(updateDrawerPosition).observe(header);
 window.PNPPolicySuggestionDrawer={open};
 const url=new URL(location.href);
 if(url.searchParams.get('suggest')==='1'){open();url.searchParams.delete('suggest');history.replaceState(history.state,'',url.href);}
})();
