// Preserve source navigation and the source's visible desktop/mobile menu.
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href').slice(1);const target=document.getElementById(id);if(target){e.preventDefault();if(a.classList.contains('skip-link'))target.focus({preventScroll:true});target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}}));
// Source cursor styling is retained; initialization is independent of Taptop.
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!document.querySelector('.custom-cursor')){
 const cursor=document.createElement('div');
 cursor.className='custom-cursor hidden';cursor.setAttribute('aria-hidden','true');
 document.body.append(cursor);
 const clickable=el=>el?.closest?.('a,button,input,textarea,select,[role="button"],[role="scrollbar"],[onclick],[tabindex]:not([tabindex="-1"])');
 document.addEventListener('pointermove',e=>{
  cursor.style.left=e.clientX+'px';
  cursor.style.top=e.clientY+'px';
  cursor.classList.remove('hidden');document.documentElement.classList.add('custom-cursor-ready');
 },{passive:true});
 document.addEventListener('mouseover',e=>cursor.classList.toggle('hovered',!!clickable(e.target)),{passive:true});
 document.addEventListener('mousedown',e=>{if(e.button===0)cursor.classList.add('pressed');if(e.button===2)cursor.classList.add('right-pressed')});
 document.addEventListener('mouseup',()=>cursor.classList.remove('pressed','right-pressed'));
 document.addEventListener('mouseleave',()=>{cursor.classList.add('hidden');document.documentElement.classList.remove('custom-cursor-ready')});
 window.addEventListener('blur',()=>{cursor.classList.add('hidden');cursor.classList.remove('pressed','right-pressed');document.documentElement.classList.remove('custom-cursor-ready')});
}
// Desktop scrollbar lives in the page so the custom cursor can render above it.
(()=>{
 const media=matchMedia('(hover:hover) and (pointer:fine)');
 const root=document.documentElement;
 const track=document.createElement('div');track.className='portfolio-scrollbar';
 track.setAttribute('role','scrollbar');track.setAttribute('aria-label','Прокрутка страницы');
 track.setAttribute('aria-orientation','vertical');track.setAttribute('aria-controls','top');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.tabIndex=0;
 const thumb=document.createElement('div');thumb.className='portfolio-scrollbar-thumb';track.append(thumb);document.body.append(track);
 let dragging=false,startY=0,startScroll=0,travel=0,maxScroll=0,frame=0;
 function update(){
  frame=0;const enabled=media.matches;const height=window.innerHeight;
  maxScroll=Math.max(0,root.scrollHeight-height);
  const visible=enabled&&maxScroll>0;
  root.classList.toggle('custom-scroll-ready',visible);track.hidden=!visible;
  if(!visible)return;
  const thumbHeight=Math.min(height,Math.max(40,height*height/root.scrollHeight));
  travel=height-thumbHeight;
  thumb.style.height=thumbHeight+'px';thumb.style.transform='translateY('+(Math.min(maxScroll,Math.max(0,window.scrollY))/maxScroll*travel)+'px)';
  track.setAttribute('aria-valuenow',String(Math.round(window.scrollY/maxScroll*100)));
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 const jump=y=>window.scrollTo({top:Math.max(0,Math.min(maxScroll,y)),behavior:'instant'});
 track.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;e.preventDefault();update();
  if(e.target!==thumb)jump((e.clientY-thumb.offsetHeight/2)/Math.max(1,travel)*maxScroll);
  dragging=true;startY=e.clientY;startScroll=window.scrollY;
  track.classList.add('dragging');track.setPointerCapture(e.pointerId);
 });
 track.addEventListener('pointermove',e=>{if(dragging)jump(startScroll+(e.clientY-startY)/Math.max(1,travel)*maxScroll)});
 const end=()=>{dragging=false;track.classList.remove('dragging')};
 track.addEventListener('pointerup',end);track.addEventListener('pointercancel',end);track.addEventListener('lostpointercapture',end);window.addEventListener('blur',end);
 track.addEventListener('keydown',e=>{
  const amount={ArrowDown:40,ArrowUp:-40,PageDown:innerHeight*.9,PageUp:-innerHeight*.9};
  if(e.key in amount){e.preventDefault();jump(scrollY+amount[e.key])}
  else if(e.key==='Home'){e.preventDefault();jump(0)}else if(e.key==='End'){e.preventDefault();jump(maxScroll)}
 });
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('load',schedule);media.addEventListener('change',schedule);
 new ResizeObserver(schedule).observe(document.body);update();
})();
// Original Taptop page transition: scale/fade out, then scale/fade in.
(()=>{
 const main=document.querySelector('.main');if(!main)return;
 let navigating=false;
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
  const href=link.getAttribute('href');if(!href||href.startsWith('#'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol))return;
  if(url.pathname===location.pathname&&url.search===location.search)return;
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  event.preventDefault();if(navigating)return;navigating=true;
  main.classList.add('leaving');
  setTimeout(()=>location.assign(url.href),400);
 });
 window.addEventListener('pageshow',event=>{
  navigating=false;main.classList.remove('leaving');
  if(event.persisted){main.style.animation='none';void main.offsetWidth;main.style.animation=''}
 });
})();

// One accessible control; native video chrome remains disabled on iOS.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const states=new Map();
 function render(s){const paused=s.video.paused;s.wrap.classList.toggle('is-paused',paused);s.button.textContent=paused?'▶':'Ⅱ';s.button.classList.toggle('needs-start',s.blocked);s.button.setAttribute('aria-label',paused?'Запустить видео':'Приостановить видео');s.button.setAttribute('aria-pressed',String(!paused));}
 async function play(s){try{await s.video.play();if(document.hidden||!s.visible||s.userPaused||reduced.matches&&!s.userStarted)s.video.pause();s.blocked=false}catch{ s.blocked=true;s.video.pause()}render(s)}
 function sync(s){if(document.hidden||!s.visible||s.userPaused||reduced.matches&&!s.userStarted){s.video.pause();render(s)}else play(s)}
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const s=states.get(e.target);s.visible=e.isIntersecting&&e.intersectionRatio>=.4;sync(s)}},{threshold:[0,.4,1]});
 for(const video of document.querySelectorAll('video.article-demo')){
  const wrap=document.createElement('div');wrap.className='demo-player is-paused';video.before(wrap);wrap.append(video);
  const button=document.createElement('button');button.type='button';button.className='demo-toggle';wrap.append(button);
  const s={video,wrap,button,visible:false,userPaused:false,userStarted:false,blocked:false};states.set(video,s);
  // The attribute is retained in HTML; only the observer starts playback.
  video.autoplay=false;video.muted=true;video.controls=false;video.pause();
  let touchTimer;
  function toggle(){s.userStarted=true;s.userPaused=!video.paused;if(s.userPaused)video.pause();else play(s);render(s)}
  video.addEventListener('click',toggle);button.addEventListener('click',toggle);
  wrap.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){wrap.classList.add('is-touched');clearTimeout(touchTimer);touchTimer=setTimeout(()=>wrap.classList.remove('is-touched'),1800)}});
  for(const event of ['play','pause','ended'])video.addEventListener(event,()=>render(s));
  render(s);observer.observe(video);
 }
 document.addEventListener('visibilitychange',()=>states.forEach(sync));
 reduced.addEventListener('change',()=>{for(const s of states.values()){s.userStarted=false;sync(s)}});
})();
