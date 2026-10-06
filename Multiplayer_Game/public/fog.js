export const FOG_THRESHOLD=.2;
export const FOG_LIFETIME=45000;
export function fogStrength(mark,now){return Math.max(0,1-Math.max(0,now-mark.at)/FOG_LIFETIME);}
export function liveFogMarks(marks,now,humidity){return humidity<FOG_THRESHOLD?[]:marks.filter(mark=>fogStrength(mark,now)>0);}
// This temporary stencil clears condensation, independently of permanent colored artwork.
export function drawFog(ctx,marks,now,width=512,height=360){
  ctx.clearRect(0,0,width,height);ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.fillStyle='#d7e6dd';ctx.fillRect(0,0,width,height);
  ctx.globalCompositeOperation='destination-out';ctx.lineCap=ctx.lineJoin='round';
  for(const mark of marks){
    const strength=fogStrength(mark,now);if(!strength)continue;
    ctx.globalAlpha=strength;ctx.lineWidth=.05*width;ctx.beginPath();
    mark.points.forEach(([x,y],i)=>i?ctx.lineTo(x*width,y*height):ctx.moveTo(x*width,y*height));ctx.stroke();
    if(mark.points.length===1){ctx.beginPath();ctx.arc(mark.points[0][0]*width,mark.points[0][1]*height,.05*width/2,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}
