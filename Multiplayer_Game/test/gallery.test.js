import{test}from'node:test';import assert from'node:assert/strict';import{makePrint,printStrokes,gallerySnapshot}from'../public/gallery.js';
test('instant studies retain exact historical ranges through washing, edits and towel swaps',()=>{
 const room={activeTowel:'original',sequence:4,erasedBefore:{original:1},strokes:[{sequence:1},{sequence:2,towelId:'original'},{sequence:3,surface:'paper-a',towelId:'original'},{sequence:4,towelId:'hand'}]};
 const towel=makePrint(room,'towel',0,'Artist',100),paper=makePrint(room,'paper-a',1,'Artist',100);room.photos=[towel,paper];
 room.strokes.push({sequence:5,towelId:'original'},{sequence:6,surface:'paper-a'});room.erasedBefore.original=6;room.activeTowel='hand';
 assert.deepEqual(printStrokes(room,towel).map(s=>s.sequence),[2]);assert.deepEqual(printStrokes(room,paper).map(s=>s.sequence),[3]);assert.equal(gallerySnapshot(room).length,2);
 assert.throws(()=>makePrint(room,'mirror',0,'Artist',100));assert.throws(()=>makePrint(room,'towel',2,'Artist',100));
});
