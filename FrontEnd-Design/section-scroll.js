/* Shared section-by-section wheel navigation. Touch and keyboard remain native. */
(() => {
  'use strict';
  if(window.__pnpSectionScrollInstalled)return;
  const main=document.getElementById('main-content')||document.querySelector('main');
  if(!main)return;
  const sections=[...main.querySelectorAll(':scope > section')];
  if(!sections.length)return;
  window.__pnpSectionScrollInstalled=true;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const customDuration=Math.min(2500,Math.max(0,Number(main.dataset.sectionScrollDuration)||1000));
  let animationFrame=0;
  let busy=false,lastWheel=0,total=0,releaseTimer,lockedUntil=0;
  function headerBottom(){const header=document.querySelector('.site-header');return header?Math.max(0,header.getBoundingClientRect().bottom):0;}
  function stops(){
    const header=headerBottom(),max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    const strip=document.querySelector('.breaking-news'),stripRect=strip?.getBoundingClientRect();
    // Keep the final lines above the fixed news strip as well as below the header.
    const bottomInset=stripRect&&stripRect.bottom>0&&stripRect.top<innerHeight&&getComputedStyle(strip).position==='fixed'?innerHeight-stripRect.top:0;
    const available=Math.max(120,innerHeight-header-bottomInset-16),step=Math.max(80,available-48);
    const targets=[...sections],points=[];const footer=document.querySelector('.site-footer');if(footer)targets.push(footer);
    for(const element of targets){
      const rect=element.getBoundingClientRect();if(rect.height<=0)continue;
      const top=scrollY+rect.top-header;
      const bottom=top+Math.max(0,rect.height-available);
      points.push(top);
      // A tall section has its own reading stops, including its exact bottom.
      // Reversing direction visits those same stops before leaving the section.
      for(let position=top+step;position<bottom-8;position+=step)points.push(position);
      if(bottom>top+8)points.push(bottom);
    }
    return [...new Set(points.map(p=>Math.round(Math.min(max,Math.max(0,p)))))].sort((a,b)=>a-b);
  }
  function nestedScroll(target){for(let n=target;n&&n!==document.body;n=n.parentElement){if(n.matches?.('input,textarea,select,[contenteditable="true"],[role="dialog"],dialog'))return true;const style=getComputedStyle(n);if(/auto|scroll/.test(style.overflowY)&&n.scrollHeight>n.clientHeight+2)return true;}return false;}
  function unlock(){clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>{if(performance.now()>=lockedUntil&&performance.now()-lastWheel>180){busy=false;total=0;}else unlock();},220);}
  function moveTo(target){
    cancelAnimationFrame(animationFrame);
    if(!customDuration||reduced.matches){window.scrollTo({top:target,behavior:reduced.matches?'instant':'smooth'});return;}
    const start=scrollY,started=performance.now();
    function frame(time){
      const progress=Math.min(1,Math.max(0,(time-started)/customDuration));
      // Gentle acceleration and deceleration, with an exact final reading stop.
      const eased=(1-Math.cos(Math.PI*progress))/2;
      window.scrollTo({top:start+(target-start)*eased,behavior:'instant'});
      animationFrame=progress<1?requestAnimationFrame(frame):0;
    }
    animationFrame=requestAnimationFrame(frame);
  }
  function wheel(e){
    if(innerWidth<768||e.ctrlKey||e.metaKey||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||nestedScroll(e.target)||document.querySelector('dialog[open],.modal[aria-hidden="false"]'))return;
    if(!e.deltaY)return;
    const now=performance.now();if(now-lastWheel>220)total=0;lastWheel=now;
    if(busy){e.preventDefault();unlock();return;}
    const points=stops(),y=scrollY,direction=Math.sign(e.deltaY);
    const next=direction>0?points.find(p=>p>y+8):[...points].reverse().find(p=>p<y-8);
    if(next===undefined)return;
    const target=next;
    e.preventDefault();total+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
    if(Math.abs(total)<12)return;
    const duration=reduced.matches?100:customDuration||700;
    busy=true;total=0;lockedUntil=now+duration;
    moveTo(target);
    clearTimeout(releaseTimer);releaseTimer=setTimeout(unlock,duration);
  }
  window.addEventListener('wheel',wheel,{passive:false});
  // Native navigation and scrollbar dragging remain available at any time.
  function cancelMotion(){cancelAnimationFrame(animationFrame);animationFrame=0;busy=false;total=0;clearTimeout(releaseTimer);}
  window.addEventListener('keydown',cancelMotion);
  window.addEventListener('pointerdown',cancelMotion,{passive:true});
  window.addEventListener('touchstart',cancelMotion,{passive:true});
  window.addEventListener('resize',cancelMotion,{passive:true});
})();
