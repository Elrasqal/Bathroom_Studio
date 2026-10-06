import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {once} from 'node:events';
import {MusicQueue,createSoundscape,roomPan} from '../public/audio.js';

test('located audio follows the listener heading and remains centered at zero distance',()=>{
 assert.equal(roomPan([5,0,0],{x:0,z:0,yaw:0}),1);assert.equal(roomPan([-5,0,0],{x:0,z:0,yaw:0}),-1);
 assert.ok(roomPan([0,0,-5],{x:0,z:0,yaw:Math.PI/2})>.99);assert.ok(roomPan([0,0,5],{x:0,z:0,yaw:-Math.PI/2})>.99);assert.equal(roomPan([0,0,0],{x:0,z:0}),0);
});
import {startServer} from '../server.js';
test('moonlight pauses outdoor birds and re-enabling sound cannot restart them',async()=>{
 const audios=[];class Audio{constructor(){this.src='';this.paused=true;this.volume=0;audios.push(this);}async play(){this.paused=false;}pause(){this.paused=true;}}
 const sound=createSoundscape({manifest:{music:[{src:'/music.mp3',title:'Test'}],ambient:{src:'/outside.mp3'}},AudioClass:Audio,ContextClass:null});
 const room=lighting=>({lighting,environment:{fan:false,shower:false},furnishings:{washer:false}});
 sound.environment(room('night'),{x:0,z:0});await sound.unlock();const outside=audios[1];assert.equal(outside.paused,true);assert.equal(outside.volume,0);
 await sound.enable(false);await sound.enable(true);assert.equal(outside.paused,true);sound.visibility(true);sound.visibility(false);assert.equal(outside.paused,true);
 sound.environment(room('day'));assert.equal(outside.paused,false);assert.ok(outside.volume>0);sound.environment(room('night'));assert.equal(outside.paused,true);sound.dispose();
});

test('soundtrack contains over an hour of unique local CC tracks and never wraps automatically',()=>{
  const catalog=JSON.parse(readFileSync(new URL('../public/audio-manifest.json',import.meta.url)));
  assert.ok(catalog.music.reduce((sum,t)=>sum+t.duration,0)>=3600);assert.equal(new Set(catalog.music.map(t=>t.src)).size,catalog.music.length);
  for(const track of catalog.music){assert.equal(track.license,'CC BY 4.0');assert.ok(statSync(new URL('../public'+track.src,import.meta.url)).size>100000);}
  const queue=new MusicQueue(catalog.music.length);for(let i=1;i<catalog.music.length;i++)assert.equal(queue.advance(),i);
  assert.equal(queue.advance(),null);assert.equal(queue.advance(),null);assert.equal(queue.complete,true);assert.equal(queue.index,catalog.music.length-1);queue.restart();assert.equal(queue.index,0);
});

test('audio streams bounded byte ranges, HEAD and invalid range responses',async t=>{
  const app=startServer({port:0,database:':memory:'});await once(app.server,'listening');t.after(()=>app.close());const url='http://127.0.0.1:'+app.server.address().port+'/audio/music/cylinders-01.mp3';
  const full=await fetch(url,{method:'HEAD'});assert.equal(full.status,200);const length=Number(full.headers.get('content-length'));assert.ok(length>100000);
  const range=await fetch(url,{headers:{Range:'bytes=32-95'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,64);assert.equal(range.headers.get('content-range'),`bytes 32-95/${length}`);
  const suffix=await fetch(url,{headers:{Range:'bytes=-32'}});assert.equal((await suffix.arrayBuffer()).byteLength,32);
  const invalid=await fetch(url,{headers:{Range:`bytes=${length}-`}});assert.equal(invalid.status,416);
});

test('new interaction recordings all retain primary CC0 credits and local audio',()=>{
 const catalog=JSON.parse(readFileSync(new URL('../public/audio-manifest.json',import.meta.url)));
 assert.equal(catalog.effects.length,10);for(const effect of catalog.effects){assert.equal(effect.license,'CC0 1.0');assert.match(effect.source,/^https:\/\/freesound.org\/people\//);assert.ok(statSync(new URL('../public'+effect.src,import.meta.url)).size>4000);}
});

test('painting holds one continuous voice and stale decoding cannot restart stopped audio',async t=>{
 const previousFetch=globalThis.fetch;let decodeResolve=null,delayed=false;globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});t.after(()=>globalThis.fetch=previousFetch);
 const sources=[],param=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}});
 const node=()=>({gain:param(),frequency:param(),playbackRate:param(),connect(){},disconnect(){},start(...args){this.starts=args;},stop(){this.stopped=true;}});
 class Context{constructor(){this.currentTime=1;this.sampleRate=16;this.state='running';}createGain(){return node();}createBuffer(){return{getChannelData:()=>new Float32Array(32)};}createBufferSource(){const n=node();sources.push(n);return n;}createBiquadFilter(){return node();}createOscillator(){return node();}decodeAudioData(){return delayed?new Promise(r=>decodeResolve=r):Promise.resolve({duration:8});}async resume(){this.state='running';}async suspend(){this.state='suspended';}close(){}}
 class Audio{constructor(){this.src='';this.paused=true;}async play(){this.paused=false;}pause(){this.paused=true;}}
 const sound=createSoundscape({manifest:{music:[{src:'/test.mp3',title:'Test'}],ambient:{src:'/outside.mp3'}},AudioClass:Audio,ContextClass:Context});t.after(()=>sound.dispose());await sound.unlock();
 await sound.paint('brush');const voice=sources.at(-1);assert.equal(voice.loop,true);for(let i=0;i<100;i++)await sound.paint('brush');assert.equal(sources.at(-1),voice);sound.stopPaint();assert.equal(voice.stopped,true);
 delayed=true;const pending=sound.paint('spray');await new Promise(r=>setImmediate(r));sound.stopPaint();const count=sources.length;decodeResolve({duration:1});await pending;assert.equal(sources.length,count,'a released tool must not start after a slow decode');
 delayed=false;await sound.paint('brush');const second=sources.at(-1);await sound.enable(false);assert.equal(second.stopped,true);assert.equal(sources.filter(s=>s.loop&&s.buffer?.duration===8).length,2);
 await sound.enable(true);delayed=true;sound.environment({environment:{fan:true}}, {x:0,z:0});await new Promise(r=>setImmediate(r));const fanCount=sources.length;sound.visibility(true);decodeResolve({duration:30});await new Promise(r=>setImmediate(r));assert.equal(sources.length,fanCount,'a backgrounded fan must not start after decoding');
 delayed=false;sound.visibility(false);await new Promise(r=>setImmediate(r));const fan=sources.at(-1);assert.equal(fan.loop,true);assert.equal(fan.buffer.duration,30);sound.environment({environment:{fan:false}}, {x:0,z:0});assert.equal(fan.stopped,true);
 sound.environment({environment:{fan:true}}, {x:0,z:0});await new Promise(r=>setImmediate(r));const finalFan=sources.at(-1);sound.dispose();assert.equal(finalFan.stopped,true);
});
