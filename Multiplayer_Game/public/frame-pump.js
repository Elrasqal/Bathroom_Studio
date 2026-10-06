// Input wakes the next animation frame immediately; idle work sleeps between polls.
export function createFramePump(frame,{request=requestAnimationFrame,cancel=cancelAnimationFrame,delay=setTimeout,clear=clearTimeout,now=()=>performance.now(),hidden=()=>document.hidden}={}){
  let raf=0,timer=0,running=false,last=now();
  function pause(){if(raf)cancel(raf);if(timer)clear(timer);raf=timer=0;}
  function wake(){
    if(hidden())return;
    if(timer){clear(timer);timer=0;last=now()-16.7;}
    if(!raf&&!running)raf=request(tick);
  }
  function tick(time){
    raf=0;if(hidden())return;
    running=true;let interval;
    try{interval=frame(time,Math.min(.05,Math.max(0,(time-last)/1000)));last=time;}finally{running=false;}
    if(interval===0)raf=request(tick);
    else timer=delay(()=>{timer=0;if(!hidden())raf=request(tick);},interval);
  }
  return {wake,pause};
}
