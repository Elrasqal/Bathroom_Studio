export const CYCLE_MS=20000;
export function freshLaundry(){return{phase:'ready',towelId:null,startedAt:0,endsAt:0};}
export function loadLaundry(room,machine,now){
 const cycle=room.laundry||freshLaundry();
 if(machine==='washer'){
   if(cycle.phase==='wet')return{...cycle,phase:'carrying',startedAt:now,endsAt:0};
   if(cycle.phase!=='ready')throw Error('The washer is already loaded or running');
   return{phase:'loaded',towelId:room.activeTowel,startedAt:now,endsAt:0};
 }
 if(machine!=='dryer'||cycle.phase!=='carrying')throw Error('Collect the wet towel from the washer first');
 return{...cycle,phase:'dryer-loaded',startedAt:now,endsAt:0};
}
export function advanceLaundry(room,now){
 const cycle=room.laundry;if(!cycle||!['washing','drying'].includes(cycle.phase)||now<cycle.endsAt)return false;
 if(cycle.phase==='washing'){
   room.erasedBefore??={};room.erasedBefore[cycle.towelId]=room.sequence;
   room.towelCounts[cycle.towelId]=0;room.wetAt=cycle.endsAt;room.towelWet[cycle.towelId]=cycle.endsAt;
   room.laundry={...cycle,phase:'wet'};
 }else{room.laundry=freshLaundry();room.wetAt=0;room.towelWet[cycle.towelId]=0;}
 room.furnishings.washer=false;room.generation++;return true;
}
export function beginLaundry(room,machine,now){
 const cycle=room.laundry||freshLaundry();
 if(machine==='washer'&&!['ready','loaded'].includes(cycle.phase))throw Error('Finish washing and drying this towel first');
 if(machine==='dryer'&&!['wet','dryer-loaded'].includes(cycle.phase))throw Error('Wash the towel before using the dryer');
 return{phase:machine==='washer'?'washing':'drying',towelId:room.activeTowel,startedAt:now,endsAt:now+CYCLE_MS};
}
export function visibleStrokes(room){return room.strokes.filter(s=>!s.surface?.startsWith('paper-')&&(s.towelId||'original')===room.activeTowel&&s.sequence>(room.erasedBefore?.[room.activeTowel]||0));}
