// Server-time loops: reconnects see the same drum phase, without accumulating frames.
export function laundryPose(machine,elapsed){
  const period=machine==='washer'?6:8,t=((Math.max(0,elapsed)%period)/period)*Math.PI*2;
  if(machine==='washer')return{period,drum:Math.sin(t)*Math.PI*1.5,cloth:Math.sin(t)*Math.PI*1.8,y:Math.sin(t*2)*.075,z:Math.cos(t)*.095,fold:Math.sin(t*2)*.15};
  return{period,drum:t,cloth:t+Math.sin(t)*.6,y:Math.sin(t)*.10,z:Math.cos(t)*.085,fold:Math.cos(t*2)*.16};
}
