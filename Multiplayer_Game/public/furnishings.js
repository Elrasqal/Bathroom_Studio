export const DIVIDER_Z=5.65;
export const STOOL_TOP=.92;
export const minRackHeight=towel=>Math.max(2.15,(towel?.height||3.5)+.14);
export const SLOTS=[
  {id:'left-a',door:0,x:-4.75,y:.36,z:-2.5},
  {id:'left-b',door:0,x:-4.05,y:.36,z:-2.5},
  {id:'right-a',door:1,x:-3.15,y:.36,z:-2.5},
  {id:'right-b',door:1,x:-2.45,y:.36,z:-2.5},
  {id:'paper-left-a',door:0,x:-4.85,y:1.005,z:-2.22},
  {id:'paper-left-b',door:0,x:-4.18,y:1.005,z:-2.22},
  {id:'paper-right-a',door:1,x:-3.15,y:1.005,z:-2.22},
  {id:'paper-right-b',door:1,x:-2.5,y:1.005,z:-2.22},
  {id:'display-a',x:-4.75,y:2.06,z:-2.1},
  {id:'display-b',x:-2.3,y:2.06,z:-2.1},
  {id:'counter-a',x:-4.85,y:1.78,z:-2.55},
  {id:'counter-b',x:-2.2,y:1.78,z:-3.1}
];
export function defaultFurnishings(){return{doors:[false,false],drawers:[false,false,false],curtainOpen:false,rackHeight:5.08,washer:false,flushedAt:0,stool:{x:.3,z:-1.65},items:{jar:'left-a',cloth:'right-b','paper-a':'paper-left-a','paper-b':'paper-left-b','paper-c':'paper-right-a'}};}
export const slotById=id=>SLOTS.find(slot=>slot.id===id);
export function floorHeight(x,z){return x>2.58&&z<-.35?.23:0;}
export function stoolContains(p,stool,margin=0){return Math.abs(p.x-stool.x)<=.5+margin&&Math.abs(p.z-stool.z)<=.5+margin;}
export function feetHeight(p,f){return p.support==='stool'?floorHeight(f.stool.x,f.stool.z)+STOOL_TOP:floorHeight(p.x,p.z);}
export function pathClear(from,to,canStand){const steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.08));for(let i=1;i<=steps;i++)if(!canStand(from.x+(to.x-from.x)*i/steps,from.z+(to.z-from.z)*i/steps))return false;return true;}
