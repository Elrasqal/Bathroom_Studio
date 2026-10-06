import * as THREE from '/three.js';
import { firstPerson } from './controls.js';
import {movementSync} from './movement-sync.js';
import { buildBathroom } from './scene.js';
import {PAPER_IDS,paperId,paperSurface} from './paper.js';
import {drawPaperStroke,paperBase,paperSteps} from './paper-paint.js';
import {artworkReplay} from './replay.js';
import{printPage}from'./print-paint.js';
import { Predictions, drawStroke, strokeSteps, seedFor } from './paint.js';
import { humidityAt } from './environment.js';
import { FOG_THRESHOLD, drawFog, liveFogMarks } from './fog.js';
import { QUALITY, renderRatio } from './performance.js';
import { createFramePump } from './frame-pump.js';
import { createSoundscape } from './audio.js';
import {createVHS} from './vhs.js';
import{drawLabel}from'./labels.js';
import{createLabelEditor}from'./label-editor.js';

const $=id=>document.getElementById(id),canvas=$('world');
const tape=createVHS();try{tape.set(localStorage.getItem('bathroom-vhs')||'subtle');}catch{}
function setTape(mode){tape.set(mode);$('vhs-mode').value=mode;try{localStorage.setItem('bathroom-vhs',mode);}catch{}sound.setTape(mode!=='off');}
const tabs=['room','guide','display','sound'];
for(const[name,index]of tabs.map((name,index)=>[name,index])){const button=$('tab-'+name);button.tabIndex=index? -1:0;button.onclick=()=>{for(const other of tabs){$('tab-'+other).setAttribute('aria-selected',String(other===name));$('tab-'+other).tabIndex=other===name?0:-1;$('panel-'+other).hidden=other!==name;}$('studio').scrollTop=0;};button.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.code))return;event.preventDefault();const target=event.code==='Home'?0:event.code==='End'?tabs.length-1:(index+(event.code==='ArrowRight'?1:tabs.length-1))%tabs.length;$('tab-'+tabs[target]).click();$('tab-'+tabs[target]).focus();};}
const sound=createSoundscape({onStatus:message=>$('audio-status').textContent=message});
$('vhs-mode').value=tape.get();sound.setTape(tape.get()!=='off');$('vhs-mode').onchange=()=>setTape($('vhs-mode').value);
sound.ready.then(manifest=>{if(!manifest)return;for(const effect of manifest.effects||[]){const li=document.createElement('li'),a=document.createElement('a');a.href=effect.source;a.target='_blank';a.rel='noreferrer';a.textContent=effect.key+' · '+effect.creator+' · '+effect.license;li.append(a);$('audio-effects').append(li);}for(const track of manifest.music){const li=document.createElement('li');li.textContent=track.title+' · '+track.album;$('audio-tracks').append(li);}});
$('sound-enabled').onchange=()=>sound.enable($('sound-enabled').checked);
for(const kind of ['music','ambience','effects'])$('volume-'+kind).oninput=event=>sound.setVolume(kind,event.target.value);
const carriedProp=()=>Object.keys(room?.heldProps||{}).find(key=>room.heldProps[key]===me);
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{if(connected())sound.unlock();},{capture:true});
const mobile=matchMedia('(pointer:coarse)').matches;
let quality=mobile?'mobile':'fast';try{const saved=localStorage.getItem('bathroom-quality');if(QUALITY[saved])quality=saved;}catch{}
$('quality').value=quality;
function layer(){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=640;return{canvas,ctx:canvas.getContext('2d')};}
const papers=Object.fromEntries(PAPER_IDS.map(id=>{const committed=layer(),display=layer();committed.canvas.width=display.canvas.width=384;committed.canvas.height=display.canvas.height=128;const texture=new THREE.CanvasTexture(display.canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;paperBase(display.ctx);return[id,{committed,display,texture,dirty:true}];}));
const labels=new Map();
const prints=[0,1].map(()=>{const art=layer(),page=layer();page.canvas.width=320;page.canvas.height=256;art.canvas.width=256;const texture=new THREE.CanvasTexture(page.canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;printPage(page.ctx,art.canvas,null);return{art,page,texture,photo:null,dirty:false};});
const base=layer(),committed=layer(),composite=layer(),display=layer();
base.ctx.fillStyle='#fff5da';base.ctx.fillRect(0,0,512,640);
for(let x=0;x<512;x+=4){base.ctx.fillStyle='rgba(130,110,65,.035)';base.ctx.fillRect(x,0,1,640);}
base.ctx.fillStyle='#c8ae80';base.ctx.fillRect(0,585,512,4);base.ctx.fillRect(0,597,512,2);
const texture=new THREE.CanvasTexture(display.canvas);texture.colorSpace=THREE.SRGBColorSpace;
const fogLayer=layer();fogLayer.canvas.height=360;
const fogTexture=new THREE.CanvasTexture(fogLayer.canvas);fogTexture.colorSpace=THREE.SRGBColorSpace;
for(const dynamicTexture of [texture,fogTexture]){dynamicTexture.generateMipmaps=false;dynamicTexture.minFilter=THREE.LinearFilter;}
const world=buildBathroom(canvas,texture,fogTexture,Object.fromEntries(Object.entries(papers).map(([id,p])=>[id,p.texture])),prints.map(p=>p.texture)),{camera,renderer}=world;
world.setQuality(quality);
let laundryMotion=true;try{laundryMotion=localStorage.getItem('bathroom-laundry-motion')!=='off';}catch{}
$('laundry-motion').checked=laundryMotion;world.setLaundryMotion(laundryMotion);
$('laundry-motion').onchange=()=>{laundryMotion=$('laundry-motion').checked;world.setLaundryMotion(laundryMotion);try{localStorage.setItem('bathroom-laundry-motion',laundryMotion?'on':'off');}catch{}sceneDirty=true;wake();};
const predictions=new Predictions();
const replay=artworkReplay(record=>{if(record.label)return labelSteps(record);if(record.photo)return photoSteps(record);const id=paperSurface(record);return id?paperSteps(papers[id].committed.ctx,record):strokeSteps(committed.ctx,record);},{onProgress:record=>{if(record.label){const p=labels.get(record.label.player);if(p?.label.id===record.label.id)p.dirty=true;}else if(record.photo)prints[record.photo.slot].dirty=true;else{const id=paperSurface(record);if(id)papers[id].dirty=true;else dirty=true;}}});
let room,me,socket,session,token,retries=0,focus=true,color='#ef7066',tool='squeeze',requestedTool,strokeSize=.02,needsSpawn=true;
let mixerColor='#589687';
let stampPattern='duck',stampTurn=0;
let lastPainted='towel',nextPrintSlot=0,labelRequest=null;
const labelEditor=createLabelEditor({apply:crop=>{if(!send({type:'label',...labelRequest,crop})){labelEditor.failed();toast('Reconnect before wearing your label.');}},onClose:()=>{controls.pause();canvas.focus();wake();}});
let draft=null,drawing=false,pointerId=null,lastPoint=null,lastFlush=0,dirty=true,sceneDirty=true,firstInputAt=null;
let serverOffset=0,ackMs=null,inputMs=null,frameMs=0,lastFrame=performance.now(),lastStats=0;
let activeSurface='towel',fogDirty=true,lastFogFrame=0;
let pump=null,lastFogPrune=0,renderMs=0,drawnFrames=0,drawnSince=performance.now(),drawnRate=0,graphicsPaused=false;
let lastRestoreUpload=0;
let previousAimChecks=0,aimRate=0,renderSamples=0;
function wake(){if(!graphicsPaused)pump?.wake();}
const names={squeeze:'Toothpaste tube',brush:'Toothbrush',spray:'Mouthwash spray',sponge:'Sponge',stamp:'Rubber duck stamp'};

function transition(message){$('transition-label').textContent=message;$('transition').hidden=false;clearTimeout(transition.timer);transition.timer=setTimeout(()=>$('transition').hidden=true,650);}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,5000);}
function connected(){return socket?.readyState===1&&room&&!needsSpawn;}
function editable(){return connected()&&(me===room.owner||room.grants.includes(me)||room.public&&room.publicPainting!==false);}
function wetness(){return room?Math.min(1,Math.max(0,1-(Date.now()+serverOffset-room.wetAt)/60000)):0;}
function send(message){
  if(socket?.readyState!==1)return false;
  if(!['move','join','ping'].includes(message.type)&&connected()&&!movement.flush())return false;
  if(socket.bufferedAmount>128000){cancelPainting();toast('Connection is falling behind. Painting is paused while it catches up.');return false;}
  socket.send(JSON.stringify(message));return true;
}
function cancelPainting(){for(const p of Object.values(papers))p.dirty=true;sound.stopPaint();drawing=false;draft=null;lastPoint=null;predictions.clear();dirty=true;fogDirty=true;firstInputAt=null;wake();}
function compose(){
  composite.ctx.clearRect(0,0,512,640);composite.ctx.drawImage(committed.canvas,0,0);
  predictions.values().filter(stroke=>stroke.tool!=='fog'&&!paperSurface(stroke)).forEach(stroke=>drawStroke(composite.ctx,stroke));
  if(draft?.points.length&&draft.tool!=='fog'&&!paperSurface(draft))drawStroke(composite.ctx,draft);
  display.ctx.drawImage(base.canvas,0,0);display.ctx.drawImage(composite.canvas,0,0);texture.needsUpdate=true;dirty=false;
}
function fitTowel(spec){
  const height=Math.round(512*spec.height/spec.width);
  if(display.canvas.height!==height)texture.dispose();
  for(const item of [base,committed,composite,display])item.canvas.height=height;
  base.ctx.fillStyle='#fff5da';base.ctx.fillRect(0,0,512,height);
  base.ctx.fillStyle='rgba(130,110,65,.035)';for(let x=0;x<512;x+=4)base.ctx.fillRect(x,0,1,height);
  base.ctx.fillStyle='#c8ae80';base.ctx.fillRect(0,height*.92,512,4);base.ctx.fillRect(0,height*.94,512,2);
}
function settings(point){const id=crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');return{id,surface:activeSurface,generation:room.generation,tool:activeSurface==='mirror'?'fog':tool,...(tool==='stamp'&&activeSurface!=='mirror'?{pattern:stampPattern,turn:stampTurn}:{}),epoch:room.fogEpoch,at:Date.now()+serverOffset,color,size:strokeSize,points:point?[point]:[],seed:seedFor(id)};}
function invalidate(){if(paperId(activeSurface)){papers[activeSurface].dirty=true;}else if(activeSurface==='mirror')fogDirty=true;else dirty=true;wake();}
function flush(continueStroke=false){
  if(!draft?.points.length)return;
  const command=draft,end=command.points.at(-1);
  if(!editable()||!predictions.add(command,performance.now())){cancelPainting();toast('Waiting for the server. Painting is paused.');return;}
  if(!send({type:command.tool==='fog'?'fog':'stroke',...command})){predictions.reject(command.id);cancelPainting();return;}
  lastFlush=performance.now();draft=null;lastPoint=continueStroke?end:null;invalidate();
}
function endPainting(){sound.stopPaint();if(drawing&&focus)flush(false);drawing=false;lastPoint=null;draft=null;pointerId=null;}
function beginPoint(point){draft=settings(point);lastPoint=point;invalidate();firstInputAt??=performance.now();}
function addPoint(event){
  const hit=world.paintHit(event),point=hit?.point;
  if(!point||hit.surface!==activeSurface){if(draft?.points.length)flush(false);lastPoint=null;return;}
  if(!draft){
    if(lastPoint&&Math.hypot(point[0]-lastPoint[0],point[1]-lastPoint[1])<.001)return;
    const previous=lastPoint;beginPoint(previous||point);if(previous)draft.points.push(point);lastPoint=point;return;
  }
  if(lastPoint&&Math.hypot(point[0]-lastPoint[0],point[1]-lastPoint[1])<.001)return;
  if(draft.points.length<32)draft.points.push(point);else draft.points[31]=point;
  lastPoint=point;invalidate();firstInputAt??=performance.now();
}

function renderControls(){
  if(!room)return;
  $('room-code').textContent=room.code;
  $('players').replaceChildren();
  $('room-visibility').textContent=(room.public?'PUBLIC':'PRIVATE')+' · 4 SEATS';$('listing-controls').hidden=me!==room.owner;if(document.activeElement!==$('public-name'))$('public-name').value=room.roomName||'';$('room-public').checked=Boolean(room.public);$('public-painting').checked=room.publicPainting!==false;
  room.players.filter(p=>p.online||p.id===room.owner).forEach(p=>{
    const row=document.createElement('div');row.textContent=`${p.name}${p.id===me?' (you)':''} · ${p.online?'here':'away'}${p.id===room.owner?' · towel owner':''}`;
    if(me===room.owner&&p.id!==me){const button=document.createElement('button'),allowed=room.grants.includes(p.id);button.textContent=allowed?'Revoke painting access':'Allow collaboration';button.onclick=()=>send({type:'grant',player:p.id,allow:!allowed});row.append(button);if(p.online){const kick=document.createElement('button');kick.textContent='Remove from this bathroom';kick.onclick=()=>send({type:'kick',player:p.id});row.append(kick);}}
    $('players').append(row);
  });
  world.updatePlayers(room.players,me);world.updateFixtures(room);world.updateHeld(tool,color);$('held-status').textContent=requestedTool?'Picking up '+names[requestedTool]+'…':names[tool];sceneDirty=true;wake();
}
function selectTool(name){
  endPainting();
  if(name==='squeeze'){
    if(tool!=='squeeze')send({type:'tool',tool,pickup:false});tool='squeeze';requestedTool=null;renderControls();return;
  }
  requestedTool=name;renderControls();if(!send({type:'tool',tool:name,pickup:true})){requestedTool=null;renderControls();toast('Reconnect to pick up a tool.');}
}

function applyMetadata(metadata){
  if(drawing&&paperId(activeSurface)&&metadata.furnishings&&(metadata.furnishings.paperTurns?.[activeSurface]||0)!==(room.furnishings.paperTurns?.[activeSurface]||0))endPainting();
  Object.assign(room,metadata);serverOffset=metadata.serverTime-Date.now();
  if(!editable())cancelPainting();
  if(requestedTool&&room.tools[requestedTool]===me){tool=requestedTool;requestedTool=null;}
  if(tool!=='squeeze'&&room.tools[tool]!==me){tool='squeeze';draft=null;drawing=false;dirty=true;}
  renderControls();
}
function preparePrint(photo){const p=prints[photo.slot];p.photo=photo;const spec=room.towels.find(t=>t.id===photo.towelId);p.art.canvas.height=photo.surface==='towel'?Math.round(256*spec.height/spec.width):85;p.art.ctx.clearRect(0,0,256,p.art.canvas.height);p.dirty=true;return photo.strokes.map(stroke=>({stroke,photo:{slot:photo.slot,at:photo.at}}));}
function* photoSteps(record){const p=prints[record.photo.slot],job=paperSurface(record.stroke)?paperSteps(p.art.ctx,record.stroke):strokeSteps(p.art.ctx,record.stroke);try{while(p.photo?.at===record.photo.at){if(job.next().done)return;yield;}}finally{job.return();}}
function prepareLabel(label){if(labels.get(label.player)?.label.id===label.id)return[];const p={label,art:layer(),output:layer(),dirty:true};p.art.canvas.width=256;p.art.canvas.height=label.surface==='towel'?Math.round(256*room.towels.find(t=>t.id===label.towelId).height/room.towels.find(t=>t.id===label.towelId).width):85;p.output.canvas.width=160;p.output.canvas.height=200;p.art.ctx.fillStyle='#fff5da';p.art.ctx.fillRect(0,0,p.art.canvas.width,p.art.canvas.height);labels.set(label.player,p);return label.strokes.map(stroke=>({stroke,label:{player:label.player,id:label.id}}));}
function* labelSteps(record){const p=labels.get(record.label.player);if(!p||p.label.id!==record.label.id)return;const job=paperSurface(record.stroke)?paperSteps(p.art.ctx,record.stroke):strokeSteps(p.art.ctx,record.stroke);try{while(labels.get(record.label.player)?.label.id===record.label.id){if(job.next().done)return;yield;}}finally{job.return();}}
function connect(){
  needsSpawn=true;
  const ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/socket`);socket=ws;$('connection').textContent='Connecting…';transition('Opening your bathroom…');
  ws.onopen=()=>{if(ws===socket)send({type:'join',...session});};
  ws.onmessage=event=>{
    if(ws!==socket)return;
    wake();
    const message=JSON.parse(event.data);
    if(message.type==='error'){
      if(message.id){for(const p of Object.values(papers))p.dirty=true;predictions.reject(message.id);if(draft?.id===message.id)draft=null;dirty=true;fogDirty=true;}else if(message.command==='stroke'||message.command==='fog')cancelPainting();
      if(message.command==='tool'){requestedTool=null;renderControls();}
      if(message.command==='label')labelEditor.failed();toast(message.message);
      if(!room){$('connection').textContent='Could not join';$('join-form').querySelectorAll('button').forEach(button=>button.disabled=false);}return;
    }
    if(message.type==='joined'){me=message.id;retries=0;needsSpawn=true;movement.reset();return;}
    if(message.type==='effect'){world.react(message.effect);sound.play(message.effect,message.position);sceneDirty=true;return;}
    if(message.type==='photo'&&room){room.photos=(room.photos||[]).filter(p=>p.slot!==message.photo.slot);room.photos.push(message.photo);for(const job of preparePrint(message.photo))replay.append(job);nextPrintSlot=1-message.photo.slot;transition('Instant print developed · displayed on the bathroom wall');return;}
    if(message.type==='label'&&room){for(const job of prepareLabel({...message.label,player:message.player}))replay.append(job);if(message.player===me){labelEditor.close();transition('Your artwork is framed on your toothpaste tube');}return;}
    if(message.type==='pose'&&room){const player=room.players.find(p=>p.id===message.player);if(player)player.pose=message.pose;if(message.player===me){if(movement.reconcile(message))cancelPainting();}world.updatePose(message.player,message.pose);sceneDirty=true;return;}
    if(message.type==='fog-reset'&&room){room.fogMarks=[];room.fogEpoch=message.epoch;cancelPainting();return;}
    if(message.type==='fog'&&room){
      if(message.epoch!==room.fogEpoch){send({type:'sync'});return;}
      predictions.accept(message.mark,me,performance.now());
      if(!room.fogMarks.some(mark=>mark.id===message.mark.id&&mark.player===message.mark.player))room.fogMarks.push(message.mark);
      fogDirty=true;return;
    }
    if(message.type==='state'){
      const entering=needsSpawn;const previousPhase=room?.laundry?.phase;const exchanged=room&&room.activeTowel!==message.room.activeTowel;cancelPainting();room=message.room;fitTowel(room.towels.find(t=>t.id===room.activeTowel));world.setTowel(room.activeTowel);if(exchanged)transition('Artwork stored · fresh towel hung');else if(previousPhase!==room.laundry?.phase&&room.laundry?.phase==='loaded')transition('Towel loaded · press the washer start button');else if(previousPhase!==room.laundry?.phase&&room.laundry?.phase==='carrying')transition('Wet towel collected · load the dryer door');else if(previousPhase!==room.laundry?.phase&&room.laundry?.phase==='dryer-loaded')transition('Dryer loaded · press its start button');else if(previousPhase!==room.laundry?.phase&&room.laundry?.phase==='washing')transition('Washing towel · 20 seconds');else if(previousPhase!==room.laundry?.phase&&room.laundry?.phase==='drying')transition('Drying towel · 20 seconds');else if(previousPhase!==room.laundry?.phase&&room.laundry?.phase==='wet')transition('Wash finished · collect the wet towel from the washer door');else if(previousPhase==='drying'&&room.laundry?.phase==='ready')transition('Fresh towel · ready to paint');if(needsSpawn){controls.reset(room.players.find(p=>p.id===me)?.pose||{x:.3,z:.3,yaw:0});needsSpawn=false;}tool=Object.keys(room.tools).find(name=>room.tools[name]===me)||'squeeze';requestedTool=null;
      committed.ctx.clearRect(0,0,512,display.canvas.height);for(const p of Object.values(papers))p.committed.ctx.clearRect(0,0,384,128);for(const p of prints){p.photo=null;p.dirty=true;}labels.clear();replay.reset([...room.strokes,...(room.photos||[]).flatMap(preparePrint),...(room.labels||[]).flatMap(prepareLabel)]);dirty=true;nextPrintSlot=room.photos?.length?1-room.photos.at(-1).slot:0;
      session={...session,create:false,code:room.code};
      try{sessionStorage.setItem('bathroom-session',JSON.stringify({name:session.name,code:room.code,create:false}));}catch{}
      $('lobby').hidden=true;$('studio').hidden=false;$('toggle-controls').hidden=false;$('play-hud').hidden=false;document.body.classList.remove('in-lobby');if(entering){document.body.classList.add('controls-hidden');$('toggle-controls').textContent='Room & settings';}$('connection').textContent='Connected · all paint saved';sound.visibility(false);applyMetadata(room);return;
    }
    if(message.type==='meta'&&room){applyMetadata(message.room);return;}
    if(message.type==='stroke'&&room){
      const stroke=message.stroke;
      if(stroke.sequence<=room.sequence){predictions.accept(stroke,me,performance.now());return;}
      if(stroke.generation!==room.generation||stroke.sequence>room.sequence+1){cancelPainting();send({type:'sync'});return;}
      const delay=predictions.accept(stroke,me,performance.now());if(delay!==null)ackMs=ackMs===null?delay:ackMs*.8+delay*.2;
      if(stroke.sequence>room.sequence){replay.append(stroke);room.sequence=stroke.sequence;room.strokes.push(stroke);}
      dirty=true;
    }
  };
  ws.onclose=event=>{
    if(ws!==socket)return;
    controls.pause();labelEditor.failed();cancelPainting();$('connection').textContent='Disconnected · unsaved preview removed';renderControls();
    if(room&&![4001,4003].includes(event.code)&&retries++<6)setTimeout(()=>{if(ws===socket)connect();},Math.min(500*2**retries,10000));
    else{toast(event.code===4003?'The host removed you. Use Leave bathroom to find another studio.':event.code===4001?'This artist is connected in another tab.':'Connection lost. Refresh to try again.');if(!room)$('join-form').querySelectorAll('button').forEach(button=>button.disabled=false);}
  };ws.onerror=()=>{};
}
try{
  token=localStorage.getItem('bathroom-key');if(!/^[a-f0-9]{64}$/.test(token||'')){token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem('bathroom-key',token);}
}catch{toast('Browser storage is required to keep your ownership key.');}
$('join-form').onsubmit=event=>{
  event.preventDefault();if(!token)return;
  const old=socket;socket=null;old?.close();room=null;
  session={name:$('name').value.trim(),token,public:$('create-public').checked,create:(event.submitter?.value||($('code').value.trim()?'join':'create'))==='create',code:$('code').value.trim().toUpperCase()};
  $('join-form').querySelectorAll('button').forEach(button=>button.disabled=true);connect();
};
try{const saved=JSON.parse(sessionStorage.getItem('bathroom-session'));if(saved?.code&&token){session={...saved,token};connect();}}catch{}


function rotateRoll(){const hit=world.paintHit();endPainting();if(tool==='stamp'){stampTurn=(stampTurn+1)%4;world.setStamp(stampPattern,stampTurn);sceneDirty=true;wake();sound.play('click');toast(stampPattern+' stamp turned '+stampTurn*90+' degrees.');return;}if(!paperId(hit?.surface)){toast('Aim at a spare roll to turn it, or hold the stamp to rotate its design.');return;}send({type:'furnishing',fixture:'paper-turn',prop:hit.surface});}
function saveCanvas(source,label){source.toBlob(blob=>{if(!blob){toast('The browser could not save this image.');return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Bathroom-Studio-'+room.code+'-'+label+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});}
function interact(){
  wake();
  const carried=carriedProp();
  if(carried==='stool'||paperId(carried)&&world.interact()?.action!=='slot'){const position=world.placementPoint();if(position)send({type:'prop',prop:carried,action:'place',...position});else toast('Aim at clear floor nearby to place your carried object.');return;}
  const hit=world.interact();if(!hit)return;
  endPainting();
  if(hit.action==='vhs-tape'){setTape(tape.get()==='off'?'tape':'off');sound.play('click');toast(tape.get()==='off'?'Tape playback stopped.':'VHS playback: tracking, grain and occasional crackle.');return;}
  if(hit.action==='drawer'){send({type:'furnishing',fixture:'drawer',index:hit.index,open:!room.furnishings.drawers?.[hit.index]});return;}
  if(['washer-load','dryer-load','washer-start','dryer-start'].includes(hit.action)){send({type:'furnishing',fixture:hit.action});return;}
  if(hit.action==='prompt'){const prompts=['Paint a moonlit garden on a hand towel.','Use tile stamps to make a repeating border.','Decorate a spare roll with a cloud of pastel bubbles.','Mix a new mint shade and paint a tiny sunset.'];interact.prompt=((interact.prompt??-1)+1)%prompts.length;sound.play('paper');toast('Studio postcard: '+prompts[interact.prompt]);return;}
  if(hit.action==='label-station'){if(replay.active()||predictions.pending.size){toast('Wait for the artwork to finish saving before framing it.');return;}if(carried){toast('Put down your carried object before framing a label.');return;}const p=papers[lastPainted],source=layer(),background=p?p.display.canvas:base.canvas;source.canvas.width=background.width;source.canvas.height=background.height;if(p)paperBase(source.ctx);else source.ctx.drawImage(base.canvas,0,0);source.ctx.drawImage(p?p.committed.canvas:committed.canvas,0,0);labelRequest={surface:lastPainted,generation:room.generation,sequence:room.sequence};controls.pause();if(document.pointerLockElement)document.exitPointerLock();labelEditor.open(source.canvas);return;}
  if(hit.action==='stamp-pattern'){if(tool!=='stamp'){toast('Pick up the rubber stamp on the shower shelf first.');return;}stampPattern=hit.pattern;world.setStamp(stampPattern,stampTurn);sceneDirty=true;sound.play('click');transition('Rubber insert fitted: '+stampPattern);return;}
  if(hit.action==='export-art'){if(replay.active()||predictions.pending.size){toast('Wait for the saved artwork to finish sharing before exporting.');return;}const output=layer(),paper=papers[lastPainted];const background=paper?paper.display.canvas:base.canvas;output.canvas.width=background.width;output.canvas.height=background.height;if(paper)paperBase(output.ctx);else output.ctx.drawImage(base.canvas,0,0);output.ctx.drawImage(paper?paper.committed.canvas:committed.canvas,0,0);saveCanvas(output.canvas,lastPainted==='towel'?room.activeTowel:lastPainted);sound.play('paper');toast('Saved artwork at its native canvas resolution.');return;}
  if(hit.action==='mix'){const blend=hex=>hex.match(/[a-f0-9]{2}/gi).map((v,i)=>Math.round((parseInt(v,16)+parseInt(color.slice(1).match(/.{2}/g)[i],16))/2).toString(16).padStart(2,'0')).join('');const previous=mixerColor;mixerColor=color;color='#'+blend(previous);world.updateHeld(tool,color);sound.play('wet');toast('Loaded paste blended with the soap-dish color. Previous paste stored for the next mix.');sceneDirty=true;return;}
  if(hit.action==='radio'){sound.toggle();sound.play('click');return;}
  if(hit.action==='camera'){send({type:'photo',surface:lastPainted,slot:nextPrintSlot});return;}
  if(hit.action==='print'){const p=prints[hit.slot];if(!p.photo){toast('Use the instant camera in the utility room to display a study.');return;}if(replay.active()){toast('Let the saved print finish developing.');return;}p.page.canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Bathroom-Studio-'+room.code+'-study-'+(hit.slot+1)+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});toast('Your framed study is saved as a PNG.');return;}
  if(hit.action==='prop'){send({type:'prop',prop:hit.prop,action:'take'});return;}
  if(hit.action==='stool'){send({type:'prop',prop:'stool',action:'take'});return;}
  if(hit.action==='slot'){if(carried)send({type:'prop',prop:carried,action:'place',slot:hit.slot});return;}
  if(hit.action==='climb'){send({type:'climb'});return;}
  if(['cabinet','curtain','rack','washer','dryer','flush','duck','paper'].includes(hit.action)){
    const f=room.furnishings,payload={type:'furnishing',fixture:hit.action};
    if(hit.action==='cabinet')Object.assign(payload,{index:hit.index,open:!f.doors[hit.index]});
    if(hit.action==='curtain')payload.open=!f.curtainOpen;
    if(hit.action==='rack')payload.height=Math.max(2.15,Math.min(5.7,f.rackHeight+hit.delta));
    if(hit.action==='washer')payload.on=!f.washer;
    send(payload);return;
  }
  if(hit.action==='lights')send({type:'fixture',fixture:'lights',on:!room.lights});
  else if(hit.action==='wet')send({type:'fixture',fixture:'wet'});
  else if(hit.action==='shower')send({type:'fixture',fixture:'shower',on:!room.environment.shower});
  else if(hit.action==='fan')send({type:'fixture',fixture:'fan',on:!room.environment.fan});
  else if(hit.action==='lighting'){const modes=['day','evening','night'];send({type:'fixture',fixture:'lighting',mode:modes[(modes.indexOf(room.lighting)+1)%3]});}
  else if(hit.action==='towel'){send({type:'towel',towel:hit.towelId,generation:room.generation});}
  else if(hit.action==='color'){color=hit.color;world.updateHeld(tool,color);sceneDirty=true;sound.play('click');toast('Toothpaste color loaded.');}
  else if(hit.action==='size'){strokeSize=hit.size;sound.play('rail');toast('Nozzle fitted.');}
  else if(hit.action==='door'){sound.play('close');toast('This private studio is your current play area.');}
  else selectTool(hit.action);
}
function startPainting(){
  if(replay.active()){toast('Restoring saved artwork. You can still walk and explore.');return;}
  if(carriedProp()){toast('Place your carried object before painting.');return;}
  if(!editable()){toast('The towel owner can allow collaboration in the artist list.');return;}
  if(requestedTool)return;
  if(room.laundry?.phase==='carrying'&&me===room.owner){toast('Take the wet towel to the dryer door, then press its start button.');return;}
  const hit=world.paintHit();if(!hit)return;
  activeSurface=hit.surface;if(activeSurface==='towel'&&room.laundry?.phase!=='ready'){toast('Wash, then dry the towel before painting again.');return;}
  if(activeSurface!=='mirror')lastPainted=activeSurface;
  if(activeSurface==='mirror'&&humidityAt(room.environment,Date.now()+serverOffset)<FOG_THRESHOLD){toast('Run the hot shower until the mirror fogs up. Drawings here are temporary.');return;}
  if(activeSurface==='towel'&&tool==='sponge'&&wetness()<=.05){toast('Use the faucet to dampen the towel before cleaning.');return;}
  const point=hit.point;
  drawing=true;lastFlush=performance.now();beginPoint(point);
}
const controls=firstPerson(canvas,camera,{getRoom:()=>room,paintStart:startPainting,paintMove:()=>{if(drawing)addPoint();},paintEnd:endPainting,interact,rotate:rotateRoll,drop:()=>{const prop=carriedProp();if(prop)send({type:'prop',prop,action:'release'});else selectTool('squeeze');},ready:()=>!graphicsPaused&&!labelEditor.active()&&Boolean(connected())&&!(!document.body.classList.contains('controls-hidden')&&room),onChange:()=>{sceneDirty=true;wake();}});
$('toggle-controls').textContent='Room & settings';
$('toggle-controls').onclick=()=>{controls.pause();endPainting();if(document.pointerLockElement)document.exitPointerLock();const hidden=document.body.classList.toggle('controls-hidden');if(hidden)canvas.focus();$('toggle-controls').textContent=hidden?'Room & settings':'Return to bathroom';};

$('copy-code').onclick=async()=>{if(!room)return;const code=room.code;try{await navigator.clipboard.writeText(code);toast('Bathroom code copied. Send it to a friend so they can join.');}catch{toast('Your bathroom code is '+code+'.');}};
$('unstuck').onclick=()=>{controls.pause();send({type:'unstuck'});};
$('save-listing').onclick=()=>send({type:'listing',public:$('room-public').checked,painting:$('public-painting').checked,name:$('public-name').value});
async function refreshRooms(){const status=$('directory-status'),list=$('public-rooms');$('refresh-rooms').disabled=true;status.textContent='Finding public bathrooms…';try{const response=await fetch('/rooms',{cache:'no-store'});if(!response.ok)throw Error('Directory unavailable');const result=await response.json();list.replaceChildren();status.textContent=result.rooms.length?'Live bathrooms on this server · up to four artists each':'No public bathrooms are open. Create a public one to welcome other artists.';for(const r of result.rooms){const row=document.createElement('article'),title=document.createElement('strong'),detail=document.createElement('p'),join=document.createElement('button');title.textContent=r.name;detail.textContent=r.online+' / '+r.capacity+' artists · '+(r.painting?'painting welcome':'host grants painting access');join.textContent=r.online>=4?'Full':'Join a bathroom';join.disabled=r.online>=4||!r.available;join.onclick=()=>{const name=$('name').value.trim();if(!name){$('name').focus();$('name').reportValidity();return;}const old=socket;socket=null;old?.close();session={name,token,create:false,code:r.code,publicJoin:true};$('join-form').querySelectorAll('button').forEach(b=>b.disabled=true);join.disabled=true;connect();};row.append(title,detail,join);list.append(row);}}catch{status.textContent='Could not load the directory. Refresh to try again; code joining is still available.';}finally{$('refresh-rooms').disabled=false;}}
$('refresh-rooms').onclick=refreshRooms;refreshRooms();
$('leave-room').onclick=()=>{labelEditor.close();controls.pause();cancelPainting();const old=socket;socket=null;old?.close();room=null;me=null;session=null;labels.clear();replay.reset();world.updatePlayers([],null);try{sessionStorage.removeItem('bathroom-session');}catch{}sound.visibility(true);$('lobby').hidden=false;$('studio').hidden=true;$('play-hud').hidden=true;$('toggle-controls').hidden=true;document.body.classList.remove('controls-hidden');document.body.classList.add('in-lobby');$('connection').textContent='Choose a bathroom';$('join-form').querySelectorAll('button').forEach(b=>b.disabled=false);refreshRooms();sceneDirty=true;wake();};
let controlMode='auto',touchMovement='buttons';try{controlMode=localStorage.getItem('bathroom-controls')||'auto';touchMovement=localStorage.getItem('bathroom-touch-movement')||'buttons';}catch{}
function setControls(){const touch=controlMode==='touch'||controlMode==='auto'&&matchMedia('(pointer:coarse)').matches;document.body.classList.toggle('touch-enabled',touch);document.body.classList.toggle('touch-disabled',!touch);document.body.classList.toggle('touch-buttons',touchMovement==='buttons');$('control-mode').value=controlMode;$('touch-movement').value=touchMovement;controls.pause();}
$('control-mode').onchange=()=>{controlMode=$('control-mode').value;try{localStorage.setItem('bathroom-controls',controlMode);}catch{}setControls();};$('touch-movement').onchange=()=>{touchMovement=$('touch-movement').value;try{localStorage.setItem('bathroom-touch-movement',touchMovement);}catch{}setControls();};setControls();
try{$('vhs-strength').value=localStorage.getItem('bathroom-vhs-strength')||'1';}catch{}tape.intensity($('vhs-strength').value);$('vhs-strength').oninput=()=>{tape.intensity($('vhs-strength').value);try{localStorage.setItem('bathroom-vhs-strength',$('vhs-strength').value);}catch{}};

$('hint').textContent='WASD / arrows to walk · Mouse to look · E use object · Hold click / Space to paint · Q put down · Esc release mouse';
let lastAudioPose=null;
let lastMove=0,lastHint='';
const movement=movementSync(controls,{send,discard:()=>socket?.discardMoves?.()});
$('quality').onchange=()=>{quality=$('quality').value;renderSamples=0;renderMs=0;try{localStorage.setItem('bathroom-quality',quality);}catch{}world.setQuality(quality);resize();};
function resize(){renderer.setPixelRatio(renderRatio(innerWidth,innerHeight,devicePixelRatio,quality));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();sceneDirty=true;wake();}
addEventListener('resize',resize);resize();
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();graphicsPaused=true;controls.pause();cancelPainting();pump?.pause();toast('Graphics paused. Waiting for the browser to restore them.');});
canvas.addEventListener('webglcontextrestored',()=>{graphicsPaused=false;for(const p of Object.values(papers)){p.texture.needsUpdate=true;p.dirty=true;}texture.needsUpdate=true;fogTexture.needsUpdate=true;dirty=true;fogDirty=true;sceneDirty=true;renderer.shadowMap.needsUpdate=true;wake();});
addEventListener('visibilitychange',()=>{sound.visibility(document.hidden);if(document.hidden){endPainting();pump?.pause();}else{sceneDirty=true;wake();}});
function frame(now,dt){
  if(document.hidden)return;
  replay.step();
  const elapsed=now-lastFrame;lastFrame=now;if(elapsed<200)frameMs=frameMs?frameMs*.9+elapsed*.1:elapsed;
  if(drawing&&draft?.points.length&&now-lastFlush>=32)flush(true);
  const moved=controls.update(dt);if(moved)sceneDirty=true;world.setActivity(moved,drawing,now);
  const audioPose=controls.pose();if(moved&&lastAudioPose&&Math.hypot(audioPose.x-lastAudioPose.x,audioPose.z-lastAudioPose.z)>.001)sound.step(now);lastAudioPose={...audioPose};if(drawing&&lastPoint)sound.paint(tool,now);else sound.stopPaint();if(room)sound.environment(room,controls.pose(),Date.now()+serverOffset);
  if(connected()&&now-lastMove>85){lastMove=now;movement.flush();}
  if(world.animate(dt,now/1000,room,Date.now()+serverOffset,quality))sceneDirty=true;
  if(connected()){
    const hit=world.interact(),paint=world.paintHit(),humidity=humidityAt(room.environment,Date.now()+serverOffset);
    const prop=carriedProp();$('held-status').textContent=prop?'Carrying '+(paperId(prop)?'spare roll':prop)+' · Q returns it':requestedTool?'Picking up '+names[requestedTool]+'…':tool==='stamp'?stampPattern+' stamp · '+stampTurn*90+'° · R / Turn rotates':names[tool];
    const hint=prop==='stool'||paperId(prop)?'Aim at a storage spot or clear floor · E / Use to place · Q returns it':prop&&hit?.action!=='slot'?'Aim at a glowing storage spot · E to place · Q return':paperId(paint?.surface)?'Hold Paint to decorate · E carry · R / Turn rotates the roll':hit?'E / Use · '+hit.label:paint?.surface==='mirror'?(humidity<FOG_THRESHOLD?'Mirror is dry · run the hot shower':'Hold click / Paint · trace the fog (temporary)'):paint?'Hold click / Paint · '+names[tool]:'';
    if(hint!==lastHint){$('object-hint').textContent=hint;lastHint=hint;}
  }
  const inputStarted=firstInputAt;
  const uploadPaint=drawing||!replay.active()||now-lastRestoreUpload>=100;if(uploadPaint)lastRestoreUpload=now;
  if(!replay.active())for(const[id,p]of labels)if(p.dirty){drawLabel(p.output.ctx,p.art.canvas,p.label.crop);world.setAvatarLabel(id,p.output.canvas);p.dirty=false;sceneDirty=true;}
  if(!replay.active())for(const p of prints)if(p.dirty){printPage(p.page.ctx,p.art.canvas,p.photo);p.texture.needsUpdate=true;p.dirty=false;sceneDirty=true;}
  for(const [id,p]of Object.entries(papers))if(uploadPaint&&p.dirty&&world.surfaceVisible(id)){paperBase(p.display.ctx);p.display.ctx.drawImage(p.committed.canvas,0,0);for(const stroke of predictions.values())if(stroke.surface===id)drawPaperStroke(p.display.ctx,stroke);if(draft?.surface===id)drawPaperStroke(p.display.ctx,draft);p.texture.needsUpdate=true;p.dirty=false;sceneDirty=true;}
  if(uploadPaint&&dirty&&world.surfaceVisible('towel')){compose();sceneDirty=true;}
  if(room){
    const serverNow=Date.now()+serverOffset,humidity=humidityAt(room.environment,serverNow);
    if(now-lastFogPrune>250){lastFogPrune=now;const remaining=liveFogMarks(room.fogMarks,serverNow,humidity);if(remaining.length!==room.fogMarks.length){room.fogMarks=remaining;fogDirty=true;}}
    if((fogDirty||room.fogMarks.length&&now-lastFogFrame>1000/QUALITY[quality].fogHz)&&world.surfaceVisible('mirror')){
      const marks=[...room.fogMarks,...predictions.values().filter(mark=>mark.tool==='fog'),...(draft?.tool==='fog'?[draft]:[])];
      drawFog(fogLayer.ctx,marks,serverNow);fogTexture.needsUpdate=true;fogDirty=false;lastFogFrame=now;sceneDirty=true;
    }
  }
  if(sceneDirty){const before=performance.now();renderer.render(world.scene,camera);const cost=performance.now()-before;if(++renderSamples>3)renderMs=renderMs?renderMs*.8+cost*.2:cost;drawnFrames++;sceneDirty=false;}
  if(inputStarted!==null){const delay=performance.now()-inputStarted;inputMs=inputMs===null?delay:inputMs*.8+delay*.2;firstInputAt=null;}
  if(now-lastStats>500){
    lastStats=now;const pending=predictions.pending.size+(draft?.points.length?1:0);
    if(connected())$('connection').textContent=replay.active()?`Connected · restoring ${replay.remaining()} saved marks…`:pending?`Connected · ${pending} mark${pending===1?'':'s'} sharing…`:room.fogMarks.length?'Connected · paint saved; mirror marks temporary':'Connected · all paint saved';
    $('towel-status').textContent=(room?.towels?.find(t=>t.id===room.activeTowel)?.name||'Studio towel')+' · Use the folded towels on the shelf to exchange and store artwork';
    $('wet-status').textContent=room?.laundry?.phase==='wet'?'Clean, wet towel · collect it from the washer door':wetness()>.05?`Damp towel · ${Math.ceil((wetness()-.05)*60)}s until dry`:'Dry towel · wet before cleaning';
    if(room)$('environment-status').textContent=`${room.environment.shower?'Hot shower running':'Shower off'} · ${Math.round(humidityAt(room.environment,Date.now()+serverOffset)*100)}% humidity · Fan ${room.environment.fan?'on':'off'} · Laundry ${room.laundry?.phase||'ready'}${room.laundry?.endsAt>Date.now()+serverOffset?' · '+Math.ceil((room.laundry.endsAt-Date.now()-serverOffset)/1000)+'s':''} · ${matchMedia('(prefers-reduced-motion: reduce)').matches?'Reduced motion: decorative animation suppressed':'Mirror marks fade in 45s'}`;
    const damp=wetness();
    if(world.towel.material.roughness!==1-damp*.35){world.towel.material.roughness=1-damp*.35;world.towel.material.color.setRGB(1-damp*.08,1-damp*.03,1);sceneDirty=true;}
    if(now-drawnSince>=1000){const checks=world.diagnostics().aimChecks;aimRate=Math.round((checks-previousAimChecks)*1000/(now-drawnSince));previousAimChecks=checks;drawnRate=Math.round(drawnFrames*1000/(now-drawnSince));drawnFrames=0;drawnSince=now;}
    $('performance').textContent=`3D resolution ${canvas.width} × ${canvas.height} · ${drawnRate} frames drawn/s (idle saves work) · Render submission ${renderMs?renderMs.toFixed(1)+' ms':'warming up'} · Preview ${inputMs===null?'—':Math.round(inputMs)+' ms'} · Server ${ackMs===null?'—':Math.round(ackMs)+' ms'} · ${renderer.info.render.calls} draw calls · ${renderer.info.render.triangles} triangles · ${aimRate} aim checks/s`;
    for(const [id,prediction]of predictions.pending)if(now-prediction.sentAt>5000){cancelPainting();send({type:'sync'});toast('Refreshing artwork after a slow connection.');break;}
  }
  if(replay.active()||controls.isActive()||controls.hasMotion()||world.hasMotion())return 0;
  return world.effectsActive()?1000/QUALITY[quality].effectHz:100;
}
pump=createFramePump(frame);wake();
