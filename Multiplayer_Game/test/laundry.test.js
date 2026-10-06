import {test}from'node:test';
import assert from'node:assert/strict';
import {freshLaundry,beginLaundry,loadLaundry,advanceLaundry,visibleStrokes,CYCLE_MS}from'../public/laundry.js';
import {defaultFurnishings}from'../public/furnishings.js';
test('each machine runs twenty seconds and washing clears only its own towel history',()=>{
 const room={activeTowel:'original',sequence:3,generation:0,laundry:freshLaundry(),furnishings:defaultFurnishings(),towelWet:{},towelCounts:{original:2,hand:1},strokes:[{sequence:1,towelId:'original'},{sequence:2,towelId:'hand'},{sequence:3,towelId:'original'}]};
 assert.equal(CYCLE_MS,20000);assert.throws(()=>beginLaundry(room,'dryer',1000),/Wash/);
 room.laundry=beginLaundry(room,'washer',1000);assert.equal(room.laundry.endsAt,21000);assert.throws(()=>beginLaundry(room,'washer',2000),/Finish/);
 assert.equal(advanceLaundry(room,20999),false);assert.equal(visibleStrokes(room).length,2);
 assert.equal(advanceLaundry(room,21000),true);assert.equal(room.laundry.phase,'wet');assert.deepEqual(visibleStrokes(room),[]);assert.equal(room.towelCounts.original,0);
 room.activeTowel='hand';assert.equal(visibleStrokes(room).length,1);room.activeTowel='original';
 room.laundry=beginLaundry(room,'dryer',22000);assert.equal(advanceLaundry(room,41999),false);assert.equal(advanceLaundry(room,42000),true);assert.equal(room.laundry.phase,'ready');assert.equal(room.wetAt,0);
 room.strokes.push({sequence:4,towelId:'original'});assert.equal(visibleStrokes(room).length,1);assert.equal(advanceLaundry(room,43000),false);
});
test('physical laundry stages keep loading, starting and wet-towel transfer separate',()=>{
 const room={activeTowel:'hand',laundry:freshLaundry(),furnishings:defaultFurnishings(),generation:0,sequence:1,towelWet:{},towelCounts:{hand:1}};
 assert.throws(()=>loadLaundry(room,'dryer',0),/Collect/);room.laundry=loadLaundry(room,'washer',100);assert.equal(room.laundry.phase,'loaded');assert.equal(advanceLaundry(room,100000),false);assert.throws(()=>loadLaundry(room,'washer',100),/already/);
 room.laundry=beginLaundry(room,'washer',100000);advanceLaundry(room,120000);room.laundry=loadLaundry(room,'washer',120100);assert.equal(room.laundry.phase,'carrying');room.laundry=loadLaundry(room,'dryer',120200);assert.equal(room.laundry.phase,'dryer-loaded');assert.equal(advanceLaundry(room,150000),false);room.laundry=beginLaundry(room,'dryer',150000);assert.equal(advanceLaundry(room,169999),false);assert.equal(advanceLaundry(room,170000),true);assert.equal(room.laundry.phase,'ready');
});
