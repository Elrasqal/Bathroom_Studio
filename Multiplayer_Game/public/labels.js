export const LABEL_RATIO=.8;
export const LABEL_POSITION={x:5.55,z:7.65};
export function labelCrop(width,height,zoom=1,panX=.5,panY=.5){
 const w=Math.min(1,height*LABEL_RATIO/width)/Math.max(1,Math.min(6,zoom)),h=w*width/(height*LABEL_RATIO);
 return{x:Math.max(0,Math.min(1,panX))*(1-w),y:Math.max(0,Math.min(1,panY))*(1-h),w,h};
}
export function validateCrop(crop,width,height){
 if(!crop||!['x','y','w','h'].every(k=>Number.isFinite(crop[k]))||crop.x<0||crop.y<0||crop.w<.02||crop.h<.02||crop.x+crop.w>1.000001||crop.y+crop.h>1.000001||Math.abs(crop.w*width/(crop.h*height)-LABEL_RATIO)>.01)throw Error('Choose a crop inside the artwork');
 return Object.fromEntries(['x','y','w','h'].map(k=>[k,crop[k]]));
}
export function drawLabel(ctx,source,crop){
 const {width,height}=ctx.canvas;ctx.fillStyle='#e1dfbb';ctx.fillRect(0,0,width,height);
 if(source&&crop)ctx.drawImage(source,crop.x*source.width,crop.y*source.height,crop.w*source.width,crop.h*source.height,0,0,width,height);
 ctx.strokeStyle='#446d58';ctx.lineWidth=6;ctx.strokeRect(3,3,width-6,height-6);
}
