import {mergeStatic} from './performance.js';
import {PAPER_IDS,PAPER_RADIUS,PAPER_HEIGHT,propLocation} from './paper.js';
import{CAMERA_POSITION}from'./gallery.js';
import{laundryPose}from'./laundry-visual.js';
import {SLOTS,slotById,floorHeight,feetHeight,STOOL_TOP} from './furnishings.js';

export function buildRenovation(THREE,{scene,camera,material,box,action,plaque,towel,towelArtwork,paperTextures={},printTextures=[]}){
  const dynamic=[],doors=[],drawers=[],drawerContents=[],items={},slots=[],carry=new THREE.Group();camera.add(carry);
  let clockSecond=-1;const clockDirection=new THREE.Vector3(),clockTo=new THREE.Vector3();
  let state=null,me=null,rackY=5.08,curtainAmount=0,motion=false,pulseUntil=0,lastTick=0,flushAt=0,paperUntil=0,laundryMotion=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function part(g,geometry,color,x=0,y=0,z=0){const mesh=new THREE.Mesh(geometry,material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;}
  const block=(g,w,h,d,x,y,z,color)=>part(g,new THREE.BoxGeometry(w,h,d),color,x,y,z);
  function finish(g,id,label,data={}){mergeStatic(THREE,g,new Set());const target=g.children.find(child=>child.isMesh);if(id){action(target,id,label);Object.assign(target.userData,data);}scene.add(g);dynamic.push(g);return g;}
  // A hollow vanity: doors and contents have real space rather than a solid cube.
  box(.11,1.35,1.55,-5.2,.72,-2.8,'#477b6e');box(.11,1.35,1.55,-2.1,.72,-2.8,'#477b6e');
  box(3.2,1.35,.11,-3.65,.72,-3.53,'#315e50');box(3.1,.1,1.48,-3.65,.17,-2.8,'#547f6b');box(.1,1.3,1.5,-3.65,.73,-2.8,'#477b6e');
  box(2.9,.08,1.36,-3.65,.78,-2.79,'#547f6b');
  const drain=new THREE.Group();part(drain,new THREE.CylinderGeometry(.075,.075,.42,8),'#9ab2a4',0,1.18,0);block(drain,.1,.12,.5,0,.99,.18,'#9ab2a4');finish(drain);drain.position.set(-3.65,0,-3.1);
  for(const [index,hinge]of [-5.15,-2.15].entries()){
    const side=index===0?1:-1,g=new THREE.Group();block(g,1.42,1.1,.09,side*.71,0,0,'#588c79');block(g,.28,.07,.095,side*1.18,.28,.085,'#a5b78a');
    for(let x=.12;x<1.34;x+=.18)block(g,.018,1.02,.014,side*x,0,.055,'#8ead86');
    finish(g,'cabinet','Swing this cabinet door',{index});g.position.set(hinge,.76,-1.94);doors.push(g);
    for(const y of [.35,1.15])box(.1,.11,.08,hinge,y,-1.97,'#7c998a');
  }
  for(const id of ['jar','cloth']){
    const g=new THREE.Group();if(id==='jar'){part(g,new THREE.CylinderGeometry(.11,.12,.3,10),'#648f82');part(g,new THREE.CylinderGeometry(.12,.12,.07,10),'#a4baa0',0,.18,0);block(g,.17,.13,.01,0,.015,.116,'#d2ddbe');}
    else{block(g,.4,.16,.32,0,-.1,0,'#99b99b');block(g,.33,.045,.29,.015,-.005,0,'#bdcdaa');}
    finish(g,'prop','Carry the '+(id==='jar'?'supply jar':'folded washcloth'),{prop:id});items[id]=g;
  }
  for(const x of [-4.75,-2.3]){box(.48,.26,.45,x,1.71,-2.1,'#527861');box(.52,.035,.48,x,1.857,-2.1,'#b8c4a0');}
  const paperMeshes={};
  for(const id of PAPER_IDS){const g=new THREE.Group();const side=new THREE.Mesh(new THREE.CylinderGeometry(PAPER_RADIUS,PAPER_RADIUS,PAPER_HEIGHT,20,1,true),new THREE.MeshLambertMaterial({...(paperTextures[id]?{map:paperTextures[id]}:{}),color:'#ffffff'}));action(side,'paper-prop','Paint this spare roll · E to carry');side.userData.surface=id;side.userData.prop=id;g.add(side);const inner=part(g,new THREE.CylinderGeometry(.065,.065,PAPER_HEIGHT+.002,12,1,true),'#947b54');inner.material=new THREE.MeshLambertMaterial({color:'#947b54',side:THREE.DoubleSide});for(const sign of [-1,1]){const end=part(g,new THREE.RingGeometry(.066,PAPER_RADIUS,20),'#dedcc1',0,sign*PAPER_HEIGHT/2,0);end.rotation.x=sign===1?-Math.PI/2:Math.PI/2;}const details=new THREE.Group();for(const object of [...g.children])if(object!==side){g.remove(object);details.add(object);}mergeStatic(THREE,details,new Set());for(const mesh of details.children){action(mesh,'paper-prop','Carry this spare roll');mesh.userData.prop=id;}g.add(details);scene.add(g);dynamic.push(g);items[id]=g;paperMeshes[id]=side;}
  for(const slot of SLOTS){const g=new THREE.Group();part(g,new THREE.CylinderGeometry(.15,.15,.015,12),'#72ae96');finish(g,'slot','Place carried item here',{slot:slot.id});g.position.set(slot.x,slot.y-.17,slot.z);slots.push(g);}
  const stool=new THREE.Group();block(stool,1,.13,1,0,.845,0,'#6a9376');block(stool,.9,.012,.9,0,.914,0,'#afc7a3');
  for(const x of [-.38,.38])for(const z of [-.38,.38])block(stool,.12,.8,.12,x,.4,z,'#406b58');
  block(stool,.85,.08,.28,0,.36,.4,'#82aa87');finish(stool,'stool','Use top to climb · use side to carry');
  // Adjustable rail is a single movable batch, separate from its wall-mounted guides.
  const rail=new THREE.Group();block(rail,3.6,.075,.075,.3,0,-3.45,'#789a85');
  for(const x of [-1.35,1.95]){block(rail,.13,.25,.2,x,-.12,-3.48,'#789a85');box(.075,3.8,.08,x,3.85,-3.67,'#557967');}
  finish(rail);rail.position.y=rackY;
  for(const [i,delta]of [.25,-.25].entries()){const g=new THREE.Group();block(g,.23,.23,.1,0,0,0,'#7ba78e');finish(g,'rack',delta>0?'Raise towel rail':'Lower towel rail',{delta});g.position.set(2.15,2.3-i*.36,-3.59);plaque(delta>0?'↑':'↓',.16,.14,2.15,2.3-i*.36,-3.525);}
  plaque('RAIL HEIGHT',.58,.16,2.15,2.64,-3.55);
  // Full corner shower, supported pipes and a curtain that gathers onto its rail.
  box(5.18,.22,3.5,5.17,.12,-2,'#749e8a');box(5.18,.09,.13,5.17,.28,-.29,'#a9c5a7');
  box(.13,.09,3.5,2.58,.28,-2,'#a9c5a7');box(.13,.09,3.5,7.7,.28,-2,'#a9c5a7');
  box(.08,4.8,3.5,2.45,2.63,-2,'#8faf9a');box(.1,.1,3.6,2.45,5.08,-2,'#527b65');
  box(5.24,.08,.08,5.15,4.98,-.22,'#527b65');
  box(.09,4.85,.09,2.55,2.63,-.22,'#527b65');
  const curtain=new THREE.InstancedMesh(new THREE.BoxGeometry(.31,4.15,.04),material('#ffffff'),15),matrix=new THREE.Object3D();
  for(let i=0;i<15;i++)curtain.setColorAt(i,new THREE.Color(i%3?'#a8c4a8':'#729b86'));curtain.instanceMatrix.setUsage(THREE.DynamicDrawUsage);action(curtain,'curtain','Slide the shower curtain');scene.add(curtain);dynamic.push(curtain);
  const rings=new THREE.InstancedMesh(new THREE.TorusGeometry(.075,.018,4,8),material('#9fb69c'),15);
  scene.add(rings);dynamic.push(rings);rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);rings.userData.action='decoration';
  function poseCurtain(){for(let i=0;i<15;i++){matrix.position.set(2.76+i*(.333*(1-curtainAmount)+.045*curtainAmount),2.78,-.2+(i%2)*.032);matrix.rotation.set(0,0,0);matrix.scale.set(1-.86*curtainAmount,1,1);matrix.updateMatrix();curtain.setMatrixAt(i,matrix.matrix);matrix.position.y=4.93;matrix.rotation.y=Math.PI/2;matrix.scale.set(1,1,1);matrix.updateMatrix();rings.setMatrixAt(i,matrix.matrix);}curtain.instanceMatrix.needsUpdate=true;rings.instanceMatrix.needsUpdate=true;curtain.computeBoundingSphere();rings.computeBoundingSphere();}
  poseCurtain();
  const curtainHandle=new THREE.Group();block(curtainHandle,.18,.4,.12,0,0,0,'#88ad92');finish(curtainHandle,'curtain','Slide the shower curtain');curtainHandle.position.set(2.55,1.9,-.1);
  const pipe=new THREE.Group();part(pipe,new THREE.CylinderGeometry(.065,.065,4.85,10),'#94b2a1',7.64,2.63,-.22);
  const arm=part(pipe,new THREE.CylinderGeometry(.065,.065,1.08,10),'#94b2a1',7.64,4.45,-.76);arm.rotation.x=Math.PI/2;
  const cross=part(pipe,new THREE.CylinderGeometry(.065,.065,.78,10),'#94b2a1',7.26,4.45,-1.3);cross.rotation.z=Math.PI/2;
  part(pipe,new THREE.CylinderGeometry(.3,.3,.08,12),'#b2c6ac',6.9,4.39,-1.3);finish(pipe);
  box(.32,.4,.12,7.64,1.6,-.21,'#466e5c');
  const valve=new THREE.Group();const dial=part(valve,new THREE.CylinderGeometry(.13,.13,.1,12),'#c79b6d');dial.rotation.x=Math.PI/2;block(valve,.035,.2,.12,0,0,.025,'#577c68');finish(valve,'shower','Turn the hot shower on / off');valve.position.set(7.64,1.6,-.1);
  plaque('HOT WATER',.72,.18,7.54,1.16,-.045);
  box(2.6,.1,.38,5.5,1.14,-3.53,'#527b65');for(let i=0;i<3;i++){const g=new THREE.Group();part(g,new THREE.CylinderGeometry(.1,.12,.38,10),['#82a893','#5c8790','#a1bd83'][i],0,.22,0);part(g,new THREE.CylinderGeometry(.055,.055,.08,10),'#406b58',0,.45,0);finish(g);g.position.set(4.7+i*.6,1.16,-3.5);}
  const drainDisk=new THREE.Group();part(drainDisk,new THREE.CylinderGeometry(.14,.14,.02,12),'#466e5c');finish(drainDisk);drainDisk.position.set(6.5,.24,-1.3);
  const duck=new THREE.Group();const body=part(duck,new THREE.SphereGeometry(1,10,6),'#c6b871');body.scale.set(.22,.16,.28);const head=part(duck,new THREE.SphereGeometry(.14,10,6),'#c6b871',0,.2,-.06);block(duck,.14,.05,.1,0,.2,-.2,'#bd8760');for(const x of [-.115,.115])part(duck,new THREE.SphereGeometry(.023,6,4),'#263b30',x,.235,-.1);const wing=part(duck,new THREE.SphereGeometry(1,8,5),'#ae9f59',.17,.03,.03);wing.scale.set(.065,.08,.16);finish(duck,'duck','Squeeze the rubber duck');duck.position.set(6.3,.47,-2.8);
  // A broad opening makes the utility room feel connected while giving both rooms a purpose.
  const instantCamera=new THREE.Group();block(instantCamera,.64,.32,.3,0,0,0,'#b8c8a2');block(instantCamera,.62,.12,.33,0,-.17,.01,'#527a65');block(instantCamera,.26,.12,.02,.15,.06,.163,'#315a48');block(instantCamera,.16,.08,.018,-.2,.07,.165,'#d8cf9e');const lens=part(instantCamera,new THREE.CylinderGeometry(.11,.11,.09,12),'#355e50',-.12,-.02,.2);lens.rotation.x=Math.PI/2;const glassLens=part(instantCamera,new THREE.CircleGeometry(.075,12),'#749e98',-.12,-.02,.25);block(instantCamera,.45,.026,.02,0,-.19,.19,'#253f35');finish(instantCamera,'camera','Print your last painted surface · alternate between two frames');instantCamera.position.set(CAMERA_POSITION.x,CAMERA_POSITION.y,CAMERA_POSITION.z);instantCamera.rotation.y=-Math.PI/2;
  plaque('INSTANT ART / 95',1.1,.17,5.61,1.48,7).rotation.y=-Math.PI/2;
  for(let slot=0;slot<2;slot++){const x=slot?-2.6:-4.7,y=slot?5:3.65;box(1.8,1.55,.09,x,y,5.44,'#416e59');const print=new THREE.Mesh(new THREE.PlaneGeometry(1.65,1.32),new THREE.MeshLambertMaterial({...(printTextures[slot]?{map:printTextures[slot]}:{}),color:'#ffffff'}));print.position.set(x,y,5.388);print.rotation.y=Math.PI;action(print,'print','Save this framed print as PNG');print.userData.slot=slot;scene.add(print);dynamic.push(print);}
  box(5.1,6.85,.22,-3.45,3.4,5.65,'#668d77');box(6.5,6.85,.22,4.75,3.4,5.65,'#668d77');box(2.4,2.5,.22,.3,5.58,5.65,'#668d77');
  for(const x of [-.93,1.53])box(.13,4.3,.35,x,2.15,5.65,'#416f5b');box(2.6,.14,.35,.3,4.32,5.65,'#416f5b');
  box(2.4,.025,.44,.3,.04,5.65,'#90b192');plaque('UTILITY / LAUNDRY',1.9,.25,.3,4.03,5.48).rotation.y=Math.PI;
  plaque('BATH & STUDIO',1.9,.25,.3,4.03,5.82);
  for(let x=-5.4;x<7.5;x+=.5)if(x<-.9||x>1.5){box(.46,1.35,.04,x,.82,5.51,'#a1bfa4');box(.46,1.35,.04,x,.82,5.8,'#527763');}
  box(1.5,.08,.36,-3,2.3,5.43,'#416f5b');for(const x of [-3.5,-3,-2.5])box(.07,.14,.2,x,2.1,5.38,'#9eb79b');
  box(.62,1.05,.055,-3,1.63,5.34,'#81a489');
  const clock=new THREE.Group();const face=part(clock,new THREE.CylinderGeometry(.37,.37,.06,20),'#b4cba9');face.rotation.x=Math.PI/2;for(let i=0;i<12;i++){const a=i*Math.PI/6,tick=block(clock,.025,.065,.015,Math.sin(a)*.29,Math.cos(a)*.29,-.045,'#406b58');tick.rotation.z=-a;}finish(clock);clock.position.set(-2.6,3.65,5.46);
  const clockHands=[];for(const [index,length]of [.17,.26,.29].entries()){const pivot=new THREE.Group();block(pivot,index===2?.012:.025,length,.016,0,length/2,0,index===2?'#9f654c':'#305544');finish(pivot);pivot.position.set(-2.6,3.65,5.405-index*.02);pivot.userData.clockHand=index;clockHands.push(pivot);}
  box(2.2,1.55,.05,4.7,2.95,5.84,'#799c79');for(let x=3.85;x<5.6;x+=.22)for(let y=2.4;y<3.7;y+=.22)box(.025,.025,.015,x,y,5.88,'#406b58');
  box(.08,2,.08,4.4,1.3,5.96,'#416f5b');box(.55,.3,.2,4.4,.35,5.96,'#98b98b');box(.35,.8,.1,5.2,2.7,5.97,'#adc39d');
  plaque('WASH 20s · DRY 20s',1.9,.25,4.7,4.15,5.83);
  // 1990s machine control strips and labeled push buttons.
  for(const z of [7.7,9.9]){box(.035,.23,1.43,-3.845,1.21,z,'#d0c9a0');for(let i=0;i<2;i++){const dial=new THREE.Group();const knob=part(dial,new THREE.CylinderGeometry(.048,.048,.025,10),'#49705e');knob.rotation.z=Math.PI/2;finish(dial);dial.position.set(-3.815,1.23,z+.17+i*.35);}}
  // Utility-room dryer, ironing board and a dedicated light.
  const drums=[],bundles=[];
  for(const [index,z]of [7.7,9.9].entries()){
    const machine=index?'dryer':'washer',load=machine+'-load',label=index?'Load the wet towel into the dryer':'Load hanging towel · after washing, collect wet towel';
    // Separate panels leave a genuine opening instead of a solid body behind a fake window.
    box(.09,1.3,1.65,-5.36,.69,z,'#729b87');box(1.5,1.3,.09,-4.65,.69,z-.79,'#729b87');box(1.5,1.3,.09,-4.65,.69,z+.79,'#729b87');box(1.58,.1,1.7,-4.65,1.39,z,'#a5bea0');box(1.5,.1,1.6,-4.65,.1,z,'#729b87');
    const front=new THREE.Shape();front.moveTo(-.8,-.44);front.lineTo(.8,-.44);front.lineTo(.8,.44);front.lineTo(-.8,.44);front.closePath();const opening=new THREE.Path();opening.absarc(0,0,.395,0,Math.PI*2,true);front.holes.push(opening);
    const panel=new THREE.Mesh(new THREE.ShapeGeometry(front,28),material('#abc0a0'));panel.rotation.y=Math.PI/2;panel.position.set(-3.89,.73,z);scene.add(panel);dynamic.push(panel);box(.07,.23,1.6,-3.89,1.285,z,'#abc0a0');box(.07,.23,1.6,-3.89,.175,z,'#abc0a0');
    const rim=new THREE.Group();const ring=part(rim,new THREE.TorusGeometry(.435,.058,8,28),'#b2c6b0');ring.rotation.y=Math.PI/2;
    block(rim,.025,.18,.065,.062,.02,-.43,'#d0c9a0');finish(rim,load,label);rim.position.set(-3.84,.73,z);
    const interior=new THREE.Group();const barrel=part(interior,new THREE.CylinderGeometry(.385,.385,.52,24,1,true),'#88a89e');barrel.rotation.z=-Math.PI/2;barrel.material=new THREE.MeshLambertMaterial({color:'#88a89e',side:THREE.BackSide});
    const back=part(interior,new THREE.CircleGeometry(.385,24),'#54766c',-.265,0,0);back.rotation.y=Math.PI/2;
    for(let i=0;i<24;i++){const a=i*Math.PI/12;const hole=part(interior,new THREE.CircleGeometry(.012,5),'#46695d',-.26,Math.sin(a)*.29,Math.cos(a)*.29);hole.rotation.y=Math.PI/2;}
    // Keep the inward-facing shell material; batching would discard its sidedness.
    interior.traverse(o=>{if(o.isMesh)action(o,load,label);});scene.add(interior);dynamic.push(interior);interior.position.set(-4.13,.73,z);
    const drum=new THREE.Group();for(let i=0;i<3;i++){const a=i*Math.PI*2/3,fin=block(drum,.42,.04,.09,0,Math.sin(a)*.33,Math.cos(a)*.33,'#b3c3aa');fin.rotation.x=-a;}finish(drum);drum.position.set(-4.13,.73,z);drums.push(drum);
    const bundle=new THREE.Group();const fabric=new THREE.PlaneGeometry(.40,.36,6,6),p=fabric.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.025*Math.sin(p.getX(i)*35));fabric.computeVertexNormals();
    const cloth=new THREE.Mesh(fabric,new THREE.MeshLambertMaterial({...(towelArtwork?{map:towelArtwork}:{}),color:'#ffffff',side:THREE.DoubleSide}));cloth.rotation.y=Math.PI/2;bundle.add(cloth);action(cloth,load,label);scene.add(bundle);dynamic.push(bundle);bundle.position.set(-4.04,.73,z);bundles.push(bundle);
    plaque(index?'DRY / 20s':'WASH / 20s',.48,.12,-3.794,1.22,z+(index?.49:-.49)).rotation.y=Math.PI/2;
  }
  const dryerButton=new THREE.Group();block(dryerButton,.035,.16,.18,0,0,0,'#91b49c');finish(dryerButton,'dryer-start','Start the loaded dryer · 20 seconds');dryerButton.position.set(-3.80,1.18,9.45);
  box(2.1,.1,.7,4.1,1.28,9.5,'#95b795');for(const side of [-1,1])box(.085,1.35,.085,4.1+side*.55,.63,9.5,'#527b65',side*.3);
  box(.4,.2,.22,4.7,1.43,9.5,'#577f71');plaque('TOWEL CARE',1.2,.2,-4.65,2.15,10.77).rotation.y=Math.PI;
  const utilityLight=new THREE.PointLight('#cde8c5',9,10,2);utilityLight.position.set(.3,4.9,8.4);scene.add(utilityLight);box(1.1,.1,.4,.3,5.1,8.4,'#b8ceb0');box(.065,1.64,.065,.3,5.97,8.4,'#527763');box(.3,.055,.3,.3,6.81,8.4,'#527763');box(.93,.055,.3,.3,5.015,8.4,'#d7dcbb');
  const washerButton=new THREE.Group();block(washerButton,.035,.16,.18,0,0,0,'#91b49c');finish(washerButton,'washer-start','Start the loaded washer · 20 seconds');washerButton.position.set(-3.80,1.18,7.65);
  for(const button of [washerButton,dryerButton])button.children[0].material=button.children[0].material.clone();
  const laundryCarry=new THREE.Group();block(laundryCarry,.5,.19,.4,0,0,0,'#a5c5ac');block(laundryCarry,.45,.04,.37,0,.12,0,'#d1d5b1');mergeStatic(THREE,laundryCarry,new Set());laundryCarry.position.set(-.28,-.38,-.85);camera.add(laundryCarry);
  for(let i=0;i<3;i++){
    const g=new THREE.Group(),y=1.12-i*.34;block(g,.07,.28,1.84,0,0,0,'#588c79');block(g,.075,.06,.4,-.065,.02,0,'#d9be80');block(g,1.6,.04,1.68,.81,-.12,0,'#b3b99b');for(const z of [-.84,.84])block(g,1.6,.22,.035,.81,-.01,z,'#638b70');block(g,.035,.22,1.68,1.59,-.01,0,'#638b70');finish(g,'drawer','Open / close '+['tape','pigment','postcard'][i]+' drawer',{index:i});g.position.set(5.72,y,7);drawers.push(g);
    const contents=new THREE.Group();g.add(contents);drawerContents.push(contents);
    if(i===0){block(contents,.43,.09,.25,.38,-.035,0,'#344e42');block(contents,.22,.013,.12,.38,.02,0,'#b6c7a4');for(const z of [-.07,.07])part(contents,new THREE.CylinderGeometry(.035,.035,.02,8),'#7d9d88',.38,.035,z);}
    if(i===1)for(const [j,color]of ['#b1d1c2','#d3b5c7','#d3ce97'].entries()){const jar=new THREE.Group();contents.add(jar);part(jar,new THREE.CylinderGeometry(.075,.075,.16,10),color,.4,-.015,-.5+j*.5);part(jar,new THREE.CylinderGeometry(.08,.08,.04,10),'#637f68',.4,.075,-.5+j*.5);mergeStatic(THREE,jar,new Set());action(jar.children[0],'color','Load '+['sage','lavender','ochre'][j]+' pastel pigment');jar.children[0].userData.color=color;}
    if(i===2){block(contents,.48,.06,.65,.38,-.07,0,'#d3d3b0');block(contents,.43,.015,.60,.38,-.025,0,'#7ba18b');}
    if(i!==1)mergeStatic(THREE,contents,new Set());for(const mesh of contents.children)if(mesh.isMesh){action(mesh,i===0?'vhs-tape':i===1?'color':'prompt',i===0?'Play / stop the VHS atmosphere':i===1?'Load pastel sage pigment':'Read a creative studio postcard');if(i===1)mesh.userData.color='#b1d1c2';}dynamic.push(contents);
  }
  // Roll sits on a wall bracket with a visible axle; the loose sheet moves on use.
  box(.08,.3,.65,-5.76,1.4,3.45,'#5e8571');for(const z of [3.17,3.73])box(.35,.07,.07,-5.58,1.4,z,'#99b39a');
  const paper=new THREE.Group();const axle=part(paper,new THREE.CylinderGeometry(.035,.035,.6,10),'#718f7c');axle.rotation.x=Math.PI/2;
  const roll=part(paper,new THREE.CylinderGeometry(.16,.16,.42,12),'#bcccaa');roll.rotation.x=Math.PI/2;finish(paper,'paper','Pull the toilet paper');paper.position.set(-5.43,1.4,3.45);
  const sheet=new THREE.Group();block(sheet,.025,.43,.36,0,-.22,0,'#bac9a4');finish(sheet);sheet.position.set(-5.25,1.32,3.45);
  const carryModels={};for(const [key,g]of [['stool',stool],...Object.entries(items)]){const model=g.clone();model.traverse(child=>{if(child.isMesh)child.userData={};});model.position.set(-.27,-.4,-.8);model.scale.setScalar(key==='stool'?.36:1);model.rotation.set(.15,-.25,.1);carry.add(model);carryModels[key]=model;}carry.visible=false;
  const radio=new THREE.Group();block(radio,.56,.28,.18,0,0,0,'#356854');block(radio,.31,.2,.025,-.08,0,.105,'#243f36');part(radio,new THREE.CylinderGeometry(.045,.045,.04,10),'#a3bea0',.19,0,.12).rotation.x=Math.PI/2;finish(radio,'radio','Pause / resume the ambient soundtrack');radio.position.set(-4.9,1.7,-3.25);
  const flush=new THREE.Group();block(flush,.2,.07,.11,0,0,0,'#91ad8c');finish(flush,'flush','Flush the toilet');flush.position.set(-4.88,1.51,2.05);flush.rotation.y=Math.PI/2;
  const bowl=new THREE.Mesh(new THREE.SphereGeometry(1,16,8),material('#5b8c80'));bowl.scale.set(.52,.022,.38);bowl.position.set(-4.42,1.011,2.4);scene.add(bowl);dynamic.push(bowl);
  function update(room,id){state=room;me=id;flushAt=room.furnishings.flushedAt;const f=room.furnishings,held=room.heldProps;carry.visible=Object.values(held).includes(me);for(const [key,model]of Object.entries(carryModels))model.visible=held[key]===me;
    for(const [key,g]of Object.entries(items)){const slot=propLocation(f,key)||slotById(f.items[key]);g.userData.target=slot;g.visible=held[key]!==me&&(slot.door===undefined||f.doors[slot.door]||Boolean(held[key]));}
    stool.visible=held.stool!==me;
    for(const [i,g]of slots.entries()){const slot=SLOTS[i];g.visible=Boolean(Object.entries(held).some(([key,id])=>key!=='stool'&&id===me))&&(slot.door===undefined||f.doors[slot.door])&&!Object.entries(f.items).some(([key,value])=>value===slot.id&&held[key]!==me);}
  }
  const approach=(value,target,dt)=>Math.abs(value-target)<.002?target:value+(target-value)*(1-Math.exp(-dt*12));
  function react(effect){if(effect==='duck')pulseUntil=performance.now()+700;if(effect==='paper')paperUntil=performance.now()+850;}
  function animate(dt,now,serverNow){if(!state)return false;let changed=false;motion=false;const f=state.furnishings,held=state.heldProps,instant=reduced.matches;
    for(const [i,g]of doors.entries()){const target=f.doors[i]?(i===0?-1.4:1.4):0,value=instant?target:approach(g.rotation.y,target,dt);if(value!==g.rotation.y){g.rotation.y=value;changed=true;}if(value!==target)motion=true;}
    for(const[i,g]of drawers.entries()){const target=5.72-(f.drawers?.[i] ? .64 : 0),value=instant?target:approach(g.position.x,target,dt);if(value!==g.position.x){g.position.x=value;changed=true;}drawerContents[i].visible=Boolean(f.drawers?.[i]);if(value!==target)motion=true;}
    const valveTarget=state.environment?.shower?Math.PI/2:0,valveAngle=instant?valveTarget:approach(valve.rotation.z,valveTarget,dt);if(valve.rotation.z!==valveAngle){valve.rotation.z=valveAngle;changed=true;}if(valveAngle!==valveTarget)motion=true;
    const nextRack=instant?f.rackHeight:approach(rackY,f.rackHeight,dt);if(nextRack!==rackY){rackY=nextRack;rail.position.y=rackY;towel.position.y=rackY-.1-(towel.userData.height||3.5)/2;changed=true;}if(rackY!==f.rackHeight)motion=true;
    const nextCurtain=instant?Number(f.curtainOpen):approach(curtainAmount,Number(f.curtainOpen),dt);if(nextCurtain!==curtainAmount){curtainAmount=nextCurtain;poseCurtain();changed=true;}if(curtainAmount!==Number(f.curtainOpen))motion=true;
    for(const [key,g]of [['stool',stool],...Object.entries(items)]){
      if(PAPER_IDS.includes(key)){const target=(f.paperTurns?.[key]||0)*Math.PI/2,delta=Math.atan2(Math.sin(target-g.rotation.y),Math.cos(target-g.rotation.y));if(Math.abs(delta)>.002){g.rotation.y+=instant?delta:delta*(1-Math.exp(-dt*12));changed=true;motion=!instant||motion;}}
      const holder=held[key],actor=state.players.find(p=>p.id===holder),slot=key==='stool'?{...f.stool,y:floorHeight(f.stool.x,f.stool.z)}:g.userData.target;
      if(!slot)continue;let target={x:slot.x,y:slot.y,z:slot.z};
      if(holder&&holder!==me&&actor?.pose){const p=actor.pose;target={x:p.x-Math.sin(p.yaw)*.7,y:feetHeight(p,f)+1.15,z:p.z-Math.cos(p.yaw)*.7};g.visible=true;}
      if(!g.userData.placed){g.position.set(target.x,target.y,target.z);g.userData.placed=true;changed=true;}
      else for(const axis of ['x','y','z']){const value=instant?target[axis]:approach(g.position[axis],target[axis],dt);if(value!==g.position[axis]){g.position[axis]=value;changed=true;}if(value!==target[axis])motion=true;}
    }
    const visibleLaundry=camera.position.z>5.25,due=now-lastTick>100;
    const second=Math.floor(serverNow/1000);camera.getWorldDirection(clockDirection);clockTo.set(-2.6-camera.position.x,3.65-camera.position.y,5.46-camera.position.z).normalize();const clockVisible=camera.position.z<5.46&&clockDirection.dot(clockTo)>.25;if(second!==clockSecond&&clockVisible){clockSecond=second;const d=new Date(serverNow),sec=d.getSeconds(),min=d.getMinutes()+sec/60,hour=d.getHours()%12+min/60;for(const [i,a]of [hour*Math.PI/6,min*Math.PI/30,sec*Math.PI/30].entries())clockHands[i].rotation.z=a;changed=true;}
    const cycle=state.laundry;washerButton.children[0].material.color.set(cycle?.phase==='washing'?'#d7b478':'#91b49c');dryerButton.children[0].material.color.set(cycle?.phase==='drying'?'#d7b478':'#91b49c');bundles[0].visible=['loaded','washing','wet'].includes(cycle?.phase);bundles[1].visible=['dryer-loaded','drying'].includes(cycle?.phase);laundryCarry.visible=cycle?.phase==='carrying'&&me===state.owner;
    if(due)for(let i=0;i<2;i++){const running=cycle?.phase===(i?'drying':'washing'),pose=laundryPose(i?'dryer':'washer',running&&laundryMotion?(serverNow-cycle.startedAt)/1000:0);if(visibleLaundry){const drum=drums[i],bundle=bundles[i];if(drum.rotation.x!==pose.drum||bundle.rotation.x!==pose.cloth||bundle.rotation.y!==pose.fold||bundle.position.y!==.73+pose.y||bundle.position.z!==[7.7,9.9][i]+pose.z)changed=true;drum.rotation.x=pose.drum;bundle.rotation.set(pose.cloth,pose.fold,0);bundle.position.y=.73+pose.y;bundle.position.z=[7.7,9.9][i]+pose.z;}}
    const flushPhase=Math.max(0,1-(serverNow-flushAt)/3000),bowlY=1.011-(!instant&&flushPhase?Math.sin(flushPhase*Math.PI)*.1:0);if(bowl.position.y!==bowlY){bowl.position.y=bowlY;flush.rotation.z=flushPhase?-.2:0;changed=true;}if(flushPhase&&!instant)motion=true;
    const duckPhase=Math.max(0,(pulseUntil-now)/700),duckY=.47+Math.sin((1-duckPhase)*Math.PI*3)*duckPhase*.08;
    if(!instant&&duckPhase){duck.position.y=duckY;duck.rotation.z=Math.sin(now*.025)*duckPhase*.12;changed=true;motion=true;}else if(duck.position.y!==.47){duck.position.y=.47;duck.rotation.z=0;changed=true;}
    if(!instant&&paperUntil>now){paper.rotation.z=(paperUntil-now)*.002;sheet.rotation.z=Math.sin(now*.018)*.08;changed=true;motion=true;}else if(sheet.rotation.z){sheet.rotation.z=0;paper.rotation.z=0;changed=true;}
    if(due)lastTick=now;
    return changed;
  }
  return{update,animate,react,setLaundryMotion(value){laundryMotion=Boolean(value);lastTick=-Infinity;},rackHeight:()=>rackY,hasMotion:()=>motion,effectsActive:()=>Boolean(['washing','drying'].includes(state?.laundry?.phase)&&camera.position.z>5.25&&laundryMotion),dynamic,stool,paperMeshes,paperCarried:id=>Boolean(state&&state.heldProps[id]===me),
    bounds:()=>[[-5.4,0,-3.58,-2.05,1.4,-3.48],[-5.4,1.37,-3.7,-1.8,1.58,-1.9],[-6,0,5.5,-.9,6.8,5.8],[1.5,0,5.5,8,6.8,5.8],[-.9,4.3,5.5,1.5,6.8,5.8],[2.36,.2,-3.8,2.52,5.1,-.2]]};
}
