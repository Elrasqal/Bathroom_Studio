import {test} from 'node:test';
import assert from 'node:assert/strict';
import {changeFan,changeShower,humidityAt} from '../public/environment.js';
import {drawFog,fogStrength,liveFogMarks} from '../public/fog.js';

test('ventilation preserves humidity continuity and clears steam even with the shower running',()=>{
  const hot=changeShower({shower:false,humidity:0,at:0},true,0),before=humidityAt(hot,30000);
  const ventilated=changeFan(hot,true,30000);assert.equal(humidityAt(ventilated,30000),before);
  assert.ok(humidityAt(ventilated,100000)<.13);
  const reheated=changeFan(ventilated,false,100000);assert.ok(Math.abs(humidityAt(reheated,100000)-humidityAt(ventilated,100000))<1e-12);assert.ok(humidityAt(reheated,160000)>.9);
});

test('fog stencil fades by server timestamp and disappears when dry without changing paint layers',()=>{
  const mark={points:[[.1,.2],[.3,.4]],at:1000};assert.equal(fogStrength(mark,1000),1);assert.equal(fogStrength(mark,23500),.5);
  assert.deepEqual(liveFogMarks([mark],46000,1),[]);assert.deepEqual(liveFogMarks([mark],1100,.19),[]);
  const operations=[],ctx={save(){operations.push('save');},restore(){operations.push('restore');},clearRect(){operations.push('clear');},fillRect(){operations.push('fog');},beginPath(){},moveTo(){},lineTo(){},stroke(){operations.push([this.globalCompositeOperation,this.globalAlpha]);}};
  drawFog(ctx,[mark],23500);assert.deepEqual(operations,['clear','save','fog',['destination-out',.5],'restore']);
});
