import {test} from 'node:test';
import assert from 'node:assert/strict';
import {firstPerson} from '../public/controls.js';

test('first-person input walks immediately, paints without a menu and clears held keys on mouse release',async t=>{
  const oldDocument=globalThis.document,oldAdd=globalThis.addEventListener;
  const documentEvents={},windowEvents={},elements=new Map();
  function element(id){if(!elements.has(id))elements.set(id,{hidden:false,textContent:'',onclick:null,classList:{toggle(){}},focus(){},setPointerCapture(){},hasPointerCapture(){return true;}});return elements.get(id);}
  globalThis.document={pointerLockElement:null,body:element('body'),getElementById:element,addEventListener:(type,fn)=>documentEvents[type]=fn};
  globalThis.addEventListener=(type,fn)=>windowEvents[type]=fn;
  t.after(()=>{globalThis.document=oldDocument;globalThis.addEventListener=oldAdd;});
  const canvasEvents={},canvas={...element('world'),addEventListener:(type,fn)=>canvasEvents[type]=fn,requestPointerLock:async()=>{document.pointerLockElement=canvas;documentEvents.pointerlockchange();}};
  const camera={position:{x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}},rotation:{set(){}}};
  let starts=0,moves=0,ends=0,uses=0;
  const controls=firstPerson(canvas,camera,{paintStart:()=>starts++,paintMove:()=>moves++,paintEnd:()=>ends++,interact:()=>uses++,drop(){},ready:()=>true,onChange(){}});
  assert.equal(camera.position.y,2.15,'the player viewpoint is raised consistently');
  await element('enter-world').onclick();
  const key=code=>({code,repeat:false,target:{tagName:'CANVAS'},preventDefault(){}});
  documentEvents.keydown(key('KeyW'));controls.update(1/60);assert.ok(camera.position.z<.3);
  documentEvents.keydown(key('ArrowRight'));assert.ok(camera.position.x>.3,'arrow taps nudge immediately between frames');documentEvents.keyup(key('ArrowRight'));
  documentEvents.keydown(key('KeyE'));assert.equal(uses,1);
  const use=element('interact-action');
  use.onpointerdown({button:0,preventDefault(){}});assert.equal(uses,2,'Use fires on press, without waiting for release');
  use.onclick({detail:1});assert.equal(uses,2,'the synthesized pointer click must not repeat Use');
  use.onclick({detail:0});assert.equal(uses,3,'keyboard and assistive clicks remain usable');
  assert.ok(controls.route().length,'movement retains collision steps until sent');controls.clearRoute();assert.equal(controls.route().length,0);
  canvasEvents.pointerdown({button:0});controls.update(1/60);assert.equal(starts,1);assert.ok(moves>0);
  documentEvents.pointerup({});assert.ok(ends>0);
  elements.get('paint-action').onpointerdown({pointerId:10});const beforeEnd=ends;
  documentEvents.pointerup({pointerId:11});controls.update(1/60);assert.equal(ends,beforeEnd,'releasing look must not release the separate paint button');
  elements.get('paint-action').onpointerup({pointerId:10});assert.ok(ends>beforeEnd);
  document.pointerLockElement=null;documentEvents.pointerlockchange();const stopped=camera.position.z;controls.update(1/60);assert.equal(camera.position.z,stopped);
  const pad=elements.get('walk-pad');pad.getBoundingClientRect=()=>({left:0,top:0,width:100,height:100});
  pad.onpointerdown({pointerId:20,clientX:90,clientY:50});
  pad.onpointerdown({pointerId:21,clientX:10,clientY:50});pad.onpointercancel({pointerId:21});
  const beforeWalk=camera.position.x;controls.update(1/60);assert.ok(camera.position.x>beforeWalk,'another finger cannot steal or cancel walking');
  pad.onlostpointercapture({pointerId:20});const afterWalk=camera.position.x;controls.update(1/60);assert.equal(camera.position.x,afterWalk,'lost touch capture stops movement');
  elements.get('paint-action').onpointerdown({pointerId:30});const beforeCancel=ends;
  canvasEvents.pointercancel({pointerId:31});assert.equal(ends,beforeCancel,'cancelling a look finger must preserve held painting');
  elements.get('paint-action').onlostpointercapture({pointerId:30});assert.ok(ends>beforeCancel);
  const forward=elements.get('move-forward'),lookPad=elements.get('look-pad');forward.onpointerdown({pointerId:40});lookPad.onpointerdown({pointerId:41,clientX:10,clientY:10});elements.get('paint-action').onpointerdown({pointerId:42});const beforeTouch={...controls.pose()};lookPad.onpointermove({pointerId:41,clientX:30,clientY:15});controls.update(1/60);assert.notEqual(controls.pose().yaw,beforeTouch.yaw,'the look pad pans while another finger walks and paints');assert.notEqual(controls.pose().z,beforeTouch.z);const paintingEnds=ends;forward.onlostpointercapture({pointerId:99});lookPad.onpointercancel({pointerId:41});assert.equal(ends,paintingEnds,'look cancellation preserves held painting');forward.onpointerup({pointerId:40});elements.get('paint-action').onpointerup({pointerId:42});controls.pause();const paused={...controls.pose()};controls.update(1/60);assert.deepEqual(controls.pose(),paused,'menus can release every screen-button input');

  controls.reset({x:.3,z:.3,yaw:0});documentEvents.keydown(key('KeyD'));
  for(let i=0;i<60;i++)controls.update(.05);
  const stalledRoute=controls.route();let prior={x:.3,z:.3},distance=0;
  for(const point of stalledRoute){distance+=Math.hypot(point.x-prior.x,point.z-prior.z);prior=point;}
  assert.ok(distance<=3,'backpressure cannot accumulate a route longer than the server accepts');
  assert.ok(JSON.stringify({type:'move',pose:controls.pose(),path:stalledRoute,revision:0}).length<8192,'movement fits the local WebSocket limit');
  const beforeResume=controls.pose().x;controls.clearRoute();controls.update(.05);assert.ok(controls.pose().x>beforeResume);controls.pause();
});
