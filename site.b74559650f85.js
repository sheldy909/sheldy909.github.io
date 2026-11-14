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

// Update the numeric age in the PDF at download time; everything stays local.
(()=>{
 let library,pending=false;
 function loadPDF(){
  if(window.PDFLib)return Promise.resolve(window.PDFLib);
  if(!library)library=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/assets/pdf-lib.1.17.1.min.js';script.onload=()=>resolve(window.PDFLib);script.onerror=()=>{library=null;script.remove();reject(new Error('PDF library unavailable'))};document.head.append(script)});
  return library;
 }
 document.addEventListener('click',async event=>{
  const link=event.target.closest('a[href]');
  if(!link||link.dataset.cvStatic||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname!=='/Roman-Plyaskin-CV.pdf')return;
  event.preventDefault();event.stopImmediatePropagation();if(pending)return;pending=true;link.setAttribute('aria-busy','true');
  try{
   const [pdf,response]=await Promise.all([loadPDF(),fetch(url.href,{cache:'no-cache'})]);if(!response.ok)throw new Error('CV unavailable');
   const doc=await pdf.PDFDocument.load(await response.arrayBuffer());const page=doc.getPages()[0];
   const stream=page.node.lookup(pdf.PDFName.of('Contents'),pdf.PDFRawStream);
   const original=String.fromCharCode(...pdf.decodePDFRawStream(stream).decode());
   const now=new Date(),age=now.getFullYear()-2000-(now.getMonth()===0&&now.getDate()<6?1:0);
   const pattern=/(% CV_AGE_START[\s\S]*?)(\((?:\\.|[^\\)])*\))(\s*Tj[\s\S]*?% CV_AGE_END)/;
   const marker=original.match(pattern);if(!marker)throw new Error('Birth date marker missing');
   const fontName=marker[0].match(/\/([^\s]+)\s+9\.5 Tf/)[1];
   const fonts=page.node.Resources().lookup(pdf.PDFName.of('Font'),pdf.PDFDict),font=fonts.lookup(pdf.PDFName.of(fontName),pdf.PDFDict);
   const cmap=String.fromCharCode(...pdf.decodePDFRawStream(font.lookup(pdf.PDFName.of('ToUnicode'),pdf.PDFRawStream)).decode()),encoding=new Map();
   for(const match of cmap.matchAll(/<([0-9a-f]{2})>\s*<([0-9a-f]{4})>/gi))encoding.set(String.fromCodePoint(parseInt(match[2],16)),match[1]);
   const ageText=`Возраст: ${age} · Воронеж`,hex=Array.from(ageText,char=>{const code=encoding.get(char);if(!code)throw new Error('Missing CV glyph');return code}).join('');
   const updated=original.replace(pattern,(_,before,text,after)=>before+'<'+hex+'>'+after);
   page.node.set(pdf.PDFName.of('Contents'),doc.context.register(doc.context.flateStream(updated)));
   const blob=new Blob([await doc.save()],{type:'application/pdf'}),href=URL.createObjectURL(blob),download=document.createElement('a');
   download.href=href;download.download='Roman-Plyaskin-CV.pdf';download.hidden=true;document.body.append(download);download.click();download.remove();setTimeout(()=>URL.revokeObjectURL(href),60000);
  }catch(error){console.warn('Downloading the static CV instead:',error);link.dataset.cvStatic='true';link.click();delete link.dataset.cvStatic}
  finally{pending=false;link.removeAttribute('aria-busy')}
 },true);
})();
