import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildRenovation} from '../public/renovation.js';
import {defaultFurnishings} from '../public/furnishings.js';

test('furnishing animations settle, gather the curtain and throttle the washer while reduced motion snaps',t=>{
  const old=globalThis.matchMedia;let reduced=false;globalThis.matchMedia=()=>({get matches(){return reduced;}});t.after(()=>globalThis.matchMedia=old);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),towel=new THREE.Mesh(new THREE.PlaneGeometry(2.8,3.5));scene.add(camera,towel);camera.position.z=8;towel.userData.height=3.5;
  const material=color=>new THREE.MeshLambertMaterial({color});
  const box=(w,h,d,x,y,z,color)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);scene.add(mesh);return mesh;};
  const plaque=(text,w,h,x,y,z)=>box(w,h,.01,x,y,z,'#88aa88');const action=(object,id,label)=>object.userData={action:id,label};
  const r=buildRenovation(THREE,{scene,camera,towel,material,box,plaque,action});const room={furnishings:defaultFurnishings(),heldProps:{stool:null,jar:null,cloth:null},players:[]};r.update(room,'owner');r.animate(.016,1000,100000);
  for(const[id,mesh]of Object.entries(r.paperMeshes)){assert.equal(mesh.userData.surface,id,'interaction registration must retain painting identity');assert.equal(mesh.userData.prop,id);}
  scene.updateMatrixWorld(true);const roll=r.paperMeshes['paper-a'],ray=new THREE.Raycaster(new THREE.Vector3(-4.85,1.02,0),new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(roll)[0]?.uv,'the wrapping cylinder exposes paint coordinates');
  camera.position.z=4;camera.rotation.y=Math.PI;r.animate(.016,1000,100000);const seconds=r.dynamic.find(g=>g.userData.clockHand===2),angle=seconds.rotation.z;r.animate(.016,1001,101000);assert.notEqual(seconds.rotation.z,angle,'clock advances with real elapsed server time');camera.position.z=8;
  const door=r.dynamic.find(g=>g.children?.some(c=>c.userData.action==='cabinet')),curtain=r.dynamic.find(g=>g.userData.action==='curtain');
  room.furnishings.doors[0]=true;room.furnishings.curtainOpen=true;room.furnishings.rackHeight=4.35;r.update(room,'owner');r.animate(.016,1016,100016);
  assert.ok(door.rotation.y<0&&door.rotation.y>-1.4);assert.equal(r.hasMotion(),true);
  for(let i=0;i<100;i++)r.animate(.05,1100+i*50,100100+i*50);
  assert.equal(door.rotation.y,-1.4);assert.equal(r.rackHeight(),4.35);assert.equal(r.hasMotion(),false);
  const matrix=new THREE.Matrix4();curtain.getMatrixAt(14,matrix);assert.ok(matrix.elements[12]<3.5,'curtain gathers at its supported left post');
  assert.ok(matrix.elements[0]*.34<.09,'gathered panels on the same depth plane cannot overlap and flicker');
  room.furnishings.washer=true;room.laundry={phase:'washing',startedAt:105000};r.update(room,'owner');assert.equal(r.effectsActive(),true);r.animate(.05,6200,105200);assert.equal(r.hasMotion(),false,'continuous washer motion must not request unlimited animation frames');
  reduced=true;room.furnishings.doors[0]=false;r.animate(.016,6301,105301);assert.equal(door.rotation.y,0);assert.equal(r.effectsActive(),true,'functional laundry motion remains visible under OS reduced motion');assert.equal(r.hasMotion(),false);
  const cloth=r.dynamic.find(g=>g.position.x===-4.04&&g.position.z>7&&g.position.z<8),clothAngle=cloth.rotation.x;r.animate(.1,6402,106500);assert.notEqual(cloth.rotation.x,clothAngle,'loaded towel actually tumbles in the reduced-motion renderer');
  r.setLaundryMotion(false);r.animate(.1,6510,106600);assert.equal(r.effectsActive(),false);assert.equal(cloth.rotation.x,0);const stopped=cloth.rotation.clone();r.animate(.1,6630,107600);assert.equal(cloth.rotation.equals(stopped),true);
  r.setLaundryMotion(true);room.laundry={phase:'drying',startedAt:107000};r.update(room,'owner');r.animate(.1,6800,107300);const dryCloth=r.dynamic.find(g=>g.position.x===-4.04&&g.position.z>9),dryAngle=dryCloth.rotation.x;r.animate(.1,6910,108600);assert.notEqual(dryCloth.rotation.x,dryAngle);assert.equal(r.effectsActive(),true);room.laundry.phase='ready';r.animate(.1,7020,108700);assert.equal(r.effectsActive(),false);assert.equal(dryCloth.visible,false);
  scene.traverse(object=>{if(object.isMesh){object.updateWorldMatrix(true,false);assert.ok(object.matrixWorld.elements.every(Number.isFinite));}});
});
