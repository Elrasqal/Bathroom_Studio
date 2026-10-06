import * as THREE from '/three.js';
import{toothpasteAvatar}from'./avatar.js';
import { buildRenovation } from './renovation.js';
import {feetHeight} from './furnishings.js';
import { TOWELS, towelById } from './towels.js';
import { humidityAt } from './environment.js';
import { QUALITY, mergeStatic } from './performance.js';
import { STAMP_PATTERNS, stampShape } from './paint.js';
import {skyPicture} from './window-sky.js';
import {showerStreaks} from './water.js';

export function buildBathroom(canvas, paintTexture, fogTexture,paperTextures={},printTextures=[]) {
  const scene=new THREE.Scene();scene.background=new THREE.Color('#9bbba3');scene.fog=new THREE.Fog('#9bbba3',22,38);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'default',alpha:false,stencil:false});
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=false;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const camera=new THREE.PerspectiveCamera(72,1,.2,32);camera.rotation.order='YXZ';
  const ambient=new THREE.HemisphereLight('#dcebd0','#607e78',1.9);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#fff3d5',2.1);sun.position.set(-2,9,6);sun.castShadow=true;
  sun.shadow.mapSize.set(512,512);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.1,far:25});sun.shadow.bias=-.001;scene.add(sun);
  const batches=new Map(),interactive=[],toolObjects={};
  const materials=new Map();
  const material=(color,roughness=.65)=>{
    const key=color+roughness;if(!materials.has(key))materials.set(key,new THREE.MeshLambertMaterial({color}));return materials.get(key);
  };
  function box(w,h,d,x,y,z,color,rotation=0) {
    const key=color;let batch=batches.get(key);if(!batch){batch=[];batches.set(key,batch);}
    batch.push({w,h,d,x,y,z,rotation});
  }
  function mesh(geometry,color,x,y,z,roughness=.65) {
    const object=new THREE.Mesh(geometry,material(color,roughness));object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;scene.add(object);return object;
  }
  function cylinder(r1,r2,h,x,y,z,color){return mesh(new THREE.CylinderGeometry(r1,r2,h,10),color,x,y,z);}
  function ellipsoid(x,y,z,sx,sy,sz,color){const object=mesh(new THREE.SphereGeometry(1,10,6),color,x,y,z);object.scale.set(sx,sy,sz);return object;}
  function action(object,action,label){object.userData={action,label};interactive.push(object);return object;}

  // Hundreds of tiles share two instanced meshes instead of individual draw calls.
  box(14,.2,15,1,-.12,3.5,'#819f89');box(14.18,7,.18,1,3.4,-4,'#b4cbbd');box(.18,7,14.82,-6,3.4,3.5,'#9fbfb5');
  box(.18,7,14.82,8,3.4,3.5,'#9fbfb5');box(14.18,7,.18,1,3.4,11,'#b4cbbd');box(14,.15,15,1,6.85,3.5,'#b0c5aa');
  // Trim and corner tiles terminate before their neighbors: no coplanar overlaps.
  for(let x=-5.5;x<8;x++)for(let y=.5;y<3;y++){const edge=x===-5.5||x===7.5,w=edge?.8:.965,cx=x===-5.5?-5.4:x===7.5?7.4:x;box(w,.965,.04,cx,y,-3.86,'#a8c6ac');box(w,.965,.04,cx,y,10.86,'#a8c6ac');}
  for(let z=-3.5;z<11;z++)for(let y=.5;y<3;y++){box(.04,.965,.965,-5.86,y,z,'#8ead96');box(.04,.965,.965,7.86,y,z,'#8ead96');}
  for(let x=-5.5;x<8;x++)for(let z=-3.5;z<11;z++)box(.97,.02,.97,x,.01,z,z>5.6?((Math.floor(x+z)%2)?'#5f8272':'#779b82'):((Math.floor(x+z)%2)?'#88aa90':'#adc5a6'));

  // Vanity, basin, mirror, chrome faucet and an open shelf of supplies.
  box(3.4,.2,1.8,-3.65,1.48,-2.8,'#a9c3a6');
  ellipsoid(-3.65,1.6,-2.6,1.02,.08,.6,'#f5f0df');ellipsoid(-3.65,1.695,-2.53,.8,.015,.43,'#90bcb5');
  cylinder(.055,.055,.62,-3.65,1.9,-3.32,'#b8c8bf');box(.1,.1,.5,-3.65,2.18,-3.1,'#b8c8bf');
  action(mesh(new THREE.BoxGeometry(.4,.25,.4),'#c1b58c',-3.15,1.68,-3.2),'wet','Wet the towel at the faucet');
  box(3.15,2.3,.17,-3.65,3.35,-3.71,'#d0b780');box(2.9,2.05,.19,-3.65,3.35,-3.59,'#82ada7');
  box(2.2,.1,.5,-3.7,4.78,-3.59,'#617e68');
  cylinder(.13,.13,.6,-4.45,5.12,-3.55,'#df9c78');cylinder(.16,.18,.48,-4,5.06,-3.55,'#8e9faf');cylinder(.12,.12,.65,-3.55,5.14,-3.55,'#d6c990');
  box(.45,.13,.3,-2.7,1.65,-2.6,'#edce9b');ellipsoid(-2.7,1.74,-2.6,.17,.08,.11,'#ed9d89');

  // Towel, raised rail, woven border and a wall switch.
  const fabric=new THREE.PlaneGeometry(2.2,2.75,8,8),fabricPosition=fabric.attributes.position;
  for(let i=0;i<fabricPosition.count;i++)fabricPosition.setZ(i,.018*Math.sin(fabricPosition.getX(i)*28)+.009*Math.sin(fabricPosition.getY(i)*17));fabric.computeVertexNormals();
  const towel=new THREE.Mesh(fabric,new THREE.MeshLambertMaterial({map:paintTexture,side:THREE.DoubleSide}));
  towel.position.set(.3,2.2,-3.34);towel.receiveShadow=true;scene.add(towel);
  box(.28,.42,.08,2.15,1.33,-3.77,'#f2e6c9');
  const switchObject=action(mesh(new THREE.BoxGeometry(.17,.23,.13),'#dfaa79',2.15,1.33,-3.7),'lights','Switch the room lights');

  // The shower enclosure is built with the renovated fixtures below.

  // Toilet, paper roll, bin, laundry basket, bench and bath mat.
  const toiletMeshes=scene.children.length,toiletBoxes=new Map([...batches].map(([k,v])=>[k,v.length]));
  box(1.1,1.15,.55,-4.45,1.0,.15,'#a9c3a6');ellipsoid(-4.45,.7,.91,.65,.3,.9,'#a9c3a6');
  const seat=mesh(new THREE.TorusGeometry(.48,.09,8,24),'#f7f0db',-4.45,1.02,.93);seat.rotation.x=Math.PI/2;seat.scale.y=1.3;
  cylinder(.28,.4,.65,-4.45,.35,.7,'#96b497');
  // Bowl and vanity face parallel into the room.
  const toiletAngle=Math.PI/2,toiletGroup=new THREE.Group();
  toiletGroup.position.set(-5.2,0,2.4);toiletGroup.rotation.y=toiletAngle;
  for(const object of scene.children.slice(toiletMeshes)){object.position.x+=4.45;object.position.z-=.15;toiletGroup.add(object);}toiletGroup.updateMatrixWorld(true);for(const object of [...toiletGroup.children]){object.applyMatrix4(toiletGroup.matrixWorld);scene.add(object);}
  for(const [key,items]of batches)for(let i=toiletBoxes.get(key)||0;i<items.length;i++){const b=items[i],x=b.x+4.45,z=b.z-.15;b.x=-5.2+x*Math.cos(toiletAngle)+z*Math.sin(toiletAngle);b.z=2.4+z*Math.cos(toiletAngle)-x*Math.sin(toiletAngle);b.rotation+=toiletAngle;}
  cylinder(.28,.24,.7,-3.2,.38,.5,'#8caba0');cylinder(.29,.29,.05,-3.2,.76,.5,'#bbc5a9');
  cylinder(.5,.42,.8,-2.6,.42,9.6,'#b5a177');
  for(let i=0;i<5;i++)box(.85,.025,.025,-2.6,.17+i*.13,9.95,'#d1bd90');
  box(2.8,.035,1.8,.15,.04,1.25,'#d4a17f');for(let x=-1.2;x<1.5;x+=.12)box(.035,.006,1.6,x,.065,1.25,'#e3bc99');
  // A movable step stool replaces the fixed bath bench.
  // Drying rack, slippers and bathing supplies make the open floor feel occupied.
  for(const x of [1.7,3.1]){box(.06,2.2,.06,x,1.1,7.5,'#b8c8bf');box(.65,.07,.07,x,.08,7.5,'#b8c8bf');}
  for(const y of [.75,1.3,1.85,2.2])box(1.4,.06,.06,2.4,y,7.5,'#b8c8bf');
  box(.9,1.2,.055,3.4,1.58,7.45,'#93b6ab');
  for(const x of [.2,.55])ellipsoid(x,.12,6.1,.15,.1,.34,'#d4a17f');


  // Window, potted plant, pendant lamp and a small rubber duck.
  box(.15,2.4,2.25,-5.78,4.7,-1,'#f2dfb4');box(.17,2.14,2,-5.66,4.7,-1,'#b9d7cd');
  box(.19,.06,2.05,-5.54,4.7,-1,'#f2dfb4');for(const y of [4.145,5.255])box(.19,1.04,.07,-5.54,y,-1,'#f2dfb4');
  const skyCanvas=document.createElement('canvas');skyCanvas.width=skyCanvas.height=256;const skyContext=skyCanvas.getContext('2d'),skyTexture=new THREE.CanvasTexture(skyCanvas);skyTexture.colorSpace=THREE.SRGBColorSpace;skyTexture.generateMipmaps=false;skyTexture.minFilter=THREE.LinearFilter;
  const skyWindow=new THREE.Mesh(new THREE.PlaneGeometry(2,2.14),new THREE.MeshBasicMaterial({map:skyTexture}));skyWindow.position.set(-5.565,4.7,-1);skyWindow.rotation.y=Math.PI/2;scene.add(skyWindow);let skyKey='',skyTick=-Infinity;const windowDirection=new THREE.Vector3(),windowTo=new THREE.Vector3();
  cylinder(.35,.25,.6,-5.42,.34,-.6,'#c58f70');
  for(let i=0;i<7;i++){const leaf=ellipsoid(-5.42+Math.sin(i)*.2,1+Math.cos(i)*.12,-.6+Math.cos(i)*.18,.12,.55,.15,'#5c856c');leaf.rotation.z=Math.sin(i)*.55;}
  cylinder(.018,.018,1.08,0,6.235,0,'#798b76');cylinder(.48,.24,.32,0,5.55,0,'#d6bd7e');
  const bulb=mesh(new THREE.SphereGeometry(.18,8,6),'#fff5c4',0,5.43,0);bulb.material=new THREE.MeshLambertMaterial({color:'#fff3c9',emissive:'#f7d993',emissiveIntensity:1});

  // Shared tools sit on the vanity until an artist picks one up.
  function tool(name,geometry,color,x,y,z,label){const object=action(mesh(geometry,color,x,y,z),name,label);toolObjects[name]=object;return object;}
  function detailBatch(object){const position=object.position.clone(),rotation=object.rotation.clone();object.position.set(0,0,0);object.rotation.set(0,0,0);object.updateMatrixWorld(true);mergeStatic(THREE,object,new Set());object.position.copy(position);object.rotation.copy(rotation);for(const child of object.children)if(child.isMesh)action(child,object.userData.action,object.userData.label);}
  const brush=tool('brush',new THREE.BoxGeometry(.08,.07,.7),'#bd7275',-5.05,1.69,-2.78,'Pick up the toothbrush');
  const bristles=mesh(new THREE.BoxGeometry(.11,.07,.22),'#f4ead5',-4.75,1.75,-2.17);brush.add(bristles);bristles.position.set(0,.06,.28);scene.remove(bristles);for(let i=0;i<5;i++){const row=new THREE.Mesh(new THREE.BoxGeometry(.12,.025,.012),material('#839f87'));row.position.set(0,.11,.2+i*.035);brush.add(row);}const brushGrip=new THREE.Mesh(new THREE.BoxGeometry(.09,.078,.25),material('#577d6a'));brushGrip.position.z=-.12;brush.add(brushGrip);
  const spray=tool('spray',new THREE.CylinderGeometry(.12,.16,.48,12),'#728bab',7.48,1.66,2.18,'Pick up mouthwash spray');const sprayer=new THREE.Mesh(new THREE.BoxGeometry(.13,.12,.14),material('#385c52'));sprayer.position.y=.3;spray.add(sprayer);const spout=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.1,8),material('#acc2a1'));spout.rotation.x=Math.PI/2;spout.position.set(0,.3,.11);spray.add(spout);const sprayLabel=new THREE.Mesh(new THREE.BoxGeometry(.17,.18,.018),material('#b8c9a5'));sprayLabel.position.set(0,-.015,.135);spray.add(sprayLabel);
  const sponge=tool('sponge',new THREE.BoxGeometry(.35,.12,.24),'#c4b568',7.4,1.48,1.8,'Pick up the bath sponge');for(let i=0;i<8;i++){const pore=new THREE.Mesh(new THREE.CircleGeometry(.012,6),material('#8e864f'));pore.rotation.x=-Math.PI/2;pore.position.set(Math.sin(i*9)*.13,.061,Math.cos(i*13)*.085);sponge.add(pore);}

  for(const object of [brush,spray,sponge])detailBatch(object);
  box(.6,.12,1.2,7.48,1.36,1.8,'#527b65');
  // The expanded half of the room: storage, laundry, radiator and a changing area.
  // Hollow laundry machine shells and their visible drums are built together below.
  for(let z=7.1;z<8.4;z+=.36)cylinder(.06,.06,.03,-3.84,1.16,z,'#78978b').rotation.z=Math.PI/2;
  // Hollow utility cabinet; sliding drawers are built with their contents below.
  box(.09,1.25,2,7.51,.65,7,'#477b6e');box(1.8,1.25,.09,6.65,.65,6.04,'#477b6e');box(1.8,1.25,.09,6.65,.65,7.96,'#477b6e');box(1.8,.09,2,6.65,.1,7,'#477b6e');box(2,.12,2.2,6.65,1.34,7,'#9ab797');
  for(let z=3.2;z<4.8;z+=.18){box(.18,1.45,.1,7.7,1.15,z,'#a2bda0');}box(.15,.1,1.9,7.65,.5,3.9,'#b8c8bf');
  box(2.2,3.8,.13,1.7,1.92,10.75,'#b0926b');box(1.94,3.52,.15,1.7,1.94,10.65,'#749889');
  action(mesh(new THREE.SphereGeometry(.075,12,8),'#d9be80',2.38,1.6,10.52),'door','The studio door is closed');
  for(let y=3.6;y<5.3;y+=.55){box(1.1,.07,1.6,7.3,y,8.9,'#bea87d');for(let z=8.4;z<9.6;z+=.27)box(.7,.16,.23,7.27,y+.11,z,y%1>.5?'#d8b190':'#d3dbbe');}
  box(3,.03,2.3,1.8,.04,7.8,'#869f91');for(let x=.4;x<3.3;x+=.14)box(.035,.006,2.15,x,.065,7.8,'#b9c8ad');
  // Baseboards, decorative trim, ventilation grille and grout detail are instanced.
  for(const z of [-3.78,10.78]){box(13.7,.18,.1,1,.16,z,'#73997e');box(13.7,.12,.1,1,3.15,z,'#73997e');}
  for(const x of [-5.78,7.78]){box(.1,.18,14.38,x,.16,3.5,'#73997e');box(.1,.12,14.38,x,3.15,3.5,'#73997e');}
  box(1,.7,.08,5.8,5.6,-3.76,'#f2ecd7');for(let y=5.35;y<5.9;y+=.09)box(.8,.025,.03,5.8,y,-3.69,'#6b8d80');
  for(let i=0;i<3;i++){box(.7,.12,.55,-4.7,1.43+i*.13,7.6,['#d0bd97','#93b6ab','#e8c8a1'][i]);}
  box(.065,.48,.4,7.74,1.6,3,'#a6b699');
  const lightDial=action(mesh(new THREE.CylinderGeometry(.14,.14,.095,16),'#c6b383',7.67,1.6,3),'lighting','Turn the daylight / sunset / moonlight selector');lightDial.rotation.z=Math.PI/2;
  const dialPointer=new THREE.Mesh(new THREE.BoxGeometry(.02,.1,.025),material('#42634d'));dialPointer.position.set(-.07,0,-.08);lightDial.add(dialPointer);
  const fanSwitch=action(mesh(new THREE.BoxGeometry(.24,.28,.13),'#7aa89c',6.3,1.65,-3.69),'fan','Switch the exhaust fan on / off');
  const fanRotor=new THREE.Group();fanRotor.position.set(5.8,5.6,-3.67);scene.add(fanRotor);
  for(let i=0;i<4;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.12,.28,.025),material('#96b5a8'));blade.position.set(Math.sin(i*Math.PI/2)*.22,Math.cos(i*Math.PI/2)*.22,.02);blade.rotation.z=-i*Math.PI/2;fanRotor.add(blade);}
  function plaque(text,w,h,x,y,z){
    const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=128;
    const context=labelCanvas.getContext('2d');context.fillStyle='#c0d1b2';context.fillRect(0,0,512,128);context.strokeStyle='#b89d70';context.lineWidth=8;context.strokeRect(6,6,500,116);context.fillStyle='#355f56';context.font='bold 33px Tahoma';context.textAlign='center';context.textBaseline='middle';context.fillText(text,256,64,470);
    const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
    const label=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:labelTexture}));label.position.set(x,y,z);scene.add(label);return label;
  }
  
  plaque('DAY / DUSK / NIGHT',.85,.16,7.665,1.97,3).rotation.y=-Math.PI/2;
  for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;mesh(new THREE.SphereGeometry(.018,6,4),['#d5d0a0','#ba916c','#728eaa'][i],7.687,1.6+Math.cos(angle)*.195,3+Math.sin(angle)*.195);}
  plaque('EXTRACTOR',.78,.2,6.3,2.03,-3.68);
  plaque('TRACE THE STEAM',1.2,.22,-3.65,4.56,-3.45);
  plaque('PASTE / BRUSH / MIST',1.6,.22,.3,6.12,-3.72);
  plaque('COLOR & NOZZLES',1.25,.14,-3.65,1.62,-1.84);
  // Four real shelf slots hold separate durable canvases, including the one currently hung.
  box(2.27,4.3,.1,4.65,2.15,5.2,'#477b6e');
  for(const x of [3.45,5.85])box(.12,4.3,.8,x,2.15,4.85,'#bea87d');
  const towelSlots=[];
  TOWELS.forEach((spec,i)=>{const y=.65+i*.85;box(2.4,.1,.8,4.65,y-.15,4.85,'#bea87d');
    const folded=action(mesh(new THREE.BoxGeometry(spec.width*.43,.24,.56),spec.color,4.65,y,4.32),'towel','Hang '+spec.name+' · store current artwork');folded.userData.towelId=spec.id;towelSlots.push(folded);
    plaque(spec.name.toUpperCase(),1.3,.16,4.65,y-.28,4.4).rotation.y=Math.PI;
  });plaque('TOWEL LIBRARY',1.8,.25,4.65,4.15,4.38).rotation.y=Math.PI;
  let towelTransition=0,activityUntil=0,walking=false,painting=false;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function setTowel(id){const spec=towelById(id)||TOWELS[0];towel.scale.set(spec.width/2.2,spec.height/2.75,1);towel.userData.height=spec.height;towel.position.y=renovation.rackHeight()-.1-spec.height/2;towelTransition=reducedMotion.matches?0:performance.now()+450;for(const slot of towelSlots)slot.visible=slot.userData.towelId!==spec.id;aimRevision++;renderer.shadowMap.needsUpdate=true;}
  function setActivity(moving,draw,now){walking=moving;painting=draw;if(moving||draw)activityUntil=now+160;}
  // Color is chosen at actual toothpaste tubes beside the washbasin.
  const palette=['#ef7066','#f5b44c','#589687','#658dcc','#9e7bb5','#ffffff'];
  palette.forEach((color,i)=>{const g=new THREE.Group(),x=-4.65+i*.3;const body=new THREE.Mesh(new THREE.CylinderGeometry(.07,.095,.48,8),material('#dfdfbd'));body.scale.z=.55;g.add(body);const band=new THREE.Mesh(new THREE.BoxGeometry(.145,.23,.014),material(color));band.position.set(0,.035,.058);g.add(band);const seam=new THREE.Mesh(new THREE.BoxGeometry(.18,.035,.045),material('#9da98c'));seam.position.y=.25;g.add(seam);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.1,10),material(color));cap.position.y=-.29;g.add(cap);mergeStatic(THREE,g,new Set());const target=g.children[0];action(target,'color','Load '+['coral','citrus','mint','blue','violet','plain'][i]+' toothpaste');target.userData.color=color;scene.add(g);g.position.set(x,1.93,-2.85);plaque('PASTE',.11,.045,x,1.985,-2.777);});
  const mixer=action(mesh(new THREE.BoxGeometry(.44,.12,.29),'#c0b284',-2.7,1.82,-2.6),'mix','Blend loaded paste with the soap-dish mint');
  // Wall-mounted rubber inserts leave the cabinet worktop clear for the camera.
  const patternTextures=STAMP_PATTERNS.map((pattern,i)=>{
    const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#d6d4ac';ctx.fillRect(0,0,96,96);ctx.fillStyle=ctx.strokeStyle='#426c58';ctx.translate(48,48);stampShape(ctx,pattern,30);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
    const pad=action(mesh(new THREE.BoxGeometry(.09,.32,.32),'#b2a273',7.81,2.15,6.08+i*.5),'stamp-pattern','Fit the '+pattern+' rubber insert · pick up the stamp first');pad.userData.pattern=pattern;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(.27,.27),new THREE.MeshLambertMaterial({map:texture}));face.rotation.y=-Math.PI/2;face.position.set(7.755,2.15,6.08+i*.5);scene.add(face);action(face,'stamp-pattern','Fit the '+pattern+' rubber insert · pick up the stamp first').userData.pattern=pattern;
    return texture;
  });
  plaque('RUBBER INSERTS',1.6,.22,7.72,2.65,6.82).rotation.y=-Math.PI/2;
  action(mesh(new THREE.BoxGeometry(.38,.09,.42),'#b8c6a0',6.35,1.45,6.2),'export-art','Save the last painted towel or roll as an unframed PNG');
  plaque('SAVE ART',.33,.12,6.35,1.53,5.985);
  action(mesh(new THREE.BoxGeometry(.07,.30,.38),'#496f5e',5.54,1.59,7.68),'label-station','Frame saved artwork onto your toothpaste label');
  box(.26,.055,.43,5.65,1.43,7.68,'#bdc79b');
  const labelIcon=mesh(new THREE.PlaneGeometry(.23,.24),'#ccd5b3',5.495,1.59,7.68);labelIcon.rotation.y=-Math.PI/2;action(labelIcon,'label-station','Crop and frame your artwork as a label');
  plaque('FRAME LABEL',.72,.14,5.48,1.82,7.68).rotation.y=-Math.PI/2;
  const stamp=tool('stamp',new THREE.CylinderGeometry(.16,.16,.09,12),'#ad9c61',7.4,1.5,1.32,'Pick up rubber-duck stamp');const duckHead=new THREE.Mesh(new THREE.SphereGeometry(.105,10,6),material('#cbbb68'));duckHead.position.y=.14;stamp.add(duckHead);const stampBeak=new THREE.Mesh(new THREE.BoxGeometry(.1,.035,.07),material('#b57e50'));stampBeak.position.set(0,.14,.1);stamp.add(stampBeak);for(const x of [-.085,.085]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.016,6,4),material('#2b4737'));eye.position.set(x,.17,.04);stamp.add(eye);}detailBatch(stamp);
  for(const [index,size]of [.012,.025,.055].entries()){
    const nozzle=action(mesh(new THREE.CylinderGeometry(.07+index*.025,.09+index*.025,.12,12),'#c5ab80',-2.72+index*.25,1.69,-2.35),'size','Fit a '+['fine','medium','wide'][index]+' nozzle');nozzle.userData.size=size;
  }

  // Period details: sage floral borders, brass towel hooks, ribbed blinds and laminate trim.
  for(let x=-5.5;x<7.8;x+=.5){box(.46,.22,.035,x,3.42,-3.85,'#6d8f70');box(.11,.11,.048,x,3.42,-3.82,'#b7ac7c',Math.PI/4);box(.46,.22,.035,x,3.42,10.85,'#6d8f70');}
  for(let z=-3.5;z<10.8;z+=.5){box(.035,.22,.46,-5.85,3.42,z,'#6d8f70');box(.035,.22,.46,7.85,3.42,z,'#6d8f70');}
  // Blinds are gathered above the glass, leaving the outdoor view unobstructed.
  for(let y=5.62;y<5.82;y+=.065)box(.055,.035,1.96,-5.51,y,-1,'#abc2a0');
  for(const z of [-1.82,-.18])box(.03,2.07,.03,-5.475,4.72,z,'#74896c');
  plaque('STUDIO 95',.8,.19,-2.1,5.05,-3.69);
  const practical=new THREE.PointLight('#ffe6ac',24,19,2);practical.position.set(0,5.35,0);scene.add(practical);
  const vanityLight=new THREE.PointLight('#fff0cf',12,9,2);vanityLight.position.set(-3.5,4,-2);scene.add(vanityLight);
  const windowLight=new THREE.PointLight('#d9efe6',20,17,2);windowLight.position.set(-5.2,4.4,-.8);scene.add(windowLight);
  // A cooler, darker mirror backing makes cleared condensation legible in bright rooms.
  const mirrorBacking=mesh(new THREE.PlaneGeometry(2.87,2.02),'#416467',-3.65,3.35,-3.49);
  mirrorBacking.material=new THREE.MeshBasicMaterial({color:'#416467'});
  const mirrorFog=mesh(new THREE.PlaneGeometry(2.87,2.02),'#d7e6dd',-3.65,3.35,-3.475);
  mirrorFog.material=new THREE.MeshBasicMaterial({map:fogTexture,transparent:true,opacity:0,depthWrite:false});
  const steamPositions=new Float32Array(96*3),steamSeeds=Array.from({length:96},(_,i)=>({x:Math.sin(i*37.1),z:Math.cos(i*17.7),phase:i/96}));
  const steamGeometry=new THREE.BufferGeometry();steamGeometry.setAttribute('position',new THREE.BufferAttribute(steamPositions,3));
  const mistCanvas=document.createElement('canvas');mistCanvas.width=64;mistCanvas.height=64;
  const mistContext=mistCanvas.getContext('2d'),gradient=mistContext.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,255,255,.45)');gradient.addColorStop(.45,'rgba(255,255,255,.2)');gradient.addColorStop(1,'rgba(255,255,255,0)');mistContext.fillStyle=gradient;mistContext.fillRect(0,0,64,64);
  const steam=new THREE.Points(steamGeometry,new THREE.PointsMaterial({map:new THREE.CanvasTexture(mistCanvas),size:1.7,transparent:true,opacity:0,depthWrite:false,color:'#edf6f1'}));steam.frustumCulled=false;scene.add(steam);
  const waterGeometry=new THREE.BufferGeometry(),waterPositions=new Float32Array(36*6);waterGeometry.setAttribute('position',new THREE.BufferAttribute(waterPositions,3));
  const water=new THREE.LineSegments(waterGeometry,new THREE.LineBasicMaterial({color:'#bce6ed',transparent:true,opacity:.7,depthWrite:false}));water.frustumCulled=false;scene.add(water);
  // A camera-mounted nozzle and tube shoulder anchor the player inside their avatar.
  const held=new THREE.Group();held.position.z=-.22;camera.add(held);scene.add(camera);
  const tubeBody=new THREE.Mesh(new THREE.CylinderGeometry(.11,.16,.48,12),material('#fff0d1'));tubeBody.rotation.x=-.85;tubeBody.position.set(.29,-.34,-.5);held.add(tubeBody);
  const tubeBand=new THREE.Mesh(new THREE.CylinderGeometry(.135,.155,.2,12),material('#ef7066'));tubeBand.rotation.x=-.85;tubeBand.position.set(.29,-.32,-.49);held.add(tubeBand);
  const nozzleMesh=new THREE.Mesh(new THREE.CylinderGeometry(.04,.075,.12,12),material('#dfd6ba'));nozzleMesh.rotation.x=-.85;nozzleMesh.position.set(.29,-.15,-.67);held.add(nozzleMesh);
  const heldTool=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.5),material('#bd7275'));heldTool.position.set(.3,-.27,-.65);heldTool.rotation.x=-.35;held.add(heldTool);heldTool.visible=false;
  const heldBristles=new THREE.Mesh(new THREE.BoxGeometry(.11,.065,.15),material('#f5ecd5'));heldBristles.position.set(0,.045,-.17);heldTool.add(heldBristles);
  const heldDuck=new THREE.Group();heldDuck.position.set(.3,-.3,-.68);held.add(heldDuck);const heldBase=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.06,10),material('#a99765'));heldDuck.add(heldBase);const heldHead=new THREE.Mesh(new THREE.SphereGeometry(.09,10,6),material('#cbbb68'));heldHead.position.y=.12;heldDuck.add(heldHead);const heldBeak=new THREE.Mesh(new THREE.BoxGeometry(.085,.035,.07),material('#b57e50'));heldBeak.position.set(0,.12,-.09);heldDuck.add(heldBeak);heldDuck.visible=false;
  const heldLabel=new THREE.Mesh(new THREE.PlaneGeometry(.16,.20),new THREE.MeshLambertMaterial({color:'#d3dab9'}));heldLabel.position.set(.29,-.189,-.375);heldLabel.rotation.x=-.85;held.add(heldLabel);
  const seamMesh=new THREE.Mesh(new THREE.BoxGeometry(.22,.025,.04),material('#567c62'));seamMesh.rotation.x=-.85;seamMesh.position.set(.29,-.52,-.32);held.add(seamMesh);
  const neckRing=new THREE.Mesh(new THREE.TorusGeometry(.055,.01,4,12),material('#6b9279'));neckRing.rotation.x=-2.42;neckRing.position.set(.29,-.15,-.675);held.add(neckRing);
  const localBody=new THREE.Group();scene.add(localBody);
  const ownBody=new THREE.Mesh(new THREE.CylinderGeometry(.26,.36,1.4,12),material('#fff0d1'));ownBody.position.y=.88;localBody.add(ownBody);
  const ownBand=new THREE.Mesh(new THREE.CylinderGeometry(.32,.355,.36,12),material('#ef7066'));ownBand.position.y=.95;localBody.add(ownBand);
  const ownCap=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.2,12),material('#de8c7d'));ownCap.position.y=.12;localBody.add(ownCap);localBody.visible=false;
  const heldInsert=new THREE.Mesh(new THREE.PlaneGeometry(.22,.22),new THREE.MeshBasicMaterial({map:patternTextures[0]}));heldInsert.position.set(0,.065,-.04);heldInsert.rotation.x=-Math.PI/3;heldDuck.add(heldInsert);
  function setStamp(pattern,turn=0){heldInsert.material.map=patternTextures[Math.max(0,STAMP_PATTERNS.indexOf(pattern))];heldInsert.rotation.z=-turn*Math.PI/2;heldHead.visible=heldBeak.visible=pattern==='duck';}
  function updateHeld(name,color){tubeBand.material=material(color);ownBand.material=material(color);tubeBody.visible=name==='squeeze';nozzleMesh.visible=name==='squeeze';tubeBand.visible=name==='squeeze';heldLabel.visible=seamMesh.visible=neckRing.visible=name==='squeeze';heldTool.visible=name!=='squeeze'&&name!=='stamp';heldDuck.visible=name==='stamp';heldBristles.visible=name==='brush';heldTool.material=material(name==='stamp'?'#cbbb68':name==='sponge'?'#e6c570':name==='spray'?'#728bab':'#bd7275');heldTool.scale.set(name==='sponge'?4:1,name==='spray'?4:name==='sponge'?2:1,name==='sponge'?.5:1);}

  // Batch all fixed rectangular props by material, keeping scene detail cheap.
  const renovation=buildRenovation(THREE,{scene,camera,material,box,action,plaque,towel,towelArtwork:paintTexture,paperTextures,printTextures});
  for(const [color,items]of batches){
    const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material(color),items.length);
    const transform=new THREE.Object3D();
    items.forEach((item,index)=>{transform.position.set(item.x,item.y,item.z);transform.scale.set(item.w,item.h,item.d);transform.rotation.y=item.rotation;transform.updateMatrix();batch.setMatrixAt(index,transform.matrix);});
    batch.castShadow=true;batch.receiveShadow=true;batch.instanceMatrix.needsUpdate=true;scene.add(batch);
  }
  const combinedProps=mergeStatic(THREE,scene,new Set([towel,mirrorFog,bulb,...renovation.dynamic]));
  const avatars=new Map(),labelTextures=new Map();
  function setAvatarLabel(id,source){let map=labelTextures.get(id);if(!map){map=new THREE.CanvasTexture(source);map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=false;map.minFilter=map.magFilter=THREE.LinearFilter;labelTextures.set(id,map);}else{map.image=source;map.needsUpdate=true;}const avatar=avatars.get(id);if(avatar){avatar.userData.label.material.map=map;avatar.userData.label.material.color.set('#ffffff');avatar.userData.label.material.needsUpdate=true;}if(id===localId){heldLabel.material.map=map;heldLabel.material.color.set('#ffffff');heldLabel.material.needsUpdate=true;}}

  let localId=null;
  function updatePlayers(players,me){
    localId=me;const ownMap=labelTextures.get(me)||null;if(heldLabel.material.map!==ownMap){heldLabel.material.map=ownMap;heldLabel.material.color.set(ownMap?'#ffffff':'#d3dab9');heldLabel.material.needsUpdate=true;}
    const online=new Set(players.filter(p=>p.online).map(p=>p.id));
    for(const [id,avatar]of avatars)if(!online.has(id)){scene.remove(avatar);avatar.traverse(m=>{m.geometry?.dispose();if(m.userData.ownMaterial)m.material?.dispose();});labelTextures.get(id)?.dispose();labelTextures.delete(id);avatars.delete(id);}
    players.forEach((p,index)=>{
      if(!p.online)return;
      if(avatars.has(p.id)){const existing=avatars.get(p.id);existing.visible=p.id!==me;if(p.pose)existing.userData.target=p.pose;return;}
      const color=['#de8c7d','#719b8c','#869fbb','#b398b5'][index%4],group=toothpasteAvatar(THREE,material,color);const map=labelTextures.get(p.id);if(map){group.userData.label.material.map=map;group.userData.label.material.color.set('#ffffff');}
      group.position.set(p.pose?.x??(-1.1+index*.85),0,p.pose?.z??-.5);group.visible=p.id!==me;group.userData.target=p.pose;scene.add(group);avatars.set(p.id,group);
    });
  }
  let fixtureShadowKey='';
  function updateFixtures(room){
    renovation.update(room,localId);
    held.visible=!Object.values(room.heldProps||{}).includes(localId);
    const mode=room.lighting||'day';
    lightDial.rotation.x=['day','evening','night'].indexOf(mode)*Math.PI*2/3;
    ambient.intensity=mode==='night'?.22:mode==='evening'?.55:1.15;
    sun.intensity=mode==='night'?.18:mode==='evening'?1.3:2.1;sun.color.set(mode==='night'?'#92b7ff':mode==='evening'?'#ffa775':'#fff3d5');
    sun.position.set(mode==='evening'?-5:-2,mode==='evening'?3:9,6);
    windowLight.color.set(mode==='night'?'#8dafff':mode==='evening'?'#ffa572':'#d9efe6');windowLight.intensity=mode==='night'?4:mode==='evening'?16:25;
    practical.intensity=room.lights?24:0;vanityLight.intensity=room.lights?12:0;bulb.material.emissiveIntensity=room.lights?1:0;
    switchObject.rotation.x=room.lights?-.15:.15;
    fanSwitch.rotation.x=room.environment?.fan?-.15:.15;
    for(const [name,object]of Object.entries(toolObjects))object.visible=!room.tools?.[name];
    const shadowKey=JSON.stringify([room.lighting,room.lights,room.tools]);
    if(shadowKey!==fixtureShadowKey){fixtureShadowKey=shadowKey;renderer.shadowMap.needsUpdate=true;}
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),blockPoint=new THREE.Vector3();
  const targets=[towel,mirrorFog,...interactive],visibleTargets=[];
  // Coarse solid volumes avoid ray-testing hundreds of decorative tiles and triangles.
  const blockers=[...renovation.bounds(),[-3.49,0,.21,-2.91,.8,.79],[3.4,0,5.1,5.9,4.3,5.3],[-5.5,0,1.75,-3.1,1.2,3.05],[-5.5,0,6.4,-4.48,1.4,9.1],[5.82,0,5.8,7.6,1.4,8.2],[-5.5,0,9.1,-4.48,1.5,10.7],[-6.1,0,-4.1,8.1,7,-3.8],[-6.1,0,10.85,8.1,7,11.1],[-6.1,0,-4,-5.85,7,11],[7.85,0,-4,8.1,7,11],[-6,-.2,-4,8,0,11],[-6,6.7,-4,8,7,11]].map(([x,y,z,a,b,c])=>new THREE.Box3(new THREE.Vector3(x,y,z),new THREE.Vector3(a,b,c)));
  let aimCache=null,aimRevision=0,cachedRevision=-1;
  const aimPose=new Float64Array(6);let cachedAspect=0,aimChecks=0;
  function cast(event){
    const p=camera.position,r=camera.rotation;
    if(!event&&cachedRevision===aimRevision&&cachedAspect===camera.aspect&&aimPose[0]===p.x&&aimPose[1]===p.y&&aimPose[2]===p.z&&aimPose[3]===r.x&&aimPose[4]===r.y&&aimPose[5]===r.z)return aimCache;
    if(event){const bounds=canvas.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);}else pointer.set(0,0);
    camera.updateMatrixWorld();ray.setFromCamera(pointer,camera);ray.far=3.5;
    visibleTargets.length=0;for(const object of targets)if(object.visible){let parent=object.parent,visible=true;while(parent){if(!parent.visible){visible=false;break;}parent=parent.parent;}if(visible){object.updateWorldMatrix(true,false);visibleTargets.push(object);}}
    let hit=ray.intersectObjects(visibleTargets,false)[0];aimChecks++;
    if(hit)for(const blocker of blockers){if(ray.ray.intersectBox(blocker,blockPoint)&&blockPoint.distanceTo(p)<hit.distance-.02){hit=null;break;}}
    if(!event){aimPose.set([p.x,p.y,p.z,r.x,r.y,r.z]);cachedRevision=aimRevision;cachedAspect=camera.aspect;aimCache=hit;}
    return hit;
  }
  const viewProjection=new THREE.Matrix4(),viewFrustum=new THREE.Frustum();
  function surfaceVisible(surface){camera.updateMatrixWorld();viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);viewFrustum.setFromProjectionMatrix(viewProjection);const object=renovation.paperMeshes[surface]||(surface==='mirror'?mirrorFog:towel);if(renovation.paperCarried(surface))return true;for(let ancestor=object;ancestor;ancestor=ancestor.parent)if(!ancestor.visible)return false;return viewFrustum.intersectsObject(object);}
  function updatePose(id,pose){const avatar=avatars.get(id);if(avatar&&id!==localId)avatar.userData.target=pose;}
  let lastHumidity=-1,lastEffect=0,effectsActive=false;
  function animate(dt,time,room,serverNow,quality='fast'){
    let changed=renovation.animate(dt,time*1000,serverNow);if(changed)aimRevision++;
    camera.getWorldDirection(windowDirection);windowTo.copy(skyWindow.position).sub(camera.position).normalize();const skyVisible=camera.position.z<5.5&&windowDirection.dot(windowTo)>.15,mode=room?.lighting||'day';if(mode!==skyKey||skyVisible&&time-skyTick>=(quality==='mobile'?4:2)){skyPicture(skyContext,mode,time,serverNow);skyTexture.needsUpdate=true;skyKey=mode;skyTick=time;changed=true;}
    if(!reducedMotion.matches){const active=time*1000<activityUntil;
      const target=active?Math.sin(time*(painting?23:10))*(painting?.018:.012):0;
      if(Math.abs(held.position.y-target)>.001){held.position.y=target;changed=true;}
      if(towelTransition>time*1000){const progress=1-(towelTransition-time*1000)/450;towel.rotation.x=Math.sin(progress*Math.PI)*.09;aimRevision++;changed=true;}else if(towel.rotation.x){towel.rotation.x=0;aimRevision++;changed=true;}
    }
    localBody.visible=false;localBody.position.set(camera.position.x,camera.position.y-2.15,camera.position.z);localBody.rotation.y=camera.rotation.y;
    for(const avatar of avatars.values()){const p=avatar.userData.target;if(!p||!avatar.visible)continue;const blend=1-Math.exp(-dt*14);if(Math.hypot(avatar.position.x-p.x,avatar.position.z-p.z)>.002){avatar.position.x+=(p.x-avatar.position.x)*blend;avatar.position.z+=(p.z-avatar.position.z)*blend;changed=true;}avatar.rotation.y=p.yaw;const y=feetHeight(p,room.furnishings);avatar.userData.targetY=y;if(Math.abs(avatar.position.y-y)>.002){avatar.position.y+=(y-avatar.position.y)*blend;changed=true;}}
    const humidity=room?.environment?humidityAt(room.environment,serverNow):0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const profile=QUALITY[quality]||QUALITY.fast;
    const nearby=camera.position.z<5.8;
    const effectDue=time-lastEffect>=1/profile.effectHz;
    effectsActive=Boolean(skyVisible||room?.environment?.shower&&nearby||!reduced&&profile.steam&&(humidity>.025&&nearby||room?.environment?.fan));
    if(room?.environment?.fan&&!reduced&&profile.steam&&effectDue){fanRotor.rotation.z=time*9;changed=true;}
    steam.visible=humidity>.025&&profile.steam>0&&!reduced&&nearby;water.visible=Boolean(room?.environment?.shower)&&profile.water>0&&nearby;
    steamGeometry.setDrawRange(0,profile.steam);waterGeometry.setDrawRange(0,profile.water*2);
    if(Math.abs(humidity-lastHumidity)>.002){mirrorFog.material.opacity=humidity*.88;scene.fog.near=22-humidity*10;scene.fog.far=38-humidity*12;lastHumidity=humidity;changed=true;}
    if(steam.visible&&effectDue){steam.material.opacity=humidity*.5;for(let i=0;i<profile.steam;i++){const seed=steamSeeds[i],phase=(seed.phase+time*.075)%1;const mirror=i%3===0;steamPositions[i*3]=(mirror?-3.65:5.6)+seed.x*(.4+phase*.8)+Math.sin(time*.4+i)*.2;steamPositions[i*3+1]=(mirror?1.9:1)+phase*3.8;steamPositions[i*3+2]=(mirror?-2.95:-1.9)+seed.z*.5;}steamGeometry.attributes.position.needsUpdate=true;changed=true;}
    if(water.visible&&effectDue){showerStreaks(waterPositions,profile.water,time*(reduced?.35:1));waterGeometry.attributes.position.needsUpdate=true;water.userData.active=true;changed=true;}
    if(!water.visible)water.userData.active=false;if(effectDue)lastEffect=time;
    return changed;
  }
  const originalFixtures=updateFixtures;
  return {scene,camera,renderer,towel,react:renovation.react,placementPoint:()=>{camera.updateMatrixWorld();ray.setFromCamera(new THREE.Vector2(0,0),camera);const hit=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());return hit&&hit.distanceTo(camera.position)<4?{x:hit.x,z:hit.z}:null;},setTowel,setActivity,updatePlayers,setAvatarLabel,updateFixtures:room=>{originalFixtures(room);towel.visible=room.laundry?.phase==='ready';aimRevision++;},updateHeld,setStamp,updatePose,animate,surfaceVisible,
    setLaundryMotion:value=>renovation.setLaundryMotion(value),
    setQuality:quality=>{vanityLight.visible=quality!=='fast'&&quality!=='mobile';renderer.shadowMap.enabled=Boolean(QUALITY[quality]?.shadows);renderer.shadowMap.needsUpdate=true;},
    hasMotion:()=>renovation.hasMotion()||towelTransition>performance.now()||Math.abs(held.position.y)>.001||[...avatars.values()].some(avatar=>avatar.visible&&avatar.userData.target&&Math.hypot(avatar.position.x-avatar.userData.target.x,avatar.position.z-avatar.userData.target.z,avatar.position.y-(avatar.userData.targetY||0))>.002),
    effectsActive:()=>effectsActive||renovation.effectsActive(),diagnostics:()=>({combinedProps,aimChecks}),
    paintHit:event=>{const hit=cast(event);return hit?.object===towel?{surface:'towel',point:[hit.uv.x,1-hit.uv.y]}:hit?.object===mirrorFog?{surface:'mirror',point:[hit.uv.x,1-hit.uv.y]}:hit?.object.userData.surface?{surface:hit.object.userData.surface,point:[hit.uv.x,1-hit.uv.y]}:null;},
    paintPoint:event=>{const hit=cast(event);return hit?.object===towel?[hit.uv.x,1-hit.uv.y]:null;},
    interact:event=>{const hit=cast(event);if(hit?.object.userData.action==='paper-prop')return{...hit.object.userData,action:'prop',label:'Carry this roll · hold Paint to decorate'};if(hit?.object.userData.action==='stool')return {...hit.object.userData,action:hit.face?.normal.y>.5&&Math.hypot(camera.position.x-renovation.stool.position.x,camera.position.z-renovation.stool.position.z)<=1.65?'climb':'prop',prop:'stool',label:hit.face?.normal.y>.5&&Math.hypot(camera.position.x-renovation.stool.position.x,camera.position.z-renovation.stool.position.z)<=1.65?'Climb onto the stool':'Carry the stool'};return hit?.object.userData.action?hit.object.userData:null;}
  };
}
