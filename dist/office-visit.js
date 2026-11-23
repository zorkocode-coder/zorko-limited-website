'use strict';
const root='assets/office-tour/';
const entrance={name:'Entrance',image:'assets/reception.jpg',alt:'The green reception desk below the ZORKO Limited sign'};
const stops=[
  {name:'Reception',image:root+'stop-1.jpg',atlas:root+'motion-1.webp',alt:'Reception staff at the green ZORKO desk',detail:'The green front desk and the team welcoming visitors.',pin:[72,50],aim:[.55,.03]},
  {name:'Brand wall',image:root+'brand-wall.jpg',portrait:true,alt:'Backlit ZORKO lettering inside the office',detail:'A closer look at the illuminated ZORKO sign.',pin:[67,42],aim:[.32,-.1]},
  {name:'ZORKO Limited wall',image:root+'limited-wall.jpg',portrait:true,alt:'ZORKO Limited lettering on a green wall beside a glass door',detail:'The company sign beside a glass office door.',pin:[38,50],aim:[-.48,.12]},
  {name:'Glass corridor',image:'assets/office-interior.jpg',alt:'Glass-partitioned workstations along the office corridor',detail:'Look down the passage between the glass partitions.',pin:[56,45],aim:[.04,0]},
  {name:'Glass office',image:root+'stop-12.jpg',atlas:root+'motion-12.webp',alt:'Colleagues talking across a desk in the glass office',detail:'A conversation across the desk.',pin:[73,48],aim:[.40,.02]},
  {name:'First desk row',image:root+'stop-18.jpg',atlas:root+'motion-16.webp',alt:'People working at computers along the first desk row',detail:'Colleagues at the first row of workstations.',pin:[63,47],aim:[.3,.04]},
  {name:'Team workspace',image:root+'stop-24.jpg',atlas:root+'motion-20.webp',alt:'Employees working together at shared desks',detail:'A view across the shared desks.',pin:[71,42],aim:[.4,-.04]},
  {name:'Window-side desks',image:root+'stop-30.jpg',atlas:root+'motion-28.webp',alt:'Employees at desks beside the office windows',detail:'The workstations along the windows.',pin:[64,48],aim:[.24,.04]},
  {name:'Training centre',image:root+'training.jpg',portrait:true,alt:'Participants seated with notes in the ZORKO franchise owner training centre',detail:'Franchise owners taking notes during a training session.',pin:[65,46],aim:[.27,0]}
];
const get=id=>document.getElementById(id), stage=get('stage'), dialog=get('directory');
const renderer=new OfficeRenderer(stage,get('world'),get('backdrop'));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let current=-1,requested=-1,request=0,loadingTimer,point=null;
const items=[];
function makeList(node){
  const buttons=stops.map((stop,i)=>{
    const button=document.createElement('button'),img=new Image(),label=document.createElement('b');
    img.src=stop.image;img.alt='';label.textContent=stop.name;button.append(img,label);
    button.addEventListener('click',()=>{if(dialog.open)dialog.close();navigate(i);});
    node.append(button);return button;
  });
  items.push(buttons);
}
makeList(get('rail'));makeList(get('directory-list'));
function motion(value){
  renderer.motion=value;renderer.duration=0;renderer.start=performance.now();renderer.schedule();
  get('motion').textContent=value?'Motion on':'Motion off';get('motion').setAttribute('aria-pressed',String(value));
}
motion(!reduced.matches);reduced.addEventListener('change',e=>motion(!e.matches));
get('motion').addEventListener('click',()=>motion(!renderer.motion));
function adjustZoom(amount){
  renderer.zoom=Math.min(1.75,Math.max(1,Math.round((renderer.zoom+amount)*100)/100));renderer.schedule();
  get('zoom-label').textContent=renderer.zoom+'×';get('less').disabled=renderer.zoom<=1;get('more').disabled=renderer.zoom>=1.75;
}
function showInfo(index){
  const inside=index>=0,stop=inside?stops[index]:entrance;
  stage.classList.toggle('entered',inside);stage.dataset.stop=String(index);
  get('kicker').textContent=inside?'Surat office · '+String(index+1).padStart(2,'0'):'ZORKO Limited';
  if(inside)get('heading').textContent=stop.name;
  else{const em=document.createElement('em');em.textContent='ZORKO.';get('heading').replaceChildren('Inside ',em);}
  get('description').textContent=inside?stop.detail:'Walk through our Surat head office.';
  get('enter').hidden=inside;get('portal').hidden=!inside;document.querySelector('.view-tools').hidden=!inside;
  const next=stops[index+1];get('portal-name').textContent=next?next.name:'Back to entrance';
  get('portal').setAttribute('aria-label',next?'Move to '+next.name:'Return to entrance');
  if(stop.pin){stage.style.setProperty('--pin-x',stop.pin[0]+'%');stage.style.setProperty('--pin-y',stop.pin[1]+'%');}
  get('counter').textContent=String(index+1).padStart(2,'0')+' / 09';
  get('prev').disabled=!inside;get('next').disabled=index===stops.length-1;
  get('instruction').textContent=inside?'Drag to look around · Select an arrow to move.':'Choose a stop or enter at reception.';
  for(const list of items)list.forEach((button,i)=>i===index?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current'));
  if(inside){
    const rail=get('rail'),button=items[0][index],rect=button.getBoundingClientRect(),bounds=rail.getBoundingClientRect();
    if(rect.left<bounds.left||rect.right>bounds.right)rail.scrollLeft+=rect.left-bounds.left-(bounds.width-rect.width)/2;
  }
  adjustZoom(0);
}
async function navigate(index){
  if(index< -1||index>=stops.length)return;
  const token=++request,dir=index===current?0:index>current?1:-1;requested=index;
  clearTimeout(loadingTimer);get('spoken').textContent='';
  loadingTimer=setTimeout(()=>{if(token===request)document.querySelector('.load').hidden=false;},180);
  const scene=index>=0?stops[index]:entrance;const applied=await renderer.show(scene,dir);
  if(!applied||token!==request)return;
  clearTimeout(loadingTimer);document.querySelector('.load').hidden=true;current=index;showInfo(index);
  get('spoken').textContent=index>=0?'View '+(index+1)+' of 9. '+scene.name+'. '+scene.detail:'Office entrance';
}
get('enter').addEventListener('click',()=>{stage.focus({preventScroll:true});navigate(0);});
get('next').addEventListener('click',()=>navigate(requested+1));get('prev').addEventListener('click',()=>navigate(requested-1));
get('portal').addEventListener('click',()=>navigate(current===stops.length-1?-1:current+1));
get('more').addEventListener('click',()=>adjustZoom(.25));get('less').addEventListener('click',()=>adjustZoom(-.25));
get('directory-open').addEventListener('click',()=>dialog.showModal());get('close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
get('full').hidden=!document.fullscreenEnabled;
get('full').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await get('experience').requestFullscreen();}catch{get('spoken').textContent='Full screen is unavailable in this browser.';}});
document.addEventListener('fullscreenchange',()=>get('full').setAttribute('aria-label',document.fullscreenElement?'Exit full screen':'Enter full screen'));
function look(x,y){renderer.pan=[x,y].map(n=>Math.max(-1,Math.min(1,n)));renderer.schedule();}
stage.addEventListener('pointerdown',e=>{
  if(current<0||!e.isPrimary||e.button!==0||e.target.closest('button'))return;
  point={id:e.pointerId,x:e.clientX,y:e.clientY,pan:[...renderer.pan]};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');
});
stage.addEventListener('pointermove',e=>{
  if(!point||point.id!==e.pointerId)return;
  look(point.pan[0]+(point.x-e.clientX)/(stage.clientWidth*.34),point.pan[1]+(point.y-e.clientY)/(stage.clientHeight*.4));
});
function release(e){if(point?.id===e.pointerId){point=null;stage.classList.remove('dragging');}}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
document.addEventListener('keydown',e=>{
  if(dialog.open||e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();navigate(requested+(e.key==='ArrowRight'?1:-1));return;}
  if(current<0)return;
  if(e.key==='Escape'){navigate(-1);return;}
  const key=e.key.toLowerCase(),steps={a:[-.22,0],d:[.22,0],w:[0,-.22],s:[0,.22]};
  if(steps[key]){e.preventDefault();look(renderer.pan[0]+steps[key][0],renderer.pan[1]+steps[key][1]);}
  if(key==='+'||key==='=')adjustZoom(.25);if(key==='-')adjustZoom(-.25);
});
navigate(-1);
