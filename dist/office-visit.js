'use strict';
const stops = [
  {name:'Reception', time:0, poster:1, text:'Come through reception and see the Surat team at work.'},
  {name:'Glass office', time:11.2, poster:12, text:'Step past the glass door into a conversation across the desk.'},
  {name:'First desk row', time:15.7, poster:18, text:'The camera passes the first row of shared desks.'},
  {name:'Team workspace', time:19.4, poster:24, text:'Follow the camera around the team’s desks as colleagues work together.'},
  {name:'Window-side desks', time:27.4, poster:30, text:'Finish the tour at the workstations along the office windows.'}
];
const media='https://zorko.in/wp-content/uploads/2026/04/join-our-team.mp4';
const byId=id=>document.getElementById(id);
const route=byId('route'), walk=byId('walk'), video=byId('walkthrough'), film=byId('film');
const intro=byId('play').closest('.caption');
let active=0, pending=null;
const buttons=stops.map((stop,index)=>{
  const button=document.createElement('button'), photo=new Image();
  photo.src='assets/office-tour/stop-'+stop.poster+'.jpg'; photo.alt='';
  const time=document.createElement('small'); time.textContent='0:'+String(Math.floor(stop.time)).padStart(2,'0');
  const name=document.createElement('b'); name.textContent=stop.name;
  button.append(photo,time,name); button.addEventListener('click',()=>enter(index)); route.append(button); return button;
});
function display(index,announce=false){
  active=index;
  byId('room').textContent=stops[index].name;
  byId('count').textContent=String(index+1).padStart(2,'0')+' / 05';
  byId('prev').disabled=index===0; byId('next').disabled=index===stops.length-1;
  buttons.forEach((button,i)=>i===index?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current'));
  route.scrollLeft=buttons[index].offsetLeft-route.offsetLeft-(route.clientWidth-buttons[index].offsetWidth)/2;
  if(announce) byId('announce').textContent=stops[index].name+'. '+stops[index].text;
}
function showWalk(){ film.hidden=true; walk.hidden=false; intro.inert=true; }
function seek(){
  if(pending===null || video.readyState===0) return;
  video.currentTime=stops[pending].time; pending=null;
}
function enter(index){
  if(index<0||index>=stops.length) return;
  if(!film.hidden) closeFilm(false);
  display(index,true); showWalk(); pending=index;
  byId('video-status').textContent=''; video.poster=buttons[index].querySelector('img').src;
  if(!video.getAttribute('src')) video.src=media;
  seek(); const promise=video.play();
  if(promise) promise.catch(err=>{if(err.name==='NotAllowedError') byId('video-status').textContent='Press play to continue.';});
}
video.addEventListener('loadedmetadata',seek);
video.addEventListener('playing',()=>{byId('video-status').textContent='';});
video.addEventListener('error',()=>{byId('video-status').textContent='The walk-through could not load. You can open the original office film below.';});
video.addEventListener('timeupdate',()=>{
  if(walk.hidden||video.seeking||pending!==null) return;
  let index=0; while(index+1<stops.length && video.currentTime>=stops[index+1].time) index++;
  if(index!==active) display(index);
});
function entrance(restoreFocus=true){
  pending=null;video.pause();walk.hidden=true;intro.inert=false;display(0);
  if(restoreFocus) byId('play').focus();
}
function closeFilm(restoreFocus=true){
  byId('screen').replaceChildren();film.hidden=true;intro.inert=false;
  if(restoreFocus) byId('original').focus();
}
byId('play').addEventListener('click',()=>{enter(0);byId('exit-walk').focus();});
byId('exit-walk').addEventListener('click',()=>entrance());
byId('original').addEventListener('click',()=>{
  entrance(false);intro.inert=true;film.hidden=false;
  const player=document.createElement('iframe'); player.title='Inside ZORKO Head Office — original office film';
  player.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';player.allowFullscreen=true;player.referrerPolicy='strict-origin-when-cross-origin';
  player.src='https://www.youtube-nocookie.com/embed/CraQLVdyRYs?autoplay=1&playsinline=1&rel=0';
  byId('screen').replaceChildren(player);byId('close').focus();
});
byId('close').addEventListener('click',()=>closeFilm());
byId('prev').addEventListener('click',()=>enter(active-1));byId('next').addEventListener('click',()=>enter(active+1));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!film.hidden)closeFilm();else if(!walk.hidden)entrance();}
  if(!film.hidden || e.target===video || e.altKey||e.ctrlKey||e.metaKey||e.shiftKey) return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();enter(active+(e.key==='ArrowRight'?1:-1));}
});
display(0);