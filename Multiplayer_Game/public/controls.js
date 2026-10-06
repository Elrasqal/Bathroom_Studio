import { walk } from './walk.js';
import {feetHeight,stoolContains} from './furnishings.js';

export function firstPerson(canvas,camera,{paintStart,paintMove,paintEnd,interact,drop,rotate=()=>{},ready,onChange,getRoom=()=>null}) {
  let route=[],routeDistance=0;
  const keys=new Set(),paintSources=new Set(),directions=new Map();let yaw=0,pitch=.1,drag=null,touchMove={x:0,z:0},painting=false,padPointer=null,paintPointer=null,lookPointer=null,support=null,lastNudge=-Infinity;
  function move(dx,dz){if(route.length>=96||routeDistance>=2.5)return;const room=getRoom();let previousX=camera.position.x,previousZ=camera.position.z;walk(camera.position,dx,dz,room?.furnishings,support,room?.heldProps,p=>{routeDistance+=Math.hypot(p.x-previousX,p.z-previousZ);previousX=p.x;previousZ=p.z;route.push({x:p.x,z:p.z});});if(support&&room&&!stoolContains(camera.position,room.furnishings.stool,.25))support=null;}
  const locked=()=>document.pointerLockElement===canvas;
  function look(dx,dy){yaw-=dx*.0022;yaw=Math.atan2(Math.sin(yaw),Math.cos(yaw));pitch=Math.max(-1.35,Math.min(1.35,pitch-dy*.0022));camera.rotation.set(pitch,yaw,0);onChange();}
  function stop(){keys.clear();directions.clear();paintSources.clear();drag=null;lookPointer=null;padPointer=null;paintPointer=null;touchMove={x:0,z:0};painting=false;paintEnd();}
  function start(source){if(!ready())return;paintSources.add(source);if(!painting){painting=true;paintStart();onChange();}}
  function finish(source){paintSources.delete(source);if(painting&&!paintSources.size){painting=false;paintEnd();}}
  async function enter(){if(!ready())return;canvas.focus();try{await canvas.requestPointerLock();}catch{document.getElementById('enter-world').textContent='Drag to look · hold Space to paint';document.getElementById('hint').textContent='Drag to look · WASD to walk · hold Space to paint · E to interact';}}
  document.getElementById('enter-world').onclick=enter;
  canvas.addEventListener('pointerdown',event=>{
    if(!ready()||event.button!==0)return;
    canvas.focus();
    if(locked()){start('mouse');return;}
    if(drag)return;canvas.setPointerCapture(event.pointerId);drag={id:event.pointerId,x:event.clientX,y:event.clientY};
  });
  document.addEventListener('pointermove',event=>{
    if(locked()&&ready()){look(event.movementX,event.movementY);if(painting)paintMove();}
    else if(ready()&&drag?.id===event.pointerId){look(event.clientX-drag.x,event.clientY-drag.y);drag.x=event.clientX;drag.y=event.clientY;if(painting)paintMove();}
  });
  document.addEventListener('pointerup',event=>{if(drag?.id===event.pointerId)drag=null;finish('mouse');});
  canvas.addEventListener('pointercancel',event=>{if(drag?.id===event.pointerId)drag=null;finish('mouse');});
  canvas.addEventListener('lostpointercapture',event=>{if(drag?.id===event.pointerId)drag=null;finish('mouse');});
  document.addEventListener('pointerlockchange',()=>{stop();if(locked())canvas.focus();document.getElementById('enter-world').hidden=locked();document.body.classList.toggle('walking',locked());});
  document.addEventListener('keydown',event=>{
    if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(event.target.tagName)||!ready())return;
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code))event.preventDefault();
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code))keys.add(event.code);if(event.repeat)return;
    onChange();
    // A tap on an arrow gives a small precise step, even between animation frames.
    const nudge={ArrowLeft:[-.07,0],ArrowRight:[.07,0],ArrowUp:[0,-.07],ArrowDown:[0,.07]}[event.code];
    if(nudge&&performance.now()-lastNudge>=80){lastNudge=performance.now();const [x,z]=nudge;move(x*Math.cos(yaw)+z*Math.sin(yaw),z*Math.cos(yaw)-x*Math.sin(yaw));onChange();}
    if(event.code==='KeyE')interact();if(event.code==='KeyQ')drop();if(event.code==='KeyR')rotate();if(event.code==='Space')start('key');
  });
  document.addEventListener('keyup',event=>{keys.delete(event.code);if(event.code==='Space')finish('key');});
  addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  const joystick=document.getElementById('walk-pad');
  function pad(event){const bounds=joystick.getBoundingClientRect();touchMove={x:Math.max(-1,Math.min(1,(event.clientX-bounds.left-bounds.width/2)/(bounds.width*.4))),z:Math.max(-1,Math.min(1,(event.clientY-bounds.top-bounds.height/2)/(bounds.height*.4)))};onChange();}
  joystick.onpointerdown=event=>{if(padPointer!==null||!ready())return;padPointer=event.pointerId;joystick.setPointerCapture(event.pointerId);pad(event);};joystick.onpointermove=event=>{if(event.pointerId===padPointer)pad(event);};
  function releasePad(event){if(event.pointerId!==padPointer)return;padPointer=null;touchMove={x:0,z:0};onChange();}
  joystick.onpointerup=joystick.onpointercancel=joystick.onlostpointercapture=releasePad;
  for(const[id,delta]of [['forward',[0,-1]],['back',[0,1]],['left',[-1,0]],['right',[1,0]]]){
    const button=document.getElementById('move-'+id);
    button.onpointerdown=e=>{if(!ready()||directions.has(e.pointerId))return;directions.set(e.pointerId,delta);button.setPointerCapture(e.pointerId);onChange();};
    const release=e=>{if(directions.get(e.pointerId)!==delta)return;directions.delete(e.pointerId);onChange();};button.onpointerup=button.onpointercancel=button.onlostpointercapture=release;
  }
  const lookPad=document.getElementById('look-pad');
  lookPad.onpointerdown=e=>{if(!ready()||lookPointer)return;lookPointer={id:e.pointerId,x:e.clientX,y:e.clientY};lookPad.setPointerCapture(e.pointerId);};
  lookPad.onpointermove=e=>{if(lookPointer?.id!==e.pointerId)return;look(e.clientX-lookPointer.x,e.clientY-lookPointer.y);lookPointer.x=e.clientX;lookPointer.y=e.clientY;if(painting)paintMove();};
  lookPad.onpointerup=lookPad.onpointercancel=lookPad.onlostpointercapture=e=>{if(lookPointer?.id===e.pointerId)lookPointer=null;};
  const paintButton=document.getElementById('paint-action');paintButton.onpointerdown=event=>{if(paintPointer!==null||!ready())return;paintPointer=event.pointerId;paintButton.setPointerCapture(event.pointerId);start('touch');};
  function releasePaint(event){if(event.pointerId!==paintPointer)return;paintPointer=null;finish('touch');onChange();}
  paintButton.onpointerup=paintButton.onpointercancel=paintButton.onlostpointercapture=releasePaint;
  for(const [id,action] of [['interact-action',interact],['drop-action',drop],['rotate-action',rotate]]){
    const button=document.getElementById(id);
    button.onpointerdown=event=>{if(event.button!==0||!ready())return;event.preventDefault();onChange();action();};
    // Keyboard and assistive activation have no pointer click count.
    button.onclick=event=>{if(event.detail===0&&ready()){onChange();action();}};
  }
  camera.position.set(.3,2.15,.3);camera.rotation.set(pitch,yaw,0);
  return {
    pause:stop,
    route:()=>route.slice(),
    clearRoute:()=>{route=[];routeDistance=0;},
    isActive:()=>keys.size>0||directions.size>0||painting||Math.abs(touchMove.x)+Math.abs(touchMove.z)>0,
    reset(pose){stop();route=[];routeDistance=0;support=pose.support||null;const f=getRoom()?.furnishings;camera.position.set(pose.x,2.15+(f?feetHeight(pose,f):0),pose.z);yaw=pose.yaw||0;camera.rotation.set(pitch,yaw,0);onChange();},
    correct(pose){route=[];routeDistance=0;support=pose.support||null;const f=getRoom()?.furnishings;camera.position.set(pose.x,2.15+(f?feetHeight(pose,f):0),pose.z);onChange();},
    elevate(pose){route=[];routeDistance=0;support=pose.support||null;camera.position.x=pose.x;camera.position.z=pose.z;onChange();},
    hasMotion(){const f=getRoom()?.furnishings;return Boolean(f&&Math.abs(camera.position.y-2.15-feetHeight({...camera.position,support},f))>.002);},
    update(dt){
      if(!ready())return false;
      let x=touchMove.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
      let z=touchMove.z+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
      for(const[dx,dz]of directions.values()){x+=dx;z+=dz;}
      const length=Math.max(1,Math.hypot(x,z));x=x/length*dt*3.1;z=z/length*dt*3.1;
      const beforeX=camera.position.x,beforeZ=camera.position.z,beforeY=camera.position.y;
      move(x*Math.cos(yaw)+z*Math.sin(yaw),z*Math.cos(yaw)-x*Math.sin(yaw));
      const f=getRoom()?.furnishings;if(f){const target=2.15+feetHeight({...camera.position,support},f);camera.position.y=Math.abs(camera.position.y-target)<.002?target:camera.position.y+(target-camera.position.y)*(1-Math.exp(-dt*12));}
      if(painting)paintMove();
      return camera.position.x!==beforeX||camera.position.z!==beforeZ||camera.position.y!==beforeY;
    },
    pose:()=>({x:camera.position.x,z:camera.position.z,yaw,...(support?{support}:{})})
  };
}
