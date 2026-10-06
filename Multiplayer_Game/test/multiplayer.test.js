import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import WebSocket from 'ws';
import { startServer } from '../server.js';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { Predictions, seedFor, drawStroke } from '../public/paint.js';
import { humidityAt, changeShower } from '../public/environment.js';
import { walk, canStand } from '../public/walk.js';
import {defaultFurnishings,feetHeight,pathClear} from '../public/furnishings.js';

test('spare rolls can be painted, carried and placed with durable isolated artwork',async t=>{
 const directory=mkdtempSync(join(tmpdir(),'bathroom-paper-')),database=join(directory,'studio.sqlite');let now=100000;
 let {app,port}=await boot(database,{clock:()=>now});t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
 const a=await client(port);a.send({type:'join',create:true,name:'Owner',token:'d'.repeat(64)});const owner=(await a.next('joined')).id,code=(await a.next('state')).room.code;
 const b=await client(port);b.send({type:'join',code,name:'Guest',token:'e'.repeat(64)});await b.next('joined');await b.next('state');
 const stroke=id=>paint(id,{surface:'paper-a'}),move=async(x,z)=>{now+=500;a.send({type:'move',pose:{x,z,yaw:0}});await b.next('pose',m=>m.player===owner&&m.pose.x===x&&m.pose.z===z);};
 b.send(stroke('unallowed'));assert.match((await b.next('error')).message,/owner/);
 a.send(stroke('closed'));assert.match((await a.next('error')).message,/cabinet/);
 await move(-.7,-.1);a.send({type:'furnishing',fixture:'cabinet',index:0,open:true});await a.next('meta',m=>m.room.furnishings.doors[0]);await move(-2.8,-1);await move(-3.3,-1);
 a.send(stroke('paper-first'));assert.equal((await a.next('accepted')).sequence,1);
 a.send({type:'prop',prop:'paper-a',action:'take'});await b.next('meta',m=>m.room.heldProps['paper-a']===owner);
 a.send(stroke('held'));assert.match((await a.next('error')).message,/Put down/);
 a.send({type:'prop',prop:'paper-a',action:'place',slot:'paper-left-b'});assert.match((await a.next('error')).message,/occupied/);
 a.send({type:'prop',prop:'paper-a',action:'place',slot:'display-a'});await b.next('meta',m=>m.room.furnishings.items['paper-a']==='display-a'&&!m.room.heldProps['paper-a']);
 a.send({type:'furnishing',fixture:'paper-turn',prop:'paper-a'});await b.next('meta',m=>m.room.furnishings.paperTurns?.['paper-a']===1);
 a.send(stroke('paper-second'));assert.equal((await a.next('accepted')).sequence,2);
 a.send({type:'prop',prop:'paper-a',action:'take'});await b.next('meta',m=>m.room.heldProps['paper-a']===owner);
 a.send({type:'prop',prop:'paper-a',action:'place',x:-3.3,z:-1});assert.match((await a.next('error')).message,/Move away/);
 a.send({type:'prop',prop:'paper-a',action:'place',x:-2.6,z:.35});await b.next('meta',m=>typeof m.room.furnishings.items['paper-a']==='object'&&!m.room.heldProps['paper-a']);
 for(const [x,z]of [[-1.3,-1],[.7,0],[2.2,1.8],[2.2,3.4]])await move(x,z);
 a.send({type:'towel',towel:'hand',generation:0});const swapped=(await a.next('state',m=>m.room.activeTowel==='hand')).room;assert.equal(swapped.strokes.length,2);assert.ok(swapped.strokes.every(s=>s.surface==='paper-a'));
 await app.close();({app,port}=await boot(database,{clock:()=>now}));const recovered=await client(port);recovered.send({type:'join',code,name:'Owner',token:'d'.repeat(64)});await recovered.next('joined');const room=(await recovered.next('state')).room;
 assert.deepEqual(room.furnishings.items['paper-a'],{x:-2.6,y:.18,z:.35});assert.equal(room.strokes.length,2);assert.equal(room.heldProps['paper-a'],null);assert.equal(room.activeTowel,'hand');assert.equal(room.furnishings.paperTurns['paper-a'],1);
});

test('washing and drying are owner-only, timed, shared and durable without restoring erased paint',async t=>{
 const directory=mkdtempSync(join(tmpdir(),'bathroom-laundry-')),database=join(directory,'studio.sqlite');let now=100000;
 let {app,port}=await boot(database,{clock:()=>now});t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
 const a=await client(port);a.send({type:'join',create:true,name:'Owner',token:'a'.repeat(64)});const owner=(await a.next('joined')).id,code=(await a.next('state')).room.code;
 const b=await client(port);b.send({type:'join',code,name:'Guest',token:'b'.repeat(64)});await b.next('joined');await b.next('state');
 a.send(paint('before-wash'));await a.next('accepted');
 a.send({type:'furnishing',fixture:'washer'});assert.match((await a.next('error')).message,/closer/);
 b.send({type:'furnishing',fixture:'washer'});assert.match((await b.next('error')).message,/owner/);
 const move=async(x,z)=>{now+=500;a.send({type:'move',pose:{x,z,yaw:0}});await b.next('pose',m=>m.player===owner&&m.pose.x===x&&m.pose.z===z);};
 for(const [x,z]of [[1.5,1],[1.5,3],[.3,4.5],[.3,6.5],[-1.5,6.5],[-2.8,7.5]])await move(x,z);
 a.send({type:'furnishing',fixture:'dryer'});assert.match((await a.next('error')).message,/Wash/);
 a.send({type:'furnishing',fixture:'washer-start'});assert.match((await a.next('error')).message,/Load/);a.send({type:'furnishing',fixture:'washer-load'});await a.next('state',m=>m.room.laundry.phase==='loaded');const start=now;a.send({type:'furnishing',fixture:'washer-start'});const washing=(await a.next('state',m=>m.room.laundry.phase==='washing')).room;assert.equal(washing.laundry.endsAt-start,20000);assert.equal(washing.strokes.length,1);
 a.send(paint('during-wash',{generation:washing.generation}));assert.match((await a.next('error')).message,/cycle/);
 a.send({type:'towel',towel:'hand',generation:washing.generation});assert.match((await a.next('error')).message,/cycle/);
 now=start+19999;a.send({type:'sync'});assert.equal((await a.next('state',m=>m.room.laundry.phase==='washing')).room.strokes.length,1);
 await app.close();now=start+20000;({app,port}=await boot(database,{clock:()=>now}));
 const recovered=await client(port);recovered.send({type:'join',code,name:'Owner',token:'a'.repeat(64)});await recovered.next('joined');const wet=(await recovered.next('state')).room;assert.equal(wet.laundry.phase,'wet');assert.equal(wet.strokes.length,0);assert.equal(wet.sequence,1);
 const c=await client(port);c.send({type:'join',code,name:'Guest',token:'b'.repeat(64)});await c.next('joined');await c.next('state');
 const moveAgain=async(x,z)=>{now+=500;recovered.send({type:'move',pose:{x,z,yaw:0}});await c.next('pose',m=>m.player===owner&&m.pose.x===x&&m.pose.z===z);};
 for(const [x,z]of [[1.5,1],[1.5,3],[.3,4.5],[.3,6.5],[-1.5,6.5],[-2.8,7.5]])await moveAgain(x,z);
 recovered.send({type:'furnishing',fixture:'dryer-load'});assert.match((await recovered.next('error')).message,/Collect/);recovered.send({type:'furnishing',fixture:'washer-load'});await recovered.next('state',m=>m.room.laundry.phase==='carrying');recovered.send({type:'furnishing',fixture:'dryer-load'});await recovered.next('state',m=>m.room.laundry.phase==='dryer-loaded');const dryStart=now;recovered.send({type:'furnishing',fixture:'dryer-start'});await recovered.next('state',m=>m.room.laundry.phase==='drying');
 now=dryStart+19999;recovered.send({type:'sync'});await recovered.next('state',m=>m.room.laundry.phase==='drying');now++;recovered.send({type:'sync'});const clean=(await recovered.next('state',m=>m.room.laundry.phase==='ready')).room;
 recovered.send(paint('after-wash',{generation:wet.generation}));assert.match((await recovered.next('error')).message,/changed/);
 recovered.send(paint('fresh',{generation:clean.generation}));assert.equal((await recovered.next('accepted')).sequence,2);
 await app.close();({app,port}=await boot(database,{clock:()=>now}));const final=await client(port);final.send({type:'join',code,name:'Owner',token:'a'.repeat(64)});await final.next('joined');assert.deepEqual((await final.next('state')).room.strokes.map(s=>s.id),['fresh']);
});

test('dividing wall requires the doorway and stool support raises the viewpoint',()=>{
  const f=defaultFurnishings();assert.equal(canStand(-2,5.65,f),false);assert.equal(canStand(.3,5.65,f),true);
  assert.equal(pathClear({x:-2,z:5},{x:-2,z:6.3},(x,z)=>canStand(x,z,f)),false);
  assert.equal(feetHeight({x:.3,z:-1.65,support:'stool'},f),.92);
  assert.equal(canStand(.3,-1.65,f),false);assert.equal(canStand(.3,-1.65,f,'stool'),true);
});

test('cabinet storage, rail height and stool placement are shared, validated and durable',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'bathroom-furniture-')),database=join(directory,'studio.sqlite');
  let now=100000,{app,port}=await boot(database,{clock:()=>now});t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
  const a=await client(port);a.send({type:'join',create:true,name:'Owner',token:'1'.repeat(64)});const owner=(await a.next('joined')).id,initial=(await a.next('state')).room,code=initial.code;
  const b=await client(port);b.send({type:'join',code,name:'Guest',token:'2'.repeat(64)});const guest=(await b.next('joined')).id;await b.next('state');
  b.send({type:'prop',prop:'stool',action:'take'});assert.match((await b.next('error')).message,/owner/);
  a.send({type:'move',pose:{x:.3,z:-1.65,yaw:0,support:'stool'}});assert.match((await a.next('error')).message,/climb/);
  a.send({type:'climb'});assert.equal((await b.next('pose',m=>m.player===owner)).pose.support,'stool');
  a.send({type:'prop',prop:'stool',action:'take'});assert.match((await a.next('error')).message,/standing/);
  now+=500;a.send({type:'move',pose:{x:1.3,z:-1.65,yaw:0}});await b.next('pose',m=>m.player===owner&&!m.pose.support);
  a.send({type:'prop',prop:'stool',action:'take'});await b.next('meta',m=>m.room.heldProps.stool===owner);
  a.send({type:'prop',prop:'stool',action:'place',x:-3,z:-2});assert.match((await a.next('error')).message,/floor|closer|fixture/);
  a.send({type:'prop',prop:'stool',action:'place',x:.3,z:.9});await b.next('meta',m=>m.room.furnishings.stool.z===.9&&!m.room.heldProps.stool);
  const move=async(x,z)=>{now+=500;a.send({type:'move',pose:{x,z,yaw:0}});await b.next('pose',m=>m.player===owner&&m.pose.x===x&&m.pose.z===z);};
  await move(1.3,-.1);await move(-.7,-.1);
  a.send({type:'prop',prop:'jar',action:'take'});assert.match((await a.next('error')).message,/closer|cabinet/);
  a.send({type:'furnishing',fixture:'cabinet',index:0,open:true});await b.next('meta',m=>m.room.furnishings.doors[0]);
  await move(-2.8,-1);
  a.send({type:'prop',prop:'jar',action:'take'});await b.next('meta',m=>m.room.heldProps.jar===owner);
  a.send({type:'prop',prop:'jar',action:'place',slot:'right-b'});assert.match((await a.next('error')).message,/cabinet|occupied/);
  a.send({type:'prop',prop:'jar',action:'place',slot:'counter-a'});await b.next('meta',m=>m.room.furnishings.items.jar==='counter-a');
  await move(-.7,-.1);await move(1,-1);
  a.send({type:'furnishing',fixture:'rack',height:8});assert.match((await a.next('error')).message,/height/);
  a.send({type:'furnishing',fixture:'rack',height:4.35});await b.next('meta',m=>m.room.furnishings.rackHeight===4.35);
  a.send({type:'grant',player:guest,allow:true});await b.next('meta',m=>m.room.grants.includes(guest));
  b.send({type:'prop',prop:'stool',action:'take'});await a.next('meta',m=>m.room.heldProps.stool===guest);
  a.send({type:'grant',player:guest,allow:false});await b.next('meta',m=>!m.room.heldProps.stool);
  await app.close();({app,port}=await boot(database,{clock:()=>now}));
  const recovered=await client(port);recovered.send({type:'join',code,name:'Owner',token:'1'.repeat(64)});await recovered.next('joined');const restored=(await recovered.next('state')).room;
  assert.equal(restored.furnishings.rackHeight,4.35);assert.equal(restored.furnishings.items.jar,'counter-a');assert.equal(restored.furnishings.doors[0],true);assert.deepEqual(restored.furnishings.stool,{x:.3,z:.9});assert.deepEqual(restored.heldProps,{stool:null,jar:null,cloth:null,'paper-a':null,'paper-b':null,'paper-c':null});
});

test('walking slides along furniture and cannot tunnel through fixtures or room walls',()=>{
  const position={x:0,z:0};walk(position,-10,-10);assert.ok(canStand(position.x,position.z));
  const sinkApproach={x:-2.7,z:0};walk(sinkApproach,0,-10);assert.ok(sinkApproach.z>=-1.9);assert.ok(canStand(sinkApproach.x,sinkApproach.z));
  const open={x:0,z:0};walk(open,1,3);assert.ok(Math.abs(open.x-1)<1e-9&&Math.abs(open.z-3)<1e-9);
});

test('mirror doodles require condensation, access and range; late joins share them and drying clears them',async t=>{
  let now=100000;const {app,port}=await boot(':memory:',{clock:()=>now});t.after(()=>app.close());
  const a=await client(port),b=await client(port);
  a.send({type:'join',create:true,name:'Owner',token:'6'.repeat(64)});const owner=(await a.next('joined')).id,code=(await a.next('state')).room.code;
  b.send({type:'join',code,name:'Guest',token:'7'.repeat(64)});const guest=(await b.next('joined')).id;await b.next('state');
  const mark=id=>({type:'fog',id,at:now,epoch:0,points:[[.5,.5],[.6,.6]]});
  a.send(mark('dry'));assert.match((await a.next('error')).message,/hot shower/);
  b.send({type:'fixture',fixture:'fan',on:true});assert.match((await b.next('error')).message,/host/);
  a.send({type:'fixture',fixture:'shower',on:true});await b.next('meta',m=>m.room.environment.shower);now+=10000;
  b.send(mark('forged'));assert.match((await b.next('error')).message,/owner/);
  a.send(mark('far'));assert.match((await a.next('error')).message,/closer/);
  for(const pose of [{x:-1,z:-.8,yaw:0},{x:-2.7,z:-1.15,yaw:0}]){now+=500;a.send({type:'move',pose});await b.next('pose',m=>m.player===owner);}
  a.send({...mark('bad'),points:[[NaN,.5]]});assert.match((await a.next('error')).message,/coordinates/);
  a.send(mark('doodle'));const accepted=await b.next('fog');assert.equal(accepted.mark.player,owner);
  a.send(mark('doodle'));await a.next('fog',m=>m.mark.id==='doodle');
  b.send({type:'sync'});const snapshot=(await b.next('state')).room;assert.equal(snapshot.fogMarks.length,1);assert.equal(snapshot.strokes.length,0);
  const late=await client(port);late.send({type:'join',code,name:'Late',token:'5'.repeat(64)});await late.next('joined');assert.deepEqual((await late.next('state')).room.fogMarks,snapshot.fogMarks);
  a.send({type:'grant',player:guest,allow:true});await b.next('meta',m=>m.room.grants.includes(guest));
  b.send(mark('far-guest'));assert.match((await b.next('error')).message,/closer/);
  for(const pose of [{x:-1,z:-.8,yaw:0},{x:-2.7,z:-1.15,yaw:0}]){now+=500;b.send({type:'move',pose});await a.next('pose',m=>m.player===guest);}
  b.send(mark('guest-doodle'));await a.next('fog',m=>m.mark.id==='guest-doodle');
  a.send({type:'grant',player:guest,allow:false});await b.next('meta',m=>!m.room.grants.includes(guest));
  b.send(mark('revoked-doodle'));assert.match((await b.next('error')).message,/owner/);
  a.send({type:'fixture',fixture:'fan',on:true});await b.next('meta',m=>m.room.environment.fan);now+=35000;
  b.send({type:'sync'});const dried=(await b.next('state')).room;assert.deepEqual(dried.fogMarks,[]);assert.equal(dried.fogEpoch,1);
  a.send({type:'fixture',fixture:'fan',on:false});await b.next('meta',m=>!m.room.environment.fan&&m.room.environment.at===now);now+=10000;
  a.send(mark('stale'));assert.match((await a.next('error')).message,/fresh doodle/);
  a.send({...mark('fresh'),epoch:1});await b.next('fog',m=>m.mark.id==='fresh');
  now+=46000;b.send({type:'sync'});assert.deepEqual((await b.next('state')).room.fogMarks,[]);
});

test('steam warms up and cools continuously using timestamps, including background time',()=>{
  const dry={shower:false,humidity:0,at:1000};const hot=changeShower(dry,true,1000);
  const humid=humidityAt(hot,23000);assert.ok(humid>.6&&humid<.7);
  const off=changeShower(hot,false,23000);assert.equal(humidityAt(off,23000),humid);
  assert.ok(humidityAt(off,88000)<humid*.38);assert.equal(humidityAt(hot,0),0);
});

test('movement and environmental changes synchronize with permissions and survive server restart',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'bathroom-world-')),database=join(directory,'studio.sqlite');
  let now=100000,{app,port}=await boot(database,{clock:()=>now});t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
  const a=await client(port);a.send({type:'join',create:true,name:'Owner',token:'9'.repeat(64)});
  const owner=(await a.next('joined')).id,code=(await a.next('state')).room.code;
  const b=await client(port);b.send({type:'join',code,name:'Guest',token:'8'.repeat(64)});await b.next('joined');await b.next('state');
  a.send({type:'move',pose:{x:7,z:10,yaw:0}});assert.equal((await a.next('pose',m=>m.correction)).correction,true);
  a.send({type:'move',pose:{x:-4,z:-2,yaw:0}});assert.equal((await a.next('pose',m=>m.correction)).correction,true);
  now+=100;a.send({type:'move',pose:{x:.5,z:.2,yaw:.4}});
  assert.deepEqual((await b.next('pose')).pose,{x:.5,z:.2,yaw:.4});
  b.send({type:'fixture',fixture:'shower',on:true});assert.match((await b.next('error')).message,/host/);
  a.send({type:'fixture',fixture:'shower',on:true});const hot=(await b.next('meta',m=>m.room.environment.shower)).room.environment;
  now+=22000;a.send({type:'fixture',fixture:'shower',on:false});const off=(await b.next('meta',m=>!m.room.environment.shower&&m.room.environment.humidity>0)).room.environment;
  assert.equal(off.humidity,humidityAt(hot,now));
  a.send({type:'fixture',fixture:'lighting',mode:'invalid'});assert.match((await a.next('error')).message,/Invalid lighting/);
  a.send({type:'fixture',fixture:'lighting',mode:'evening'});await b.next('meta',m=>m.room.lighting==='evening');
  a.send({type:'fixture',fixture:'fan',on:true});await b.next('meta',m=>m.room.environment.fan);
  await app.close();({app,port}=await boot(database,{clock:()=>now}));
  const recovered=await client(port);recovered.send({type:'join',code,name:'Owner',token:'9'.repeat(64)});assert.equal((await recovered.next('joined')).id,owner);
  const restored=(await recovered.next('state')).room;assert.deepEqual(restored.environment,{...off,fan:true});assert.equal(restored.lighting,'evening');assert.deepEqual(restored.fogMarks,[]);
});

async function client(port) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/socket`,{origin:`http://127.0.0.1:${port}`});
  const messages = [], waiters = [];
  ws.on('message', data => {
    const m = JSON.parse(data); messages.push(m);
    for (const wake of [...waiters]) wake();
  });
  await once(ws,'open');
  const next = (type, predicate = () => true) => new Promise((resolve,reject) => {
    const timer = setTimeout(() => { waiters.splice(waiters.indexOf(check),1); reject(new Error(`Timed out waiting for ${type}`)); },3000);
    function check(){const index = messages.findIndex(m=>m.type===type&&predicate(m));if(index<0)return;clearTimeout(timer);const i=waiters.indexOf(check);if(i>=0)waiters.splice(i,1);resolve(messages.splice(index,1)[0]);}
    waiters.push(check);check();
  });
  return {ws,next,send:m=>ws.send(JSON.stringify(m))};
}
async function boot(database,options={}){const app=startServer({port:0,database,...options});await once(app.server,'listening');return {app,port:app.server.address().port};}
const paint = (id, overrides={}) => ({type:'stroke',id,generation:0,color:'#ee7766',size:.02,points:[[.2,.3],[.4,.5]],...overrides});

test('painting maps normalized coordinates to the actual square or rectangular canvas',()=>{
  for(const height of [512,640]){
    let dot;const ctx={canvas:{width:512,height},save(){},restore(){},beginPath(){},moveTo(){},stroke(){},fill(){},arc(...args){dot=args;}};
    drawStroke(ctx,{tool:'squeeze',color:'#ee7766',size:.02,points:[[.5,.95]]});
    assert.equal(dot[0],256);assert.equal(dot[1],height*.95);assert.equal(dot[2],5.12);
  }
});

test('towel exchanges isolate durable artwork, synchronize viewers and reject stale or unauthorized edits',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'bathroom-towels-')),database=join(directory,'studio.sqlite');
  let now=100000,{app,port}=await boot(database,{clock:()=>now});t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
  let a=await client(port);a.send({type:'join',create:true,name:'Owner',token:'1'.repeat(64)});await a.next('joined');const initial=(await a.next('state')).room,code=initial.code;
  const b=await client(port);b.send({type:'join',code,name:'Guest',token:'2'.repeat(64)});await b.next('joined');await b.next('state');
  a.send(paint('original-art'));const original=(await a.next('stroke')).stroke;
  const swap=(towel,generation)=>({type:'towel',towel,generation});
  b.send(swap('square',0));assert.match((await b.next('error')).message,/owner/);
  a.send(swap('square',0));assert.match((await a.next('error')).message,/closer/);
  for(const pose of [{x:1.5,z:1,yaw:0},{x:1.5,z:2.5,yaw:0},{x:3.5,z:3.5,yaw:0},{x:4,z:3.5,yaw:0}]){now+=500;a.send({type:'move',pose});await b.next('pose');}
  a.send(swap('square',0));let next=(await b.next('state')).room;assert.equal(next.generation,1);assert.equal(next.activeTowel,'square');assert.deepEqual(next.strokes,[]);
  a.send(paint('old-command'));assert.match((await a.next('error')).message,/Artwork changed/);
  a.send(paint('square-art',{generation:1}));const square=(await b.next('stroke',m=>m.stroke.id==='square-art')).stroke;assert.equal(square.towelId,'square');
  a.send(swap('original',1));next=(await b.next('state')).room;assert.deepEqual(next.strokes,[original]);assert.equal(next.sequence,2);
  a.send(swap('bath',1));assert.match((await a.next('error')).message,/changed/);
  await app.close();({app,port}=await boot(database,{clock:()=>now}));a=await client(port);a.send({type:'join',code,name:'Owner',token:'1'.repeat(64)});await a.next('joined');next=(await a.next('state')).room;assert.equal(next.generation,2);assert.deepEqual(next.strokes,[original]);
  for(const pose of [{x:1.5,z:1,yaw:0},{x:1.5,z:2.5,yaw:0},{x:3.5,z:3.5,yaw:0},{x:4,z:3.5,yaw:0}]){now+=500;a.send({type:'move',pose});await a.next('pose');}
  a.send(swap('square',2));next=(await a.next('state')).room;assert.deepEqual(next.strokes,[square]);assert.equal(next.generation,3);
});

test('independent clients converge, permissions are authoritative, and durable state survives restart',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'bathroom-'));const database=join(directory,'studio.sqlite');
  let {app,port}=await boot(database);t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
  const a=await client(port),b=await client(port);
  a.send({type:'join',create:true,name:'Owner',token:'a'.repeat(64)});
  const owner=(await a.next('joined')).id;const initial=(await a.next('state')).room;const code=initial.code;
  assert.equal(initial.owner,owner);assert.equal(JSON.stringify(initial).includes('hash'),false);
  b.send({type:'join',code,name:'Visitor',token:'b'.repeat(64)});const guest=(await b.next('joined')).id;await b.next('state');await b.next('meta');
  b.send(paint('forged',{player:owner}));assert.match((await b.next('error')).message,/owner/);
  b.send({type:'grant',player:guest,allow:true});assert.match((await b.next('error')).message,/owner/);
  a.send({type:'grant',player:guest,allow:true});await b.next('meta',m=>m.room.grants.includes(guest));
  a.send(paint('owner-stroke'));b.send(paint('guest-stroke'));
  const seenA=[await a.next('stroke'),await a.next('stroke')];const seenB=[await b.next('stroke'),await b.next('stroke')];
  assert.deepEqual(seenA,seenB);assert.deepEqual(seenA.map(m=>m.stroke.sequence),[1,2]);
  await b.next('accepted');b.send(paint('guest-stroke'));await b.next('accepted');
  b.send(paint('bad',{points:[[2,.5]]}));assert.match((await b.next('error')).message,/coordinates/);
  b.send(paint('stale',{generation:99}));assert.match((await b.next('error')).message,/Artwork changed/);
  a.send({type:'grant',player:guest,allow:false});await b.next('meta',m=>!m.room.grants.includes(guest));
  b.send(paint('revoked'));assert.match((await b.next('error')).message,/owner/);
  const late=await client(port);late.send({type:'join',code,name:'Late artist',token:'c'.repeat(64)});await late.next('joined');const replay=(await late.next('state')).room;
  assert.equal(replay.strokes.length,2);assert.deepEqual(replay.strokes,seenA.map(m=>m.stroke));
  await app.close();({app,port}=await boot(database));
  const recovered=await client(port);recovered.send({type:'join',code,name:'Owner again',token:'a'.repeat(64)});
  assert.equal((await recovered.next('joined')).id,owner);const durable=(await recovered.next('state')).room;
  assert.equal(durable.owner,owner);assert.deepEqual(durable.strokes,replay.strokes);assert.deepEqual(durable.grants,[]);
  recovered.send(paint('owner-stroke'));await recovered.next('accepted');
  const fourth=await client(port);fourth.send({type:'join',code,name:'Fourth',token:'d'.repeat(64)});await fourth.next('joined');
  const fifth=await client(port);fifth.send({type:'join',code,name:'Overflow',token:'e'.repeat(64)});assert.match((await fifth.next('error')).message,/full/);
  const wrong=await client(port);wrong.send({type:'join',code:'FFFFFF',name:'Lost',token:'f'.repeat(64)});assert.match((await wrong.next('error')).message,/unavailable/);
  recovered.ws.send('{');assert.equal((await recovered.next('error')).message,'Invalid message');
});

test('shared tools resolve simultaneous grabs, validate cleaning, release on disconnect and persist fixtures',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'bathroom-tools-')),database=join(directory,'studio.sqlite');
  let {app,port}=await boot(database);t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
  const a=await client(port),b=await client(port);
  a.send({type:'join',create:true,name:'Owner',token:'1'.repeat(64)});
  const owner=(await a.next('joined')).id,code=(await a.next('state')).room.code;await a.next('meta');
  b.send({type:'join',code,name:'Guest',token:'2'.repeat(64)});const guest=(await b.next('joined')).id;await b.next('state');await b.next('meta');
  b.send({type:'tool',tool:'brush',pickup:true});assert.match((await b.next('error')).message,/owner/);
  a.send({type:'grant',player:guest,allow:true});await b.next('meta',m=>m.room.grants.includes(guest));
  a.send({type:'tool',tool:'brush',pickup:true});b.send({type:'tool',tool:'brush',pickup:true});
  const possession=await a.next('meta',m=>Boolean(m.room.tools.brush));
  const winner=possession.room.tools.brush,winnerClient=winner===owner?a:b,loser=winner===owner?b:a;
  assert.match((await loser.next('error')).message,/already in use/);
  loser.send(paint('unheld',{tool:'brush'}));assert.match((await loser.next('error')).message,/Pick up/);
  winnerClient.send(paint('brushed',{tool:'brush'}));const accepted=(await winnerClient.next('stroke')).stroke;
  assert.equal(accepted.tool,'brush');assert.equal(accepted.seed,seedFor('brushed'));
  winnerClient.ws.close();await loser.next('meta',m=>m.room.tools.brush===null&&m.room.players.find(p=>p.id===winner)?.online===false);
  const active=winner===owner?b:a;
  active.send({type:'tool',tool:'sponge',pickup:true});await active.next('meta',m=>m.room.tools.sponge=== (winner===owner?guest:owner));
  active.send(paint('dry-scrub',{tool:'sponge'}));assert.match((await active.next('error')).message,/Wet the towel/);
  active.send({type:'fixture',fixture:'wet'});const damp=await active.next('meta',m=>m.room.wetAt>0);
  assert.equal('strokes' in damp.room,false,'metadata updates must not resend history');
  active.send(paint('wet-scrub',{tool:'sponge'}));const cleaned=await active.next('stroke',m=>m.stroke.id==='wet-scrub');assert.equal(cleaned.stroke.tool,'sponge');
  if(winner===owner){
    a.ws.close();const replacement=await client(port);replacement.send({type:'join',code,name:'Owner',token:'1'.repeat(64)});await replacement.next('joined');await replacement.next('state');
    replacement.send({type:'fixture',fixture:'lights',on:false});await replacement.next('meta',m=>m.room.lights===false);
  }else{a.send({type:'fixture',fixture:'lights',on:false});await a.next('meta',m=>m.room.lights===false);}
  await app.close();({app,port}=await boot(database));
  const recovered=await client(port);recovered.send({type:'join',code,name:'Owner',token:'1'.repeat(64)});await recovered.next('joined');const room=(await recovered.next('state')).room;
  assert.equal(room.lights,false);assert.equal(room.wetAt,damp.room.wetAt);assert.equal(room.strokes.length,2);assert.deepEqual(room.tools,{brush:null,spray:null,sponge:null,stamp:null});
});

test('legacy artwork migrates once to append-only storage without rewriting room metadata per stroke',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'bathroom-migration-')),database=join(directory,'studio.sqlite');
  const legacy={code:'ABC123',owner:'legacy-owner',players:[{id:'legacy-owner',name:'Owner',hash:createHash('sha256').update('3'.repeat(64)).digest('hex')}],grants:[],generation:0,sequence:1,commands:['legacy-owner:legacy'],strokes:[{id:'legacy',player:'legacy-owner',sequence:1,color:'#ee7766',size:.02,points:[[.5,.5]]}]};
  const old=new DatabaseSync(database);old.exec('CREATE TABLE rooms(code TEXT PRIMARY KEY,state TEXT NOT NULL)');old.prepare('INSERT INTO rooms VALUES (?,?)').run(legacy.code,JSON.stringify(legacy));old.close();
  let {app,port}=await boot(database);t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
  const c=await client(port);c.send({type:'join',code:legacy.code,name:'Owner',token:'3'.repeat(64)});await c.next('joined');assert.deepEqual((await c.next('state')).room.strokes,legacy.strokes);
  const inspect=new DatabaseSync(database);const before=inspect.prepare('SELECT state FROM rooms').get().state;
  c.send(paint('new'));await c.next('accepted');
  assert.equal(inspect.prepare('SELECT state FROM rooms').get().state,before);
  assert.equal(inspect.prepare('SELECT COUNT(*) AS count FROM strokes').get().count,2);inspect.close();
  await app.close();({app,port}=await boot(database));
  const again=await client(port);again.send({type:'join',code:legacy.code,name:'Owner',token:'3'.repeat(64)});await again.next('joined');assert.equal((await again.next('state')).room.strokes.length,2);
});

test('prediction reconciliation removes only matching local work and bounds unsaved commands',()=>{
  const predictions=new Predictions();predictions.add(paint('first'),100);predictions.add(paint('second'),110);
  assert.equal(predictions.accept({id:'first',player:'someone-else'},'self',150),null);
  assert.equal(predictions.pending.size,2);
  assert.equal(predictions.accept({id:'first',player:'self'},'self',160),60);
  assert.deepEqual(predictions.values().map(command=>command.id),['second']);
  predictions.reject('second');assert.equal(predictions.pending.size,0);
  for(let i=0;i<64;i++)assert.equal(predictions.add(paint('command-'+i),0),true);
  assert.equal(predictions.add(paint('overflow'),0),false);predictions.clear();assert.equal(predictions.pending.size,0);
});

test('seeded spray is reproducible and raster work is bounded for a worst-case accepted batch',()=>{
  const command=paint('seeded-spray',{tool:'spray',size:.004,points:Array.from({length:32},(_,i)=>i%2?[1,1]:[0,0])});
  function render(){const marks=[];const ctx={save(){},restore(){},beginPath(){},fill(){},arc(...args){marks.push(args);}};drawStroke(ctx,command);return marks;}
  const first=render();assert.deepEqual(render(),first);assert.ok(first.length<=3072,'each segment must have bounded spray raster work');
});

test('server-time drying and revocation stop sponge edits immediately',async t=>{
  let now=Date.now();const {app,port}=await boot(':memory:',{clock:()=>now});t.after(()=>app.close());
  const a=await client(port),b=await client(port);
  a.send({type:'join',create:true,name:'Owner',token:'4'.repeat(64)});await a.next('joined');const code=(await a.next('state')).room.code;
  b.send({type:'join',code,name:'Guest',token:'5'.repeat(64)});const guest=(await b.next('joined')).id;await b.next('state');await b.next('meta');
  a.send({type:'grant',player:guest,allow:true});await b.next('meta',m=>m.room.grants.includes(guest));
  b.send({type:'tool',tool:'sponge',pickup:true});await b.next('meta',m=>m.room.tools.sponge===guest);
  b.send({type:'fixture',fixture:'wet'});await b.next('meta',m=>m.room.wetAt===now);
  now+=58000;b.send(paint('dried',{tool:'sponge'}));assert.match((await b.next('error')).message,/Wet the towel/);
  a.send({type:'grant',player:guest,allow:false});const revoked=await b.next('meta',m=>!m.room.grants.includes(guest));assert.equal(revoked.room.tools.sponge,null);
  b.send({type:'fixture',fixture:'wet'});assert.match((await b.next('error')).message,/owner/);
  b.send({type:'fixture',fixture:'lights',on:false});assert.match((await b.next('error')).message,/host/);
});

test('failed durable writes are rejected with the command ID and leave no accepted paint',async t=>{
  const directory=mkdtempSync(join(tmpdir(),'bathroom-failed-write-')),database=join(directory,'studio.sqlite');
  const {app,port}=await boot(database);t.after(async()=>{await app.close();rmSync(directory,{recursive:true,force:true});});
  const c=await client(port);c.send({type:'join',create:true,name:'Owner',token:'6'.repeat(64)});await c.next('joined');await c.next('state');
  const inspect=new DatabaseSync(database);inspect.exec("CREATE TRIGGER reject_stroke BEFORE INSERT ON strokes BEGIN SELECT RAISE(ABORT, 'simulated storage failure'); END;");
  c.send(paint('failed'));const rejected=await c.next('error');assert.equal(rejected.id,'failed');
  c.send({type:'sync'});const room=(await c.next('state')).room;assert.equal(room.sequence,0);assert.equal(room.strokes.length,0);
  inspect.exec('DROP TRIGGER reject_stroke');inspect.close();c.send(paint('repaired'));assert.equal((await c.next('stroke')).stroke.sequence,1);
});

test('cross-origin connections are rejected and health/assets are served',async t=>{
  const {app,port}=await boot(':memory:');t.after(()=>app.close());
  const url=`http://127.0.0.1:${port}`;
  assert.deepEqual(await (await fetch(url+'/health')).json(),{ok:true});
  assert.equal((await fetch(url+'/')).status,200);assert.equal((await fetch(url+'/../server.js')).status,404);
  const ws=new WebSocket(`ws://127.0.0.1:${port}/socket`,{origin:'https://untrusted.example'});
  await once(ws,'error');assert.notEqual(ws.readyState,1);
});
