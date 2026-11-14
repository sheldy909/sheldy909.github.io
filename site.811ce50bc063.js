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

// Silent inline demos: playback follows visibility and motion preferences.
(()=>{
 const videos=[...document.querySelectorAll('video.article-demo')];
 if(!videos.length)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),visible=new Set();
 function stop(video,poster=false){video.pause();if(poster)video.load()}
 async function play(video){
  if(document.hidden||!visible.has(video)||reduced.matches)return stop(video);
  try{await video.play();if(document.hidden||!visible.has(video)||reduced.matches)stop(video)}catch{stop(video,true)}
 }
 function sync(){for(const video of videos)if(reduced.matches)stop(video,true);else if(!document.hidden&&visible.has(video))play(video);else stop(video)}
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.25)visible.add(entry.target);else visible.delete(entry.target)}sync()},{threshold:.25});
 for(const video of videos){video.muted=true;video.pause();video.addEventListener('play',()=>{if(document.hidden||!visible.has(video)||reduced.matches)stop(video)});video.addEventListener('click',()=>play(video));observer.observe(video)}
 reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 if(reduced.matches)sync();
})();
