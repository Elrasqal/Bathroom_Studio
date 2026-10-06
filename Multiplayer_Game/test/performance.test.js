import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {QUALITY,renderRatio,mergeStatic} from '../public/performance.js';
import {createFramePump} from '../public/frame-pump.js';

test('render resolution stays within pixel budgets regardless of high-DPI or large displays',()=>{
  for(const quality of Object.keys(QUALITY))for(const [width,height,dpr]of [[1280,720,1],[1920,1080,2],[3840,2160,3],[390,844,3]]){
    const ratio=renderRatio(width,height,dpr,quality);
    assert.ok(ratio<=dpr);assert.ok(width*height*ratio**2<=QUALITY[quality].maxPixels+1e-6);
  }
  assert.equal(renderRatio(1280,720,2,'fast'),.7);
  assert.equal(renderRatio(390,844,3,'mobile'),.55);
  assert.ok(renderRatio(390,844,3,'mobile')**2/9<.034,'mobile spends under 3.4% of native 3x-DPI pixels');
  assert.ok(1280*720*renderRatio(1280,720,2,'fast')**2/(1280*720*2**2)<.13,'fast should remove over 87% of the prior high-DPI pixel load');
});

test('static geometry batching preserves world positions and UVs and leaves interactive surfaces intact',()=>{
  const scene=new THREE.Scene(),material=new THREE.MeshLambertMaterial();
  const a=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),material);a.position.x=1;scene.add(a);
  const b=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),material);b.position.x=4;b.scale.set(2,2,2);scene.add(b);
  const blue=new THREE.MeshLambertMaterial({color:'#336699'}),tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),blue,2);
  tiles.position.x=1;tiles.setMatrixAt(0,new THREE.Matrix4().makeTranslation(8,0,0));tiles.setMatrixAt(1,new THREE.Matrix4().makeTranslation(10,0,0));scene.add(tiles);
  const tool=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),material);tool.userData.action='brush';scene.add(tool);
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);scene.add(surface);
  assert.equal(mergeStatic(THREE,scene,new Set([surface])),2);
  assert.ok(scene.children.includes(tool)&&scene.children.includes(surface));assert.ok(!scene.children.includes(a)&&!scene.children.includes(b));
  const batch=scene.children.find(object=>object!==surface&&object!==tool);
  assert.equal(batch.geometry.boundingBox.min.x,.5);assert.equal(batch.geometry.boundingBox.max.x,11.5);
  assert.equal(batch.geometry.attributes.position.count,144);assert.equal(batch.geometry.attributes.uv.count,144);
  assert.ok(Math.abs(batch.geometry.attributes.color.getX(72)-blue.color.r)<1e-6,'vertex colors must preserve each source material');
});

test('idle scheduling wakes immediately for input, deduplicates requests and pauses hidden tabs',()=>{
  let clock=0,id=0,inactive=false,active=false;const requests=new Map(),timers=new Map(),frames=[];
  const pump=createFramePump((time,dt)=>{frames.push([time,dt]);return active?0:100;},{request:callback=>{requests.set(++id,callback);return id;},cancel:key=>requests.delete(key),delay:callback=>{timers.set(++id,callback);return id;},clear:key=>timers.delete(key),now:()=>clock,hidden:()=>inactive});
  function frame(){const [key,callback]=requests.entries().next().value;requests.delete(key);callback(clock);}
  pump.wake();pump.wake();assert.equal(requests.size,1);frame();assert.equal(requests.size,0);assert.equal(timers.size,1);
  clock=50;pump.wake();assert.equal(timers.size,0);assert.equal(requests.size,1,'input must bypass the 100ms idle delay');
  clock=66.7;active=true;frame();assert.equal(requests.size,1);assert.ok(frames.at(-1)[1]<.05);
  pump.pause();assert.equal(requests.size,0);inactive=true;pump.wake();assert.equal(requests.size,0);
  inactive=false;pump.wake();assert.equal(requests.size,1);pump.pause();
});
