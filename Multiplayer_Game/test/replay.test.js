import{test}from'node:test';import assert from'node:assert/strict';import{artworkReplay}from'../public/replay.js';
test('large artwork restores in bounded slices, preserves appended order and replaces stale jobs',()=>{
 let now=0;const drawn=[],replay=artworkReplay(stroke=>{drawn.push(stroke);now+=.75;},{clock:()=>now,budget:2,maxBatch:48});
 replay.reset(Array.from({length:12000},(_,i)=>i));assert.equal(replay.step(),3);assert.equal(replay.remaining(),11997);
 replay.append(12000);while(replay.active())replay.step();assert.deepEqual(drawn,Array.from({length:12001},(_,i)=>i));
 replay.reset(['stale']);replay.reset(['new']);assert.equal(replay.step(),1);assert.equal(drawn.at(-1),'new');assert.equal(replay.active(),false);
});
test('maximum batch also bounds replay with a low resolution or stalled timer',()=>{
 const drawn=[],replay=artworkReplay(s=>drawn.push(s),{clock:()=>0,maxBatch:8});replay.reset(Array(100).fill(1));assert.equal(replay.step(),8);assert.equal(replay.remaining(),92);
});
test('work inside one dense stroke can pause, resume and clean up on replacement',()=>{
 let now=0,closed=0;const drawn=[];function* draw(value){try{for(let i=0;i<100;i++){drawn.push(value);now+=.75;yield;}}finally{closed++;}}
 const replay=artworkReplay(draw,{clock:()=>now,budget:2});replay.reset(['old']);assert.equal(replay.step(),3);assert.equal(replay.remaining(),1);replay.reset(['new']);assert.equal(closed,1);while(replay.active())replay.step();assert.equal(closed,2);assert.equal(drawn.filter(v=>v==='new').length,100);
});
