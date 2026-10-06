import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stampShape,strokeSteps,STAMP_PATTERNS} from '../public/paint.js';
test('stamp variants produce distinct repeatable geometry and balance interrupted replay contexts',()=>{
 const signatures=new Set();
 for(const pattern of STAMP_PATTERNS){const calls=[];let depth=0;const ctx=new Proxy({canvas:{width:512,height:640},save(){depth++;},restore(){depth--;}},{get(target,key){return key in target?target[key]:(...args)=>calls.push([key,...args]);}});
 const stroke={tool:'stamp',pattern,turn:3,size:.04,color:'#123456',points:[[.2,.3],[.7,.6]],id:'test'};
 const first=strokeSteps(ctx,stroke);first.next();assert.equal(depth,1);first.return();assert.equal(depth,0);assert.ok(calls.some(c=>c[0]==='rotate'&&c[1]===3*Math.PI/2));
 calls.length=0;stampShape(ctx,pattern,10);signatures.add(JSON.stringify(calls));const result=JSON.stringify(calls);calls.length=0;stampShape(ctx,pattern,10);assert.equal(JSON.stringify(calls),result);
 }assert.equal(signatures.size,4);
});
