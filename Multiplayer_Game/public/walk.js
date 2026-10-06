export const BOUNDS={left:-5.55,right:7.55,back:-3.55,front:10.55};
// Plan-view footprints with space for the tube's body. Movement slides along obstacles.
export const OBSTACLES=[[3.4,5.9,4.4,5.3],[1.3,3.5,7.2,7.8],[-5.8,-5.05,-1.1,-.1],[-5.4,-1.8,-3.8,-1.65],[2.36,2.52,-3.8,-.2],[-5.5,-3.1,1.75,3.05],[-3.1,-2.1,9.1,10.1],[5.5,7.6,5.8,8.2],[-5.5,-3.8,6.4,9.1],[-5.5,-3.8,9.1,10.7],[3,5.25,9.1,9.9],[-6,-.9,5.5,5.8],[1.5,8,5.5,5.8]];
export function canStand(x,z,furniture, support=null,held={}) {
  if(!(x>=BOUNDS.left&&x<=BOUNDS.right&&z>=BOUNDS.back&&z<=BOUNDS.front)||OBSTACLES.some(([a,b,c,d])=>x>a-.25&&x<b+.25&&z>c-.25&&z<d+.25))return false;
  if(furniture){
    if(furniture.drawers?.some(Boolean)&&x>4.73&&x<5.75&&z>5.91&&z<8.09)return false;
    if(!furniture.curtainOpen&&x>2.25&&z>-.53&&z<.07)return false;
    if(furniture.curtainOpen&&x>2.25&&x<3.6&&z>-.53&&z<.07)return false;
    if(furniture.doors.some((open,i)=>open&&Math.abs(x-(i===0?-5.15:-2.15))<.46&&z>-2.2&&z<-.35))return false;
    if(support!=='stool'&&!held.stool&&Math.abs(x-furniture.stool.x)<.75&&Math.abs(z-furniture.stool.z)<.75)return false;
  }
  return true;
}
export function walk(position,dx,dz,furniture,support=null,held={},onStep=()=>{}) {
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.1));
  for(let i=0;i<steps;i++){if(canStand(position.x+dx/steps,position.z,furniture,support,held)){position.x+=dx/steps;if(dx)onStep(position);}if(canStand(position.x,position.z+dz/steps,furniture,support,held)){position.z+=dz/steps;if(dz)onStep(position);}}
  return position;
}
