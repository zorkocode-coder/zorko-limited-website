'use strict';
// The camera projects a bounded view into each photographed scene. An atlas holds consecutive
// photographs from one shot, in four columns and three rows, in reading order.
class OfficeRenderer {
  constructor(stage, canvas, backdrop) {
    Object.assign(this,{stage,canvas,backdrop});
    this.pan=[0,0]; this.smooth=[0,0]; this.zoom=1; this.motion=true;
    this.cache=new Map(); this.ticket=0; this.raf=0; this.lastTick=0;
    this.context();
    canvas.addEventListener('webglcontextlost',event=>{
      event.preventDefault();this.gl=null;this.cache.clear();this.resetFallback();
    });
    canvas.addEventListener('webglcontextrestored',()=>{
      this.context();if(this.selected)this.show(this.selected,0);
    });
    new ResizeObserver(()=>this.schedule()).observe(stage);
  }
  context(){
    try{
      const gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
      if(!gl){this.resetFallback();return;}
      const vertex='attribute vec2 point; varying vec2 uv; void main(){uv=vec2(point.x*.5+.5,.5-point.y*.5);gl_Position=vec4(point,0.,1.);}';
      const fragment=`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D oldPhoto,newPhoto;
      uniform vec4 oldData,newData; // image aspect, atlas flag, frame, portrait flag
      uniform vec2 look,previousLook,aim;
      uniform float aspect,zoom,previousZoom,progress,direction;
      vec4 frame(sampler2D tex,vec2 p,vec4 data){
        if(data.y<.5)return texture2D(tex,p);
        vec2 grid=vec2(4.,3.);
        p=clamp(p,vec2(.001,.002),vec2(.999,.998));
        float a=floor(data.z), b=min(a+1.,11.);
        vec2 t0=vec2(mod(a,4.),floor(a/4.)), t1=vec2(mod(b,4.),floor(b/4.));
        return mix(texture2D(tex,(t0+p)/grid),texture2D(tex,(t1+p)/grid),fract(data.z));
      }
      vec4 photo(sampler2D tex,vec4 data,vec2 head,float lens,float push){
        vec2 fit=vec2(min(1.,aspect/data.x),min(1.,data.x/aspect));
        if(data.w>.5)fit=vec2(max(1.,aspect/data.x),max(1.,data.x/aspect));
        vec2 ray=(uv-.5)*fit/(lens*push);
        // Yaw and pitch change the projection around the current view.
        float denom=max(.7,1.+dot(ray,head)*.22);
        vec2 bounds=max(vec2(.016),.5-.5*fit/lens);
        vec2 point=.5+ray/denom+head*bounds*.85;
        if(data.w>.5 && (point.x<0.||point.y<0.||point.x>1.||point.y>1.))return vec4(.065,.097,.080,1.);
        return frame(tex,clamp(point,0.,1.),data);
      }
      void main(){
        float t=progress, ease=t*t*(3.-2.*t);
        float approach=direction>=0.?1.:-.55;
        vec4 from=photo(oldPhoto,oldData,previousLook+aim*.17*ease,previousZoom,1.+.19*ease*approach);
        vec4 dest=photo(newPhoto,newData,look-aim*.12*(1.-ease),zoom,1.+.10*(1.-ease)*approach);
        float distanceFromPath=length((uv-.5-aim*.18)*vec2(min(aspect,2.),1.));
        float blend=smoothstep(.12,.9,ease+(ease*(1.-ease))*(.55-distanceFromPath)*.7);
        gl_FragColor=mix(from,dest,blend);
      }`;
      const program=gl.createProgram();
      for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
        const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
        gl.attachShader(program,shader);gl.deleteShader(shader);
      }
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
      const point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
      this.loc={};for(const k of ['oldPhoto','newPhoto','oldData','newData','look','previousLook','aim','aspect','zoom','previousZoom','progress','direction'])this.loc[k]=gl.getUniformLocation(program,k);
      gl.uniform1i(this.loc.oldPhoto,0);gl.uniform1i(this.loc.newPhoto,1);
      this.gl=gl;this.cap=gl.getParameter(gl.MAX_TEXTURE_SIZE);this.stage.dataset.engine='loading';
    }catch{this.gl=null;this.resetFallback();}
  }
  resetFallback(){
    this.stage.dataset.engine='photo';this.current=null;this.previous=null;
    if(this.selected)this.backdrop.src=this.selected.image;
    this.schedule();
  }
  async texture(scene){
    const gl=this.gl;
    const paths=scene.atlas&&this.cap>=3072?[scene.atlas,scene.image]:[scene.image];
    for(const path of paths){
      if(this.cache.has(path))return this.cache.get(path);
      try{
        const image=new Image();image.src=path;await image.decode();
        if(this.gl!==gl)return null;
        if(this.cache.has(path))return this.cache.get(path);
        const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
        for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);
        for(const filter of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,filter,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
        const atlas=path===scene.atlas;
        const item={tex,aspect:atlas?16/9:image.naturalWidth/image.naturalHeight,atlas,portrait:!!scene.portrait};
        this.cache.set(path,item);return item;
      }catch{/* The poster remains usable if its movement atlas fails to decode. */}
    }
    return null;
  }
  async show(scene,direction){
    const ticket=++this.ticket;this.selected=scene;
    const item=this.gl?await this.texture(scene):null;
    if(ticket!==this.ticket)return false;
    this.backdrop.src=scene.image;this.backdrop.alt=scene.alt;this.backdrop.style.objectFit=scene.portrait?'contain':'cover';
    this.oldLook=[...this.smooth];this.oldZoom=this.zoom;this.pan=[0,0];this.smooth=[0,0];this.zoom=1;
    this.previous=this.current||item;this.oldFrame=this.current?this.frame(performance.now()):0;
    this.current=item;this.direction=direction;this.start=performance.now();
    this.duration=this.motion&&direction&&item&&this.stage.dataset.engine==='webgl'?850:0;
    if(this.gl&&item){this.stage.dataset.engine='webgl';}
    else{this.stage.dataset.engine='photo';if(direction&&this.motion)this.backdrop.animate([{opacity:.55},{opacity:1}],{duration:350});}
    for(const [key,cached] of this.cache){
      if(this.cache.size<=3)break;
      if(cached!==this.current&&cached!==this.previous){this.gl.deleteTexture(cached.tex);this.cache.delete(key);}
    }
    this.schedule();return true;
  }
  frame(now){return this.motion&&this.current?.atlas?Math.min(11,Math.max(0,(now-this.start)*.008)):0;}
  schedule(){if(!this.raf)this.raf=requestAnimationFrame(now=>this.draw(now));}
  draw(now){
    this.raf=0;
    const dt=Math.min(60,now-(this.lastTick||now));this.lastTick=now;
    const factor=this.motion?1-Math.exp(-Math.max(8,dt)/55):1;
    this.smooth=this.smooth.map((n,i)=>n+(this.pan[i]-n)*factor);
    const unsettled=this.smooth.some((n,i)=>Math.abs(n-this.pan[i])>.001);
    if(this.gl&&this.current){
      const gl=this.gl,l=this.loc,rect=this.stage.getBoundingClientRect();
      const ratio=Math.min(window.devicePixelRatio||1,1.8,2200/Math.max(1,rect.width));
      const width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));
      if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
      gl.viewport(0,0,width,height);
      const t=this.motion&&this.duration?Math.min(1,(now-this.start)/this.duration):1;
      const last=this.previous||this.current,frame=this.frame(now);
      [[last,this.oldFrame||0,l.oldData],[this.current,frame,l.newData]].forEach(([v,f,uniform],i)=>{
        gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,v.tex);gl.uniform4f(uniform,v.aspect,+v.atlas,f,+v.portrait);
      });
      gl.uniform1f(l.aspect,width/height);gl.uniform2fv(l.look,this.smooth);gl.uniform2fv(l.previousLook,this.oldLook);
      const aim=this.selected.aim||[0,0];gl.uniform2fv(l.aim,aim);gl.uniform1f(l.progress,Math.max(0,t));gl.uniform1f(l.direction,this.direction);
      const margin=this.selected.portrait?1:1.10;gl.uniform1f(l.zoom,this.zoom*margin);gl.uniform1f(l.previousZoom,this.oldZoom*(last.portrait?1:1.10));
      gl.drawArrays(gl.TRIANGLES,0,3);
      if(t<1||this.motion&&this.current.atlas&&frame<11)this.schedule();
    }else{
      this.backdrop.style.objectPosition=(50+this.smooth[0]*45)+'% '+(50+this.smooth[1]*45)+'%';
      this.backdrop.style.transform='scale('+this.zoom+')';
    }
    if(unsettled)this.schedule();
  }
}
