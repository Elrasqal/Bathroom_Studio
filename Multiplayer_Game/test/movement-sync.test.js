import test from 'node:test';
import assert from 'node:assert/strict';
import {movementSync} from '../public/movement-sync.js';

test('old corrections and normal stool acknowledgements never rewind newer local movement',()=>{
  let pose={x:0,z:0,yaw:0},route=[],discarded=0,corrections=0;
  const sent=[],controls={pose:()=>pose,route:()=>route,clearRoute(){route=[];},correct(p){pose=p;route=[];corrections++;},reset(p){this.correct(p);},elevate(p){this.correct(p);}};
  const sync=movementSync(controls,{send:m=>{sent.push(m);return true;},discard:()=>discarded++});
  sync.flush();assert.equal(sent[0].revision,0);
  sync.reconcile({correction:true,revision:1,pose:{x:1,z:1,yaw:0}});
  pose={x:2,z:1,yaw:0};route=[{x:2,z:1}];sync.flush();
  assert.equal(sent.at(-1).revision,1);
  assert.equal(sync.reconcile({correction:true,revision:1,pose:{x:1,z:1,yaw:0}}),false);
  assert.equal(sync.reconcile({pose:{x:1,z:1,yaw:0,support:'stool'}}),false);
  assert.equal(pose.x,2);assert.equal(corrections,1);assert.equal(discarded,1);
  assert.equal(sync.reconcile({elevation:true,revision:2,pose:{x:3,z:1,yaw:0,support:'stool'}}),true);
  sync.reset();sync.flush();assert.equal(sent.at(-1).revision,0);
});

test('backpressure retains an unsent movement route and reports failure to dependent actions',()=>{
  let path=[{x:1,z:1}],allow=false;
  const controls={pose:()=>({x:1,z:1,yaw:0}),route:()=>path,clearRoute(){path=[];}};
  const sync=movementSync(controls,{send:()=>allow});
  assert.equal(sync.flush(),false);assert.equal(path.length,1);
  allow=true;assert.equal(sync.flush(),true);assert.equal(path.length,0);
});
