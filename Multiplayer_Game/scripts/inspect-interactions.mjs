import * as fs from 'node:fs';
import{readFileSync,writeFileSync,unlinkSync}from'node:fs';import{pathToFileURL}from'node:url';
const source=readFileSync('public/scene.js','utf8').replace("import * as THREE from '/three.js';", "import * as Base from 'three';const THREE={...Base,WebGLRenderer:class{constructor(){this.shadowMap={};}render(){}setPixelRatio(){}setSize(){}}};");
const path='public/.inspect-scene.mjs';writeFileSync(path,source);
const canvas=()=>({width:512,height:128,getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>k in t?t[k]:(()=>{})});}});globalThis.document={createElement:canvas};globalThis.matchMedia=()=>({matches:false});
const {buildBathroom}=await import(pathToFileURL(process.cwd()+'/'+path));const world=buildBathroom(canvas());world.scene.updateMatrixWorld(true);

const results=[];
const inspect=(label,from,to,action)=>{world.camera.position.set(...from);world.camera.lookAt(...to);world.scene.updateMatrixWorld(true);const hit=world.interact();results.push({label,expected:action,actual:hit?.action||null,passed:hit?.action===action});};
for(const spec of [{label:'hand',y:3.2},{label:'square',y:2.35}])inspect(spec.label+' towel',[4.65,2.15,3.3],[4.65,spec.y,4.32],'towel');
inspect('washer door',[-2.4,2.15,7.7],[-3.73,.73,7.7],'washer-load');inspect('washer start',[-2.4,2.15,7.65],[-3.80,1.18,7.65],'washer-start');inspect('dryer door',[-2.4,2.15,9.9],[-3.64,.75,9.9],'dryer-load');inspect('dryer start',[-2.4,2.15,9.45],[-3.80,1.18,9.45],'dryer-start');
for(let i=0;i<3;i++)inspect('drawer '+i,[4.65,2.15,7],[5.685,1.12-i*.34,7],'drawer');
fs.writeFileSync('data/interaction-inspection.json',JSON.stringify(results,null,2));fs.unlinkSync(path);console.log(JSON.stringify(results));if(results.some(r=>!r.passed))process.exitCode=1;
