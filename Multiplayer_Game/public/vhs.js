import{tapeGrain}from'./tape-grain.js';
// Correlated luminance/chroma grain and head-switch noise without a 3D post-pass.
export function createVHS(){
 const layer=document.createElement('div');layer.id='vhs-layer';layer.setAttribute('aria-hidden','true');layer.innerHTML='<canvas id="vhs-noise" width="160" height="90"></canvas><div class="tape-tracking"></div><span class="tape-rec">● REC / SP</span><time></time>';document.body.append(layer);
 const noise=layer.querySelector('canvas'),small=matchMedia('(pointer:coarse)').matches;noise.width=small?192:320;noise.height=small?108:180;
 const ctx=noise.getContext('2d'),pixels=ctx.createImageData(noise.width,noise.height),clock=layer.querySelector('time');let mode='subtle',timer=null,ticks=0,strength=1,lastSecond=-1,noiseDirty=true;
 function tick(){if(document.hidden||mode==='off')return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced||mode==='tape'||ticks===0||noiseDirty){tapeGrain(pixels.data,noise.width,noise.height,ticks++,strength*(mode==='tape'?1:.48));ctx.putImageData(pixels,0,0);noiseDirty=false;}const now=Date.now(),second=Math.floor(now/1000);if(second!==lastSecond){clock.textContent=new Date(now).toLocaleString();lastSecond=second;}}
 function schedule(){clearInterval(timer);timer=null;if(!document.hidden&&mode!=='off'){tick();timer=setInterval(tick,matchMedia('(prefers-reduced-motion: reduce)').matches&&mode==='subtle'?1000:small?167:125);}}
 function set(value){mode=['off','subtle','tape'].includes(value)?value:'subtle';layer.hidden=mode==='off';layer.dataset.mode=mode;noiseDirty=true;schedule();}
 document.addEventListener('visibilitychange',schedule);set(mode);
 return{set,get:()=>mode,intensity(value){strength=Math.max(.25,Math.min(1.6,+value||1));noiseDirty=true;tick();},dispose(){clearInterval(timer);document.removeEventListener('visibilitychange',schedule);layer.remove();}};
}
