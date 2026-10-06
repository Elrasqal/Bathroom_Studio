import { createServer } from 'node:http';
import { readFileSync, mkdirSync, statSync, createReadStream } from 'node:fs';
import { randomBytes, createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { TOOLS, STAMP_PATTERNS, seedFor } from './public/paint.js';
import { changeShower, changeFan, humidityAt } from './public/environment.js';
import { FOG_THRESHOLD, liveFogMarks } from './public/fog.js';
import { TOWELS, towelById } from './public/towels.js';
import { canStand } from './public/walk.js';
import {defaultFurnishings,slotById,feetHeight,stoolContains,pathClear,floorHeight,STOOL_TOP,minRackHeight} from './public/furnishings.js';

import {PAPER_IDS,PAPER_HOMES,paperId,paperSurface,propLocation,availableStrokes} from './public/paper.js';
import {freshLaundry,advanceLaundry,beginLaundry,loadLaundry,visibleStrokes} from './public/laundry.js';
import {CAMERA_POSITION,makePrint,gallerySnapshot,printStrokes} from './public/gallery.js';
import{LABEL_POSITION,validateCrop}from'./public/labels.js';

const root=fileURLToPath(new URL('.',import.meta.url));
const secretHash=value=>createHash('sha256').update(value).digest('hex');
const fail=message=>{throw new Error(message);};
const wetness=(room,now)=>Math.min(1,Math.max(0,1-(now-(room.wetAt||0))/60000));

export function startServer({port=3000,host='127.0.0.1',database=root+'data/studio.sqlite',origin,clock=Date.now}={}) {
  if(database!==':memory:')mkdirSync(dirname(database),{recursive:true});
  const db=new DatabaseSync(database);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
    CREATE TABLE IF NOT EXISTS rooms(code TEXT PRIMARY KEY, state TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS strokes(room TEXT NOT NULL, sequence INTEGER NOT NULL, command TEXT NOT NULL, state TEXT NOT NULL,
      PRIMARY KEY(room,sequence), UNIQUE(room,command));`);
  const rooms=new Map(),sockets=new Map(),rates=new Map();
  const writeRoom=db.prepare('INSERT OR REPLACE INTO rooms VALUES (?, ?)');
  const writeStroke=db.prepare('INSERT INTO strokes VALUES (?, ?, ?, ?)');
  const readStrokes=db.prepare('SELECT state FROM strokes WHERE room=? ORDER BY sequence');
  function save(room){const {strokes,commands,towelCounts,tools,heldProps,fogMarks,fogEpoch,...metadata}=room;writeRoom.run(room.code,JSON.stringify(metadata));}
  // Transactional migration preserves artwork from the first prototype.
  for(const row of db.prepare('SELECT * FROM rooms').all()) {
    const room=JSON.parse(row.state);room.activeTowel??='original';room.towelWet??={original:room.wetAt||0};room.fogMarks=[];room.fogEpoch=0;room.environment??={shower:false,humidity:0,at:clock()};room.lighting??='day';room.lights??=true;room.wetAt??=0;room.tools={brush:null,spray:null,sponge:null,stamp:null};
    room.laundry??=freshLaundry();room.erasedBefore??={};room.furnishings={...defaultFurnishings(),...room.furnishings};room.furnishings.items={...defaultFurnishings().items,...room.furnishings.items};room.heldProps={stool:null,jar:null,cloth:null,...Object.fromEntries(PAPER_IDS.map(id=>[id,null]))};
    if(Array.isArray(room.strokes)) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const migrate=db.prepare('INSERT OR IGNORE INTO strokes VALUES (?, ?, ?, ?)');
        for(const stroke of room.strokes)migrate.run(room.code,stroke.sequence,stroke.player+':'+stroke.id,JSON.stringify(stroke));
        save(room);db.exec('COMMIT');
      }catch(error){db.exec('ROLLBACK');throw error;}
    }
    room.strokes=readStrokes.all(room.code).map(row=>JSON.parse(row.state));
    room.towelCounts={};for(const stroke of room.strokes){const id=paperSurface(stroke)||stroke.towelId||'original';if(stroke.sequence>(room.erasedBefore[id]||0))room.towelCounts[id]=(room.towelCounts[id]||0)+1;}
    room.sequence=room.strokes.at(-1)?.sequence||0;
    room.commands=new Set(room.strokes.map(stroke=>stroke.player+':'+stroke.id));room.furnishings.washer=room.laundry.phase==='washing';if(advanceLaundry(room,clock()))save(room);rooms.set(room.code,room);
  }
  const assets=new Map([
    ['/', ['public/index.html','text/html']],['/app.js',['public/app.js','text/javascript']],
    ['/scene.js',['public/scene.js','text/javascript']],['/paint.js',['public/paint.js','text/javascript']],
    ['/performance.js',['public/performance.js','text/javascript']],['/frame-pump.js',['public/frame-pump.js','text/javascript']],['/fog.js',['public/fog.js','text/javascript']],['/controls.js',['public/controls.js','text/javascript']],['/environment.js',['public/environment.js','text/javascript']],['/walk.js',['public/walk.js','text/javascript']],
    ['/towels.js',['public/towels.js','text/javascript']],['/style.css',['public/style.css','text/css']],['/three.js',['node_modules/three/build/three.module.js','text/javascript']],
    ['/three.core.js',['node_modules/three/build/three.core.js','text/javascript']]
  ]);
  assets.set('/art/bathroom-studio-title.png',['public/art/bathroom-studio-title.png','image/png']);
  for(const file of ['movement-sync.js','laundry-visual.js','labels.js','label-editor.js','avatar.js','tape-grain.js','vhs.js','window-sky.js','water.js','furnishings.js','paper.js','paper-paint.js','replay.js','gallery.js','print-paint.js','renovation.js','laundry.js','audio.js','audio-manifest.json'])assets.set('/'+file,['public/'+file,file.endsWith('.json')?'application/json':'text/javascript']);
  const audioManifest=JSON.parse(readFileSync(root+'public/audio-manifest.json'));
  for(const effect of audioManifest.effects||[])assets.set(effect.src,['public'+effect.src,'audio/mpeg']);
  for(const track of audioManifest.music)assets.set(track.src,['public'+track.src,'audio/mpeg']);
  assets.set('/audio/outside.mp3',['public/audio/outside.mp3','audio/mpeg']);
  for(const file of ['cloth1.mp3','cloth2.mp3','creak1.mp3','doorClose_1.mp3','doorOpen_1.mp3','footstep00.mp3','footstep01.mp3','metalClick.mp3','metalLatch.mp3','bookPlace1.mp3'])assets.set('/audio/sfx/'+file,['public/audio/sfx/'+file,'audio/mpeg']);
  const server=createServer((req,res)=>{
    if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"ok":true}');}
    if(req.url==='/rooms'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(JSON.stringify({rooms:directory()}));}
    const asset=assets.get(req.url?.split('?')[0]);if(!asset){res.writeHead(404);return res.end('Not found');}
    try {
      if(asset[1].startsWith('audio/')){
        const path=root+asset[0],length=statSync(path).size;
        const range=req.headers.range;
        const headers={'Content-Type':asset[1],'Cache-Control':'public, max-age=86400','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
        let start=0,end=length-1;
        if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||!match[1]&&!match[2]){res.writeHead(416,{'Content-Range':`bytes */${length}`});return res.end();}
          start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2]));end=match[1]&&match[2]?Math.min(length-1,Number(match[2])):length-1;
          if(start>=length||end<start){res.writeHead(416,{'Content-Range':`bytes */${length}`});return res.end();}
        }
        res.writeHead(range?206:200,{...headers,...(range?{'Content-Range':`bytes ${start}-${end}/${length}`}:{ }),'Content-Length':end-start+1});
        if(req.method==='HEAD')return res.end();const stream=createReadStream(path,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());return stream.pipe(res);
      }
      const bytes=readFileSync(root+asset[0]);
      res.writeHead(200,{'Content-Type':asset[1],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'"});res.end(bytes);
    }catch{res.writeHead(500);res.end('Asset unavailable');}
  });
  const wss=new WebSocketServer({noServer:true,maxPayload:8192,perMessageDeflate:false});
  server.on('upgrade',(req,socket,head)=>{
    if(req.url!=='/socket'||req.headers.origin!==(origin||`http://${req.headers.host}`)||sockets.size>=64){socket.destroy();return;}
    socket.setNoDelay(true);wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws));
  });
  function send(ws,value){if(ws.readyState!==1)return;if(ws.bufferedAmount>2_000_000)return ws.close(1013,'Connection too slow');ws.send(JSON.stringify(value));}
  const players=room=>room.players.map(p=>({id:p.id,name:p.name,label:p.label,pose:[...sockets.values()].find(s=>s.code===room.code&&s.id===p.id)?.pose,online:[...sockets.values()].some(s=>s.code===room.code&&s.id===p.id)}));
  function directory(){return[...rooms.values()].filter(r=>r.public&&players(r).some(p=>p.id===r.owner&&p.online)).slice(0,100).map(r=>({code:r.code,name:r.roomName||`${r.players.find(p=>p.id===r.owner)?.name||'Artist'}'s bathroom`,online:players(r).filter(p=>p.online).length,capacity:4,painting:r.publicPainting!==false,available:r.players.length<64}));}
  const metadata=room=>({laundry:room.laundry,erasedBefore:room.erasedBefore,furnishings:room.furnishings,heldProps:room.heldProps,activeTowel:room.activeTowel,towels:TOWELS,owner:room.owner,grants:room.grants,players:players(room),environment:room.environment,lighting:room.lighting,tools:room.tools,lights:room.lights,wetAt:room.wetAt,serverTime:clock()});
  function pruneFog(room){
    const humidity=humidityAt(room.environment,clock());
    if(humidity<FOG_THRESHOLD&&room.fogMarks.length){room.fogMarks=[];room.fogEpoch++;broadcast(room,{type:'fog-reset',epoch:room.fogEpoch});}
    else room.fogMarks=liveFogMarks(room.fogMarks,clock(),humidity);
  }
  const snapshot=room=>{pruneFog(room);return {code:room.code,generation:room.generation,sequence:room.sequence,strokes:availableStrokes(room),photos:gallerySnapshot(room),labels:players(room).filter(p=>p.online&&p.label).map(p=>({player:p.id,...p.label,strokes:printStrokes(room,p.label)})),fogMarks:room.fogMarks,fogEpoch:room.fogEpoch,...metadata(room),public:Boolean(room.public),publicPainting:room.publicPainting!==false,roomName:room.roomName||''};};
  function broadcast(room,value){for(const [ws,client]of sockets)if(client.code===room.code)send(ws,value);}
  const update=room=>broadcast(room,{type:'meta',room:metadata(room)});
  function settle(room){const next={...room,furnishings:{...room.furnishings},erasedBefore:{...room.erasedBefore},towelWet:{...room.towelWet},towelCounts:{...room.towelCounts}};if(advanceLaundry(next,clock())){save(next);Object.assign(room,next);broadcast(room,{type:'state',room:snapshot(room)});broadcast(room,{type:'effect',effect:'click'});}}
  const canEdit=(room,id)=>id===room.owner||room.grants.includes(id)||room.public&&room.publicPainting!==false;
  function releaseTools(room,id){for(const tool of Object.keys(room.tools))if(room.tools[tool]===id)room.tools[tool]=null;for(const prop of Object.keys(room.heldProps))if(room.heldProps[prop]===id)room.heldProps[prop]=null;}
  wss.on('connection',ws=>{
    const client={code:null,id:null,window:clock(),count:0,alive:true};sockets.set(ws,client);
    ws.on('pong',()=>client.alive=true);ws.on('error',()=>{});
    ws.on('close',()=>{sockets.delete(ws);const room=rooms.get(client.code);if(room){if(![...sockets.values()].some(s=>s.code===room.code&&s.id===client.id))releaseTools(room,client.id);update(room);}});
    ws.on('message',(bytes,binary)=>{
      let m;
      try {
        const now=clock();client.commandCredit=Math.min(240,(client.commandCredit??60)+Math.max(0,now-(client.commandAt??now))*.06);client.commandAt=now;
        if(client.commandCredit<1||binary)fail('Too many messages. Slow down.');client.commandCredit--;m=JSON.parse(bytes.toString());
        if(!m||typeof m!=='object'||Array.isArray(m))fail('Invalid command');
        if(m.type==='join'){
          if(client.code)fail('Already in a bathroom');
          if(typeof m.token!=='string'||!/^[a-f0-9]{64}$/.test(m.token))fail('Invalid recovery credential');
          if(typeof m.name!=='string'||!m.name.trim()||m.name.length>24)fail('Choose a name of 1–24 characters');
          const hash=secretHash(m.token),rate=rates.get(hash)||{until:now+60000,count:0};
          if(now>rate.until){rate.until=now+60000;rate.count=0;}
          if(++rate.count>12)fail('Too many join attempts. Try again in a minute.');rates.set(hash,rate);
          let room;
          if(m.create===true){
            if(rooms.size>=100)fail('Prototype room limit reached');
            let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));
            room={code,public:m.public===true,publicHistory:m.public===true,publicPainting:m.publicPainting!==false,activeTowel:'original',towelWet:{},towelCounts:{},owner:null,players:[],grants:[],generation:0,sequence:0,strokes:[],commands:new Set(),fogMarks:[],fogEpoch:0,environment:{shower:false,fan:false,humidity:0,at:now},lighting:'day',lights:true,wetAt:0,tools:{brush:null,spray:null,sponge:null,stamp:null}};
            room.laundry=freshLaundry();room.erasedBefore={};room.furnishings=defaultFurnishings();room.heldProps={stool:null,jar:null,cloth:null,...Object.fromEntries(PAPER_IDS.map(id=>[id,null]))};
          }else{
            if(typeof m.code!=='string'||!/^[A-F0-9]{6}$/i.test(m.code))fail('Enter a six-character bathroom code');
            room=rooms.get(m.code.toUpperCase());if(!room)fail('Bathroom unavailable');if(m.publicJoin&&(!room.public||!players(room).some(p=>p.id===room.owner&&p.online)))fail('This bathroom is no longer listed');room={...room,players:room.players.map(p=>({...p}))};
          }
          let player=room.players.find(p=>p.hash===hash);
          if(player&&room.blocked?.includes(player.id))fail('The host has removed you from this bathroom');
          const online=players(room).filter(p=>p.online);if(!online.some(p=>p.id===player?.id)&&online.length>=4)fail('Bathroom full. Choose another bathroom.');
          if(!player){if(room.players.length>=(room.publicHistory||room.public?64:4))fail(room.publicHistory||room.public?'This bathroom has reached its saved artist limit. Choose another bathroom.':'Bathroom full. Seats are reserved for returning owners in this prototype.');player={id:randomBytes(12).toString('hex'),hash,name:m.name.trim()};room.players.push(player);}
          if(!room.owner)room.owner=player.id;save(room);rooms.set(room.code,room);
          // Closing alone doesn't revoke queued commands from the old socket.
          for(const [other,state]of sockets)if(other!==ws&&state.code===room.code&&state.id===player.id){state.code=null;other.close(4001,'Connected in another tab');}
          const used=new Set(online.filter(p=>p.id!==player.id).map(p=>[...sockets.values()].find(s=>s.code===room.code&&s.id===p.id)?.seat));let seat=0;while(used.has(seat))seat++;client.seat=seat;client.code=room.code;client.id=player.id;client.pose={x:.3+(seat%2)*.65,z:-.25+Math.floor(seat/2)*.85,yaw:0};client.poseAt=now;client.motionRevision=0;send(ws,{type:'joined',id:player.id});send(ws,{type:'state',room:snapshot(room)});update(room);if(player.label)broadcast(room,{type:'label',player:player.id,label:{...player.label,strokes:printStrokes(room,player.label)}});return;
        }
        const room=rooms.get(client.code);if(!room)fail('Join a bathroom first');settle(room);
        if(m.type==='listing'){
          if(client.id!==room.owner)fail('Only the host can change the public listing');if(typeof m.public!=='boolean'||typeof m.painting!=='boolean'||typeof m.name!=='string'||m.name.trim().length>48)fail('Choose a room name of up to 48 characters');
          const next={...room,public:m.public,publicHistory:room.publicHistory||m.public,publicPainting:m.painting,roomName:m.name.trim()};save(next);Object.assign(room,next);broadcast(room,{type:'state',room:snapshot(room)});return;
        }
        if(m.type==='kick'){
          if(client.id!==room.owner||m.player===room.owner||!room.players.some(p=>p.id===m.player))fail('Only the host can remove a guest');const next={...room,blocked:[...new Set([...(room.blocked||[]),m.player])],grants:room.grants.filter(id=>id!==m.player)};save(next);Object.assign(room,next);releaseTools(room,m.player);for(const[other,s]of sockets)if(s.code===room.code&&s.id===m.player){s.code=null;other.close(4003,'Removed by host');}update(room);return;
        }
        if(m.type==='unstuck'){
          if(now-(client.recoveredAt??-Infinity)<3000)fail('Wait a moment before returning again');client.recoveredAt=now;const safe=[[.3,4.5],[.3,3.5],[1.2,2.8],[-.5,1.5]].find(([x,z])=>canStand(x,z,room.furnishings,null,room.heldProps));if(!safe)fail('Move the stool away from the central aisle');client.pose={x:safe[0],z:safe[1],yaw:0};client.poseAt=now;client.moveCredit=.8;send(ws,{type:'pose',player:client.id,pose:client.pose,correction:true,recovery:true,revision:client.motionRevision=(client.motionRevision||0)+1});broadcast(room,{type:'pose',player:client.id,pose:client.pose});return;
        }
        if(m.type==='label'){
          if(Math.hypot(client.pose.x-LABEL_POSITION.x,client.pose.z-LABEL_POSITION.z)>3.5)fail('Move closer to the label framing station');if(m.generation!==room.generation)fail('The artwork changed. Open the label station again');if(now-(client.labelAt??-Infinity)<1000)fail('Let the label finish printing');
          if(!Number.isInteger(m.sequence)||m.sequence<0||m.sequence>room.sequence)fail('Choose saved artwork');const source={...makePrint(room,m.surface,0,client.id,now),sequence:m.sequence},spec=towelById(source.towelId),width=source.surface==='towel'?spec.width:3,height=source.surface==='towel'?spec.height:1,crop=validateCrop(m.crop,width,height),label={...source,crop,id:randomBytes(8).toString('hex')};
          const next={...room,players:room.players.map(p=>p.id===client.id?{...p,label}:p)};save(next);room.players=next.players;client.labelAt=now;broadcast(room,{type:'label',player:client.id,label:{...label,strokes:printStrokes(room,label)}});update(room);return;
        }
        if(m.type==='move'){
          if(m.revision!==undefined&&(!Number.isSafeInteger(m.revision)||m.revision<0))fail('Invalid movement revision');
          if(m.revision!==undefined&&m.revision!==(client.motionRevision||0)){send(ws,{type:'pose',player:client.id,pose:client.pose,correction:true,revision:client.motionRevision||0});return;}
          const correct=()=>send(ws,{type:'pose',player:client.id,pose:client.pose,correction:true,revision:client.motionRevision=(client.motionRevision||0)+1});
          const p=m.pose;
          if(!p||![p.x,p.z,p.yaw].every(Number.isFinite)||Math.abs(p.yaw)>100||![undefined,null,'stool'].includes(p.support))fail('Invalid movement');
          if(p.support==='stool'&&(client.pose.support!=='stool'||room.heldProps.stool||!stoolContains(p,room.furnishings.stool,.25)))fail('Use the stool to climb');
          if(!canStand(p.x,p.z,room.furnishings,p.support,room.heldProps)){correct();return;}
          const path=m.path===undefined?[p]:m.path;
          if(!Array.isArray(path)||path.length>256||path.some(q=>!q||![q.x,q.z].every(Number.isFinite)))fail('Invalid movement path');
          const points=[...path,p];let previous=client.pose,distance=0,clear=true;
          for(const point of points){distance+=Math.hypot(point.x-previous.x,point.z-previous.z);if(distance>3){clear=false;break;}if(!pathClear(previous,point,(x,z)=>canStand(x,z,room.furnishings,client.pose.support||p.support,room.heldProps)))clear=false;previous=point;}
          // Retained small packets may arrive together after a slow HTTP request.
          const credit=Math.min(m.path===undefined?3:40,(client.moveCredit??.8)+Math.max(0,(now-client.poseAt)/1000)*4.8);
          if(distance>credit+.15){client.moveCredit=credit;client.poseAt=now;correct();return;}
          if(!clear){correct();return;}
          client.moveCredit=Math.max(0,credit-distance);client.pose={x:p.x,z:p.z,yaw:p.yaw,...(p.support?{support:p.support}:{})};client.poseAt=now;
          broadcast(room,{type:'pose',player:client.id,pose:client.pose});return;
        }
        if(m.type==='fog'){
          if(!canEdit(room,client.id))fail('Ask the towel owner to allow collaboration');
          pruneFog(room);
          if(humidityAt(room.environment,now)<FOG_THRESHOLD)fail('Run the hot shower until the mirror fogs up');
          if(m.epoch!==room.fogEpoch)fail('The mirror has dried. Start a fresh doodle.');
          if(typeof m.id!=='string'||!/^[a-zA-Z0-9-]{1,64}$/.test(m.id))fail('Invalid command identity');
          if(!Number.isFinite(m.at)||Math.abs(now-m.at)>10000)fail('Mirror mark is too old. Try again.');
          if(!Array.isArray(m.points)||m.points.length<1||m.points.length>32||m.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1)))fail('Invalid mirror coordinates');
          if(m.points.some(([u,v])=>Math.hypot(client.pose.x-(-5.085+u*2.87),feetHeight(client.pose,room.furnishings)+2.15-(4.36-v*2.02),client.pose.z+3.475)>3.8))fail('Move closer to the mirror');
          const duplicate=room.fogMarks.find(mark=>mark.id===m.id&&mark.player===client.id);
          if(duplicate){send(ws,{type:'fog',mark:duplicate,epoch:room.fogEpoch});return;}
          if(room.fogMarks.length>=512)fail('Let the mirror fog over before adding more doodles');
          const mark={id:m.id,player:client.id,at:now,points:m.points,tool:'fog'};room.fogMarks.push(mark);broadcast(room,{type:'fog',mark,epoch:room.fogEpoch});return;
        }
        if(m.type==='sync'){send(ws,{type:'state',room:snapshot(room)});return;}
        if(m.type==='photo'){
          if(!canEdit(room,client.id))fail('Ask the towel owner to allow collaboration');
          if(Math.hypot(client.pose.x-CAMERA_POSITION.x,client.pose.z-CAMERA_POSITION.z)>3.8)fail('Move closer to the instant camera');
          if(room.photoAt&&now-room.photoAt<2000)fail('Wait for the print to develop');
          if(m.surface==='towel'&&room.laundry.phase!=='ready')fail('Finish the laundry before photographing this towel');
          const photo=makePrint(room,m.surface,m.slot,room.players.find(p=>p.id===client.id).name,now),photos=(room.photos||[]).filter(p=>p.slot!==photo.slot);photos.push(photo);
          save({...room,photos,photoAt:now});room.photos=photos;room.photoAt=now;
          broadcast(room,{type:'photo',photo:{...photo,strokes:printStrokes(room,photo)}});broadcast(room,{type:'effect',effect:'click',position:[CAMERA_POSITION.x,CAMERA_POSITION.y,CAMERA_POSITION.z]});return;
        }
        if(m.type==='ping'){send(ws,{type:'pong',sentAt:m.sentAt,serverTime:now});return;}
        if(m.type==='grant'){
          if(client.id!==room.owner)fail('Only the towel owner can change collaboration');
          if(!room.players.some(p=>p.id===m.player)||m.player===room.owner||typeof m.allow!=='boolean')fail('Invalid collaborator');
          const grants=room.grants.filter(id=>id!==m.player);if(m.allow)grants.push(m.player);save({...room,grants});room.grants=grants;
          if(!m.allow)releaseTools(room,m.player);update(room);return;
        }
        if(m.type==='tool'){
          if(!Object.hasOwn(room.tools,m.tool)||typeof m.pickup!=='boolean')fail('Invalid shared tool');
          if(m.pickup){if(!canEdit(room,client.id))fail('Ask the towel owner to allow collaboration');if(room.tools[m.tool]&&room.tools[m.tool]!==client.id)fail('That tool is already in use');releaseTools(room,client.id);room.tools[m.tool]=client.id;}
          else if(room.tools[m.tool]===client.id)room.tools[m.tool]=null;
          update(room);broadcast(room,{type:'effect',effect:m.pickup?'take':'place',position:[client.pose.x,1,client.pose.z]});return;
        }
        if(m.type==='furnishing'||m.type==='prop'||m.type==='climb'){
          if(!canEdit(room,client.id))fail('Ask the towel owner to allow collaboration');
          const near=(x,z,d=3.8)=>{if(Math.hypot(client.pose.x-x,client.pose.z-z)>d)fail('Move closer to that object');};
          const f=room.furnishings;
          let effect='place',position=[client.pose.x,1,client.pose.z];
          if(m.type==='climb'){
            near(f.stool.x,f.stool.z,1.65);if(room.heldProps.stool)fail('Put the stool down before climbing');
            client.pose={x:f.stool.x,z:f.stool.z,yaw:client.pose.yaw,support:'stool'};client.poseAt=now;
            broadcast(room,{type:'pose',player:client.id,pose:client.pose,elevation:true,revision:client.motionRevision=(client.motionRevision||0)+1});broadcast(room,{type:'effect',effect:'climb',position:[f.stool.x,STOOL_TOP,f.stool.z]});return;
          }
          if(m.type==='furnishing'){
            const next={...f,doors:[...f.doors]};
            if(m.fixture==='cabinet'){
              if(![0,1].includes(m.index)||typeof m.open!=='boolean')fail('Invalid cabinet door');near(-3.65,-1.95);
              const hinge=m.index===0?-5.15:-2.15;if(m.open!==f.doors[m.index]&&[...sockets.values()].some(c=>c.code===room.code&&Math.abs(c.pose?.x-hinge)<1.5&&c.pose.z>-2.2&&c.pose.z<-.25))fail('Step back so the cabinet door can swing');
              next.doors[m.index]=m.open;effect=m.open?'open':'close';position=[-3.65,.8,-1.95];
            }else if(m.fixture==='paper-turn'){
              if(!paperId(m.prop))fail('Choose a spare roll');if(room.heldProps[m.prop])fail('Put down the roll before turning');
              const p=propLocation(f,m.prop)||slotById(f.items[m.prop]);near(p.x,p.z);if(p.door!==undefined&&!f.doors[p.door])fail('Open the cabinet first');
              next.paperTurns={...f.paperTurns,[m.prop]:((f.paperTurns?.[m.prop]||0)+1)%4};effect='paper';position=[p.x,p.y,p.z];
            }else if(m.fixture==='curtain'){
              if(typeof m.open!=='boolean')fail('Invalid curtain setting');near(2.55,-.15);if(!m.open&&[...sockets.values()].some(c=>c.code===room.code&&c.pose?.x>2.25&&c.pose.z>-.53&&c.pose.z<.07))fail('Someone is in the curtain opening');next.curtainOpen=m.open;effect='cloth';position=[2.55,2,-.15];
            }else if(m.fixture==='drawer'){
              if(!Number.isInteger(m.index)||m.index<0||m.index>2||typeof m.open!=='boolean')fail('Invalid drawer');near(5.7,7,3.3);
              if(m.open&&[...sockets.values()].some(c=>c.code===room.code&&c.pose?.x>4.73&&c.pose.x<5.8&&Math.abs(c.pose.z-7)<1))fail('Step back to give the drawer room to open');
              next.drawers=[...(f.drawers||[false,false,false])];next.drawers[m.index]=m.open;effect=m.open?'open':'close';position=[5.7,1.1-m.index*.35,7];
            }else if(m.fixture==='rack'){
              if(client.id!==room.owner)fail('Only the towel owner can adjust the rail');near(1.95,-3.5);if(!Number.isFinite(m.height)||m.height<1.5||m.height>5.7)fail('Invalid rail height');
              m.height=Math.max(minRackHeight(towelById(room.activeTowel)),m.height);
              const towel=towelById(room.activeTowel);if(!room.heldProps.stool&&f.stool.z< -2.8&&Math.abs(f.stool.x-.3)<towel.width/2+.5&&m.height-.1-towel.height<STOOL_TOP)fail('Move the stool away before lowering the towel');
              next.rackHeight=m.height;effect='rail';position=[.3,m.height,-3.45];
            }else if(['washer-load','dryer-load','washer-start','dryer-start','washer','dryer'].includes(m.fixture)){
              const machine=m.fixture.startsWith('washer')?'washer':'dryer';
              if(client.id!==room.owner)fail('Only the towel owner can clean their artwork');near(-3.8,machine==='washer'?7.7:9.9);
              if(m.fixture.endsWith('-load')){const laundry=loadLaundry(room,machine,now);save({...room,laundry,generation:room.generation+1});room.laundry=laundry;room.generation++;broadcast(room,{type:'state',room:snapshot(room)});broadcast(room,{type:'effect',effect:'cloth',position:[-3.7,1,machine==='washer'?7.7:9.9]});return;}
              if(m.fixture.endsWith('-start')&&room.laundry.phase!==(machine==='washer'?'loaded':'dryer-loaded'))fail('Load this machine before starting it');
              const laundry=beginLaundry(room,machine,now);next.washer=machine==='washer';
              save({...room,laundry,generation:room.generation+1,furnishings:next});room.laundry=laundry;room.generation++;room.furnishings=next;
              broadcast(room,{type:'state',room:snapshot(room)});broadcast(room,{type:'effect',effect:'click',position:[-3.8,1.2,machine==='washer'?7.7:9.9]});return;
            }else if(m.fixture==='flush'){
              near(-4.5,2.4);if(now-f.flushedAt<4000)fail('The cistern is refilling');next.flushedAt=now;effect='flush';position=[-4.5,1,2.4];
            }else if(m.fixture==='duck'||m.fixture==='paper'){
              const p=m.fixture==='duck'?[6.3,.47,-2.8]:[-5.43,1.4,3.45];near(p[0],p[2]);broadcast(room,{type:'effect',effect:m.fixture,position:p});return;
            }else fail('Unknown furnishing');
            save({...room,furnishings:next});room.furnishings=next;
          }else{
            if(!Object.hasOwn(room.heldProps,m.prop)||!['take','place','release'].includes(m.action))fail('Invalid movable object');
            const id=m.prop;
            if(m.action==='take'){
              if(room.heldProps[id]&&room.heldProps[id]!==client.id)fail('That object is already being carried');
              const slot=id==='stool'?f.stool:propLocation(f,id)||slotById(f.items[id]);near(slot.x,slot.z,2.5);
              if(slot.door!==undefined&&!f.doors[slot.door])fail('Open the cabinet first');
              if(id==='stool'&&[...sockets.values()].some(c=>c.code===room.code&&c.pose?.support==='stool'))fail('Someone is standing on the stool');
              releaseTools(room,client.id);room.heldProps[id]=client.id;effect=id==='cloth'?'cloth':'take';position=[slot.x,slot.y||.5,slot.z];
            }else{
              if(room.heldProps[id]!==client.id)fail('Pick up that object first');
              if(m.action==='place'){
                const next={...f,items:{...f.items}};
                if(id==='stool'||paperId(id)&&m.slot===undefined){
                  if(!Number.isFinite(m.x)||!Number.isFinite(m.z))fail('Invalid stool position');near(m.x,m.z,3);
                  const towel=towelById(room.activeTowel);if(m.z< -2.8&&Math.abs(m.x-.3)<towel.width/2+.5&&f.rackHeight-.1-towel.height<STOOL_TOP)fail('Raise the towel or choose floor farther from it');
                  if(!pathClear(client.pose,{x:m.x,z:m.z},(x,z)=>canStand(x,z,f,null,room.heldProps)))fail('Place the stool on accessible floor');
                  if(![...(paperId(id)?[-.16,.16]:[-.3,.3])].every(dx=>[-.3,.3].every(dz=>canStand(m.x+dx,m.z+dz,f,null,{stool:client.id}))))fail('That object needs clear floor space');
                  if([...(sockets.values())].some(c=>c.code===room.code&&Math.abs(c.pose?.x-m.x)<.8&&Math.abs(c.pose?.z-m.z)<.8))fail('Move away from the placement spot');
                  if(paperId(id)){if(Object.entries(f.items).some(([other,place])=>other!==id&&typeof place==='object'&&Math.hypot(place.x-m.x,place.z-m.z)<.45))fail('Give the rolls some space');next.items[id]={x:m.x,y:floorHeight(m.x,m.z)+.18,z:m.z};}else next.stool={x:m.x,z:m.z};position=[m.x,floorHeight(m.x,m.z),m.z];
                }else{
                  const slot=slotById(m.slot);if(!slot)fail('Use a marked storage space');near(slot.x,slot.z);
                  if(slot.door!==undefined&&!f.doors[slot.door])fail('Open the cabinet first');
                  if(Object.entries(f.items).some(([other,place])=>other!==id&&place===slot.id))fail('That storage space is occupied');
                  next.items[id]=slot.id;position=[slot.x,slot.y,slot.z];
                }save({...room,furnishings:next});room.furnishings=next;
              }room.heldProps[id]=null;effect=id==='cloth'?'cloth':'place';
            }
          }
          update(room);broadcast(room,{type:'effect',effect,position});return;
        }
        if(m.type==='towel'){
          if(room.laundry.phase!=='ready')fail('Finish the wash and dry cycle before exchanging towels');
          if(client.id!==room.owner)fail('Only the towel owner can exchange stored artwork');
          if(!towelById(m.towel))fail('Unknown towel');
          if(Math.hypot(client.pose.x-4.65,client.pose.z-4.75)>3.8)fail('Move closer to the towel shelf');
          if(m.generation!==room.generation)fail('The hanging towel changed. Try again.');
          if(m.towel===room.activeTowel)return;
          const incoming=towelById(m.towel),f=room.furnishings;if(!room.heldProps.stool&&f.stool.z< -2.8&&Math.abs(f.stool.x-.3)<incoming.width/2+.5&&Math.max(f.rackHeight,minRackHeight(incoming))-.1-incoming.height<STOOL_TOP)fail('Move the stool away before hanging this towel');
          const towelWet={...room.towelWet,[room.activeTowel]:room.wetAt};
          const next={...room,activeTowel:m.towel,furnishings:{...f,rackHeight:Math.max(f.rackHeight,minRackHeight(incoming))},generation:room.generation+1,towelWet,wetAt:towelWet[m.towel]||0};
          save(next);Object.assign(room,next);broadcast(room,{type:'state',room:snapshot(room)});broadcast(room,{type:'effect',effect:'cloth',position:[4.65,2,4.75]});return;
        }
        if(m.type==='fixture'){
          if(m.fixture==='lights'){
            if(client.id!==room.owner)fail('Only the bathroom host can switch the room lights');if(typeof m.on!=='boolean')fail('Invalid light setting');save({...room,lights:m.on});room.lights=m.on;
          }else if(m.fixture==='shower'){
            if(client.id!==room.owner)fail('Only the bathroom host can run the hot shower');
            if(typeof m.on!=='boolean')fail('Invalid shower setting');
            pruneFog(room);const environment=changeShower(room.environment,m.on,now);save({...room,environment});room.environment=environment;
          }else if(m.fixture==='fan'){
            if(client.id!==room.owner)fail('Only the bathroom host can switch the exhaust fan');
            if(typeof m.on!=='boolean')fail('Invalid fan setting');
            pruneFog(room);const environment=changeFan(room.environment,m.on,now);save({...room,environment});room.environment=environment;
          }else if(m.fixture==='lighting'){
            if(client.id!==room.owner)fail('Only the bathroom host can change lighting');
            if(!['day','evening','night'].includes(m.mode))fail('Invalid lighting');
            save({...room,lighting:m.mode});room.lighting=m.mode;
          }else if(m.fixture==='wet'){
            if(!canEdit(room,client.id))fail('Ask the towel owner to allow collaboration');save({...room,wetAt:now});room.wetAt=now;
          }else fail('Unknown fixture');update(room);broadcast(room,{type:'effect',effect:m.fixture==='wet'?'wet':'click',position:[client.pose.x,1,client.pose.z]});return;
        }
        if(m.type!=='stroke')fail('Unknown command');
        if(!canEdit(room,client.id))fail('Ask the towel owner to allow collaboration');
        const surface=m.surface??'towel';if(surface!=='towel'&&!paperId(surface))fail('Unknown painting surface');
        if(surface==='towel'&&room.laundry.phase!=='ready')fail('Finish the wash and dry cycle before painting');
        if(paperId(surface)){if(room.heldProps[surface])fail('Put down the roll before painting');const p=propLocation(room.furnishings,surface)||slotById(room.furnishings.items[surface]);if(p.door!==undefined&&!room.furnishings.doors[p.door])fail('Open the cabinet before painting');if(Math.hypot(client.pose.x-p.x,client.pose.z-p.z)>3.8)fail('Move closer to the roll');}
        if(!canEdit(room,client.id))fail('Ask the towel owner to allow collaboration');
        if(m.generation!==room.generation)fail('Artwork changed. Refresh your view.');
        if(typeof m.id!=='string'||!/^[a-zA-Z0-9-]{1,64}$/.test(m.id))fail('Invalid command identity');
        const key=client.id+':'+m.id;
        if(room.commands.has(key)){const existing=room.strokes.find(s=>s.player===client.id&&s.id===m.id);send(ws,{type:'accepted',id:m.id,sequence:existing.sequence});return;}
        const tool=m.tool??'squeeze';if(!TOOLS.includes(tool))fail('Invalid tool');
        if(m.pattern!==undefined&&(tool!=='stamp'||!STAMP_PATTERNS.includes(m.pattern)))fail('Invalid stamp pattern');
        if(m.turn!==undefined&&(tool!=='stamp'||!Number.isInteger(m.turn)||m.turn<0||m.turn>3))fail('Invalid stamp rotation');
        if(tool!=='squeeze'&&room.tools[tool]!==client.id)fail('Pick up that shared tool first');
        if(surface==='towel'&&tool==='sponge'&&wetness(room,now)<=.05)fail('Wet the towel before cleaning it');
        if(typeof m.color!=='string'||!/^#[a-f0-9]{6}$/i.test(m.color)||!Number.isFinite(m.size)||m.size<.004||m.size>.08)fail('Invalid toothpaste settings');
        if(!Array.isArray(m.points)||m.points.length<1||m.points.length>32||m.points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1)))fail('Invalid stroke coordinates');
        const canvasId=paperId(surface)?surface:room.activeTowel;if((room.towelCounts[canvasId]||0)>=(paperId(surface)?2000:12000))fail('Prototype towel is full');
        const stroke={id:m.id,player:client.id,sequence:room.sequence+1,generation:room.generation,towelId:room.activeTowel,surface,tool,color:m.color,size:m.size,points:m.points,seed:seedFor(m.id)};
        if(tool==='stamp'){stroke.pattern=m.pattern??'duck';stroke.turn=m.turn??0;}
        // Constant-size durable append, before any acceptance is sent.
        writeStroke.run(room.code,stroke.sequence,key,JSON.stringify(stroke));
        room.sequence++;room.strokes.push(stroke);room.towelCounts[canvasId]=(room.towelCounts[canvasId]||0)+1;room.commands.add(key);broadcast(room,{type:'stroke',stroke});send(ws,{type:'accepted',id:m.id,sequence:stroke.sequence});
      }catch(error){send(ws,{type:'error',id:typeof m?.id==='string'?m.id:undefined,command:m?.type,message:error instanceof SyntaxError?'Invalid message':error.message});}
    });
  });
  const laundryTimer=setInterval(()=>{for(const room of rooms.values())settle(room);},250);laundryTimer.unref();
  const heartbeat=setInterval(()=>{for(const [ws,client]of sockets){if(!client.alive)ws.terminate();else{client.alive=false;ws.ping();}}for(const room of rooms.values())pruneFog(room);for(const [key,rate]of rates)if(clock()>rate.until)rates.delete(key);},30000);heartbeat.unref();
  server.listen(port,host);
  return{server,close:async()=>{clearInterval(heartbeat);clearInterval(laundryTimer);for(const ws of sockets.keys())ws.terminate();await new Promise(resolve=>server.close(resolve));wss.close();db.close();}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const app=startServer({port:Number(process.env.PORT||3000),host:process.env.HOST||'127.0.0.1',database:process.env.DATABASE||root+'data/studio.sqlite',origin:process.env.ORIGIN});
  app.server.on('listening',()=>console.log(`Bathroom Studio listening on port ${app.server.address().port}`));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
}
