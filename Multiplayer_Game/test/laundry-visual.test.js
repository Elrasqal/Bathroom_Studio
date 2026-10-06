import {test} from 'node:test';
import assert from 'node:assert/strict';
import {laundryPose} from '../public/laundry-visual.js';
test('laundry loops last six/eight seconds, repeat smoothly and keep cloth inside the drum',()=>{
 for(const machine of ['washer','dryer']){
  const initial=laundryPose(machine,0),period=initial.period;assert.ok(period>=5);
  const middle=laundryPose(machine,period/4);assert.notDeepEqual(middle,initial);
  for(let n=0;n<160;n++){const a=laundryPose(machine,n/20),b=laundryPose(machine,n/20+period);for(const key of ['y','z','fold'])assert.ok(Math.abs(a[key]-b[key])<1e-12);assert.ok(Math.hypot(a.y,a.z)+Math.hypot(.2,.18)<.385);assert.ok(Math.abs(Math.sin(a.cloth)-Math.sin(b.cloth))<1e-12);}
  const before=laundryPose(machine,period-1e-5),after=laundryPose(machine,period+1e-5);assert.ok(Math.hypot(before.y-after.y,before.z-after.z)<.001);
 }
});
