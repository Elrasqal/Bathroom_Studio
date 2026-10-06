// Music advances once through the complete playlist. Repeating requires an explicit restart.
export class MusicQueue{
  constructor(length){this.length=length;this.index=0;this.complete=false;}
  advance(){if(this.index+1>=this.length){this.complete=true;return null;}return ++this.index;}
  restart(){this.index=0;this.complete=false;return 0;}
}
export function roomPan(location,pose){const dx=location[0]-pose.x,dz=location[2]-pose.z,yaw=pose.yaw||0;return Math.max(-1,Math.min(1,(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(1,Math.hypot(dx,dz))));}
export function createSoundscape({onStatus=()=>{},manifest=null,AudioClass=globalThis.Audio,ContextClass=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
  let catalog=manifest,queue=manifest?new MusicQueue(manifest.music.length):null,context=null,started=false,enabled=true,musicEnabled=true,hidden=false,room=null,position={x:0,z:0},audioNow=Date.now(),lastStep=0,lastPaint=0;
  const music=new AudioClass(),outside=new AudioClass(),cache=new Map(),voices=new Set();music.preload=outside.preload='none';music.loop=false;outside.loop=true;
  const volume={music:.16,ambience:.06,effects:.4},loops={};let master=null,noise=null;
  function report(message){onStatus(message||(!started?'Sound starts with your next interaction':queue?.complete?'Playlist finished · radio restarts it':music.paused?'Music paused':catalog?.music[queue.index]?.title+' · Chris Zabriskie'));}
  const loaded=catalog?Promise.resolve(catalog):fetch('/audio-manifest.json').then(r=>{if(!r.ok)throw Error('Audio catalog unavailable');return r.json();}).then(value=>{catalog=value;queue=new MusicQueue(value.music.length);return value;}).catch(()=>{report('Audio unavailable · the bathroom is still playable');return null;});
  async function playCurrent(){if(!catalog||!enabled||!musicEnabled||hidden||queue.complete)return;const track=catalog.music[queue.index];if(!music.src.endsWith(track.src))music.src=track.src;music.volume=volume.music;try{await music.play();report();}catch{report('Use Enable sound to start the soundtrack');}}
  music.onended=()=>{if(queue.advance()===null){report();return;}playCurrent();};
  music.onerror=()=>{if(!queue)return;if(queue.advance()!==null)playCurrent();else report('Music unavailable · playlist stopped');};
  function noiseLoop(name,filterType,frequency){const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noise;source.loop=true;filter.type=filterType;filter.frequency.value=frequency;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(master);source.start();loops[name]=gain;}
  function initialize(){if(context||!ContextClass)return;context=new ContextClass();master=context.createGain();master.gain.value=volume.effects;master.connect(context.destination);
    noise=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const samples=noise.getChannelData(0);let seed=173;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=seed/2147483648-1;}
    noiseLoop('shower','highpass',650);
    const hum=context.createOscillator(),gain=context.createGain();hum.type='sine';hum.frequency.value=60;gain.gain.value=0;hum.connect(gain);gain.connect(master);hum.start();loops.hum=gain;
  }
  function level(gain,value){if(!gain||!context)return;gain.gain.setTargetAtTime(value,context.currentTime,.35);}
  function spatial(gain,location){const panner=context.createStereoPanner?.();if(panner){gain.connect(panner);panner.connect(master);panner.pan.value=roomPan(location,position);}else gain.connect(master);return panner;}
  function follow(voice,location){voice?.panner?.pan.setTargetAtTime(roomPan(location,position),context.currentTime,.12);}
  function environment(next,pose=position,serverNow=Date.now()){audioNow=serverNow;room=next;position=pose;crackle();const windowDistance=Math.hypot(pose.x+5.5,pose.z+1);
    fan(next);follow(fanVoice,[5.8,5.6,-3.5]);if(fanVoice)level(fanVoice.gain,(enabled&&!hidden&&next?.environment?.fan?.28/(1+Math.hypot(pose.x-5.8,pose.z+3.5)*.18):0)*(pose.z>5.65?.35:1));machines(next);follow(machineVoice,[-3.8,1.2,next?.laundry?.phase==='washing'?7.7:9.9]);if(machineVoice)level(machineVoice.gain,.13/(1+Math.hypot(pose.x+3.8,pose.z-(next?.laundry?.phase==='washing'?7.7:9.9))*.25)*(pose.z<5.65?.35:1));
    const outsideAudible=enabled&&!hidden&&next?.lighting!=='night';
    outside.volume=outsideAudible?volume.ambience*Math.max(.15,1-windowDistance/14)*(pose.z>5.65?.45:1):0;
    if(!outsideAudible)outside.pause();else if(started&&outside.paused)outside.play().catch(()=>{});
    const showerDistance=Math.hypot(pose.x-6.9,pose.z+1.3),audible=enabled&&!hidden;
    level(loops.shower,audible&&next?.environment.shower?.13/(1+showerDistance*.25):0);
    level(loops.hum,audible?.009*(pose.z>5.65&&next?.furnishings.washer?2:1):0);
  }
  async function unlock(){if(!enabled||hidden)return;initialize();try{await context?.resume();}catch{}if(started)return;started=true;await loaded;if(!catalog)return;outside.src=catalog.ambient.src;environment(room,position);playCurrent();}
  async function toggle(){if(queue?.complete){musicEnabled=true;queue.restart();}else musicEnabled=!musicEnabled;if(musicEnabled){await unlock();playCurrent();}else{music.pause();report();}}
  async function enable(value){enabled=value;if(value){await unlock();if(context?.state==='suspended')context.resume().catch(()=>{});playCurrent();}else{stopCrackle();stopPaint();stopMachine();stopFan();stopEffects();music.pause();outside.pause();context?.suspend().catch(()=>{});}environment(room,position);report(value?undefined:'Sound muted');}
  const files={open:'doorOpen_1',close:'doorClose_1',cloth:'cloth1',rail:'metalLatch',click:'metalClick',take:'bookPlace1',place:'bookPlace1',climb:'tile',paper:'cloth2',step:'tile',brush:'brush',sponge:'brush',squeeze:'paste',spray:'spray',duck:'duck',flush:'flush',stamp:'duck'};
  async function sample(key){if(!context)return null;if(!cache.has(key))cache.set(key,fetch('/audio/sfx/'+key+'.mp3').then(r=>{if(!r.ok)throw Error('Sound unavailable');return r.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes)).catch(()=>null));return cache.get(key);}
  function synth(effect,attenuation){if(!context)return;const gain=context.createGain(),source=effect==='duck'?context.createOscillator():context.createBufferSource();gain.gain.value=0;gain.connect(master);source.connect(gain);const now=context.currentTime;
    voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};
    if(effect==='duck'){source.type='triangle';source.frequency.setValueAtTime(650,now);source.frequency.exponentialRampToValueAtTime(310,now+.18);gain.gain.setValueAtTime(.045*attenuation,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.2);source.start();source.stop(now+.21);}
    else{source.buffer=noise;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=effect==='flush'?450:850;source.disconnect();source.connect(filter);filter.connect(gain);gain.gain.setValueAtTime(.11*attenuation,now);gain.gain.exponentialRampToValueAtTime(.0001,now+(effect==='flush'?2.8:.3));source.start();source.stop(now+(effect==='flush'?3:.35));}
  }
  async function play(effect,location=null){if(!enabled||hidden||!started||!context||context.state!=='running'||voices.size>=8)return;
    const attenuation=location?Math.max(0,1-Math.hypot(position.x-location[0],position.z-location[2])/13):1;if(attenuation<=0)return;
    if(effect==='wet'){synth(effect,attenuation);return;}
    const buffer=await sample(files[effect]||'metalClick');if(!buffer||!enabled||hidden||voices.size>=8)return;
    const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.playbackRate.value=effect==='step'?.97+Math.random()*.06:1;gain.gain.value=attenuation*(effect==='step'?.8:.5);const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=effect==='step'?1400:12000;source.connect(filter);filter.connect(gain);const panner=spatial(gain,location||[position.x,0,position.z]);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();panner?.disconnect();};if(effect==='step'){const now=context.currentTime;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(attenuation*.8,now+.025);gain.gain.setValueAtTime(attenuation*.8,now+.35);gain.gain.linearRampToValueAtTime(0,now+.44);source.start(0,stepIndex++%2===0?.95:3.5,.45);}else source.start();
  }
  function step(now){if(now-lastStep>390){lastStep=now;play('step');}}
  let desiredPaint=null,paintVoice=null,paintEpoch=0,stepIndex=0;
  function stopPaint(){if(desiredPaint!==null){desiredPaint=null;paintEpoch++;}if(paintVoice){const {source,gain}=paintVoice;gain.gain.setTargetAtTime(0,context.currentTime,.035);source.stop(context.currentTime+.16);paintVoice=null;}}
  function stopEffects(){for(const source of voices){try{source.stop();}catch{}}voices.clear();}
  async function paint(tool){if(tool==='stamp'){if(desiredPaint!==tool){stopPaint();desiredPaint=tool;play('stamp');}return;}if(desiredPaint===tool||!enabled||hidden||!started||!context)return;stopPaint();desiredPaint=tool;const epoch=++paintEpoch,buffer=await sample(files[tool]||'brush');if(!buffer||epoch!==paintEpoch||desiredPaint!==tool||!enabled||hidden)return;
    const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter();source.buffer=buffer;source.loop=true;source.loopStart=Math.min(.15,buffer.duration*.1);source.loopEnd=Math.max(source.loopStart+.1,buffer.duration-.12);filter.type='lowpass';filter.frequency.value=tool==='spray'?3200:1800;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(master);gain.gain.setTargetAtTime(tool==='spray'?.1:.16,context.currentTime,.06);source.start();paintVoice={source,gain};source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  let fanWanted=false,fanEpoch=0,fanVoice=null;
  function stopFan(){fanWanted=false;fanEpoch++;if(fanVoice){const {source,gain}=fanVoice;gain.gain.setTargetAtTime(0,context.currentTime,.12);source.stop(context.currentTime+.5);fanVoice=null;}}
  async function fan(next){const on=Boolean(enabled&&!hidden&&started&&next?.environment?.fan);if(on===fanWanted)return;stopFan();if(!on||!context)return;fanWanted=true;const epoch=fanEpoch,buffer=await sample('fan');if(!buffer||epoch!==fanEpoch||!fanWanted||!enabled||hidden)return;const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.loop=true;source.loopStart=.25;source.loopEnd=Math.max(.5,buffer.duration-.25);source.connect(gain);const panner=spatial(gain,[5.8,5.6,-3.5]);gain.gain.value=0;gain.gain.setTargetAtTime(.28/(1+Math.hypot(position.x-5.8,position.z+3.5)*.18)*(position.z>5.65?.35:1),context.currentTime,.4);source.start();fanVoice={source,gain,panner};source.onended=()=>{source.disconnect();gain.disconnect();panner?.disconnect();};}
  let machineKey='',machineEpoch=0,machineVoice=null;
  let tapeEnabled=true,crackleEpoch=0,crackleVoice=null,nextCrackleAt=Date.now()+12000;
  function stopCrackle(){crackleEpoch++;if(crackleVoice){try{crackleVoice.source.stop();}catch{}crackleVoice=null;}}
  async function crackle(){if(!tapeEnabled||!enabled||hidden||!started||!context||!catalog?.effects?.some(e=>e.key==='vhs')||Date.now()<nextCrackleAt)return;nextCrackleAt=Date.now()+25000+Math.random()*35000;const epoch=crackleEpoch,buffer=await sample('vhs');if(!buffer||epoch!==crackleEpoch||!tapeEnabled||!enabled||hidden)return;const source=context.createBufferSource(),gain=context.createGain(),now=context.currentTime,duration=Math.min(buffer.duration,4.6);source.buffer=buffer;source.connect(gain);gain.connect(master);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume.ambience*.65,now+.9);gain.gain.setValueAtTime(volume.ambience*.65,now+Math.max(1,duration-1));gain.gain.linearRampToValueAtTime(0,now+duration);source.start(0,0,duration);crackleVoice={source,gain};source.onended=()=>{source.disconnect();gain.disconnect();if(crackleVoice?.source===source)crackleVoice=null;};}
  function setTape(value){tapeEnabled=Boolean(value);if(!tapeEnabled)stopCrackle();else nextCrackleAt=Date.now()+5000;}
  function stopMachine(){machineEpoch++;machineKey='';if(machineVoice){const {source,gain}=machineVoice;gain.gain.setTargetAtTime(0,context.currentTime,.1);source.stop(context.currentTime+.4);machineVoice=null;}}
  async function machines(next){const c=next?.laundry,key=enabled&&!hidden&&c&&['washing','drying'].includes(c.phase)?c.phase+':'+c.startedAt:'';if(key===machineKey)return;stopMachine();if(!key||!context||!started)return;machineKey=key;const epoch=machineEpoch,buffer=await sample(c.phase==='washing'?'washer':'dryer');if(!buffer||epoch!==machineEpoch||!enabled||hidden)return;const elapsed=Math.max(0,(audioNow-c.startedAt)/1000);if(elapsed>=20||elapsed>=buffer.duration)return;
    const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.connect(gain);const panner=spatial(gain,[-3.8,1.2,c.phase==='washing'?7.7:9.9]);gain.gain.value=0;gain.gain.setTargetAtTime(.13/(1+Math.hypot(position.x+3.8,position.z-(c.phase==='washing'?7.7:9.9))*.25)*(position.z<5.65?.35:1),context.currentTime,.15);source.start(0,elapsed,Math.min(20-elapsed,buffer.duration-elapsed));machineVoice={source,gain,panner};source.onended=()=>{source.disconnect();gain.disconnect();panner?.disconnect();if(machineVoice?.source===source)machineVoice=null;};
  }
  function setVolume(kind,value){volume[kind]=Math.max(0,Math.min(1,Number(value)));music.volume=volume.music;if(master)master.gain.value=volume.effects;environment(room,position);}
  function visibility(value){hidden=value;if(value){stopCrackle();stopPaint();stopMachine();stopFan();stopEffects();music.pause();outside.pause();context?.suspend().catch(()=>{});}else if(started&&enabled){context?.resume().catch(()=>{});playCurrent();}environment(room,position);}
  return{unlock,toggle,enable,play,step,paint,stopPaint,environment,setTape,setVolume,visibility,ready:loaded,playing:()=>!music.paused,dispose:()=>{stopCrackle();stopPaint();stopMachine();stopFan();stopEffects();music.pause();outside.pause();context?.close();}};
}
