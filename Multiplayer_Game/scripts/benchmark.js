import { performance } from 'node:perf_hooks';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { setTimeout as pause } from 'node:timers/promises';
import { WebSocket } from 'ws';
import { startServer } from '../server.js';

const directory=mkdtempSync(join(tmpdir(),'bathroom-benchmark-'));
const app=startServer({port:0,database:join(directory,'studio.sqlite')});await once(app.server,'listening');
const port=app.server.address().port,ws=new WebSocket(`ws://127.0.0.1:${port}/socket`,{origin:`http://127.0.0.1:${port}`});
const waits=new Map();let snapshot;
ws.on('message',data=>{const m=JSON.parse(data);if(m.type==='state'){snapshot=m.room;waits.get('state')?.(m);}if(m.type==='accepted'){waits.get(m.id)?.(performance.now());waits.delete(m.id);}if(m.type==='error')throw new Error(m.message);});
await once(ws,'open');const joined=new Promise(resolve=>waits.set('state',resolve));
ws.send(JSON.stringify({type:'join',create:true,name:'Benchmark',token:'9'.repeat(64)}));await joined;
try{
  const samples=[];
  for(let i=0;i<180;i++){
    const id=`measure-${i}`,ack=new Promise(resolve=>waits.set(id,resolve)),started=performance.now();
    ws.send(JSON.stringify({type:'stroke',id,generation:0,color:'#ee7766',size:.02,points:[[.2,.3],[.4,.5],[.6,.7]]}));
    samples.push((await ack)-started);await pause(32);
  }
  samples.sort((a,b)=>a-b);
  console.log(JSON.stringify({segments:samples.length,medianAcceptanceMs:+samples[90].toFixed(2),p95AcceptanceMs:+samples[171].toFixed(2),maxAcceptanceMs:+samples.at(-1).toFixed(2),durability:'SQLite WAL, synchronous FULL, on local temporary disk'},null,2));
}finally{ws.terminate();await app.close();rmSync(directory,{recursive:true,force:true});}
