import{test}from'node:test';import assert from'node:assert/strict';import{wrappedPoints,availableStrokes}from'../public/paper.js';import{drawPaperStroke}from'../public/paper-paint.js';
test('paper seam strokes take the short route and match on both sides of the wrap',()=>{
 assert.deepEqual(wrappedPoints([[.98,.2],[.02,.4]]),[[[.98,.2],[1,.30000000000000004]],[[0,.30000000000000004],[.02,.4]]]);
 const opposite=wrappedPoints([[.02,.2],[.98,.4]]);assert.equal(opposite.length,2);assert.equal(opposite[0][1][0],0);assert.equal(opposite[1][0][0],1);assert.ok(Math.abs(opposite[0][1][1]-.3)<1e-9);
 const calls=[],ctx={canvas:{width:384,height:128},save(){},restore(){},translate(x,y){calls.push(['translate',x,y]);},beginPath(){},moveTo(x,y){calls.push(['move',x,y]);},lineTo(x,y){calls.push(['line',x,y]);},stroke(){},arc(){},fill(){}};
 drawPaperStroke(ctx,{id:'wrap',surface:'paper-a',tool:'squeeze',size:.02,color:'#112233',points:[[.98,.2],[.02,.4]]});
 assert.equal(calls.filter(c=>c[0]==='translate').length,6);assert.ok(calls.filter(c=>c[0]==='line').every(c=>c[1]>=0&&c[1]<=384));
});
test('paper art remains available across towel swaps and towel washing',()=>{
 const room={activeTowel:'hand',erasedBefore:{original:6},strokes:[{sequence:1,towelId:'original'},{sequence:2,towelId:'original',surface:'paper-a'},{sequence:3,towelId:'hand'},{sequence:4,towelId:'original',surface:'paper-b'}]};
 assert.deepEqual(availableStrokes(room).map(s=>s.sequence),[2,3,4]);room.activeTowel='original';assert.deepEqual(availableStrokes(room).map(s=>s.sequence),[2,4]);
});
