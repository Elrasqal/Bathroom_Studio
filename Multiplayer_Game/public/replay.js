// Restore artwork in small ordered batches instead of blocking input on a large room.
export function artworkReplay(draw,{clock=()=>performance.now(),budget=2,maxBatch=48,onProgress=()=>{}}={}){
  let pending=[],index=0,job=null;
  return{
    reset(strokes=[]){job?.return();job=null;pending=strokes.slice();index=0;},
    append(stroke){pending.push(stroke);},
    active:()=>index<pending.length,
    remaining:()=>pending.length-index,
    step(){const started=clock();let drawn=0;while(index<pending.length&&drawn<maxBatch){const record=pending[index];if(!job){const result=draw(record);if(result?.next)job=result;else index++;}if(job&&job.next().done){job=null;index++;}onProgress(record);drawn++;if(clock()-started>=budget)break;}if(index===pending.length){pending=[];index=0;}return drawn;}
  };
}
