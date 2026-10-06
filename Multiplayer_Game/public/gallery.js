import{paperId,paperSurface}from'./paper.js';
export const CAMERA_POSITION={x:6.4,y:1.65,z:7};
export function makePrint(room,surface,slot,by,at){
 if(![0,1].includes(slot)||surface!=='towel'&&!paperId(surface))throw Error('Choose a towel or spare roll and a print frame');
 return{slot,surface,towelId:surface==='towel'?room.activeTowel:null,sequence:room.sequence,fromSequence:surface==='towel'?(room.erasedBefore[room.activeTowel]||0):0,by,at};
}
export function printStrokes(room,print){return room.strokes.filter(s=>s.sequence>print.fromSequence&&s.sequence<=print.sequence&&(print.surface==='towel'?!paperSurface(s)&&(s.towelId||'original')===print.towelId:s.surface===print.surface));}
export function gallerySnapshot(room){return(room.photos||[]).map(print=>({...print,strokes:printStrokes(room,print)}));}
