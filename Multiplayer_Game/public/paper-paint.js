import {strokeSteps} from './paint.js';
import {wrappedPoints} from './paper.js';
export function drawPaperStroke(ctx,stroke){for(const step of paperSteps(ctx,stroke)){} }
export function* paperSteps(ctx,stroke){for(const points of wrappedPoints(stroke.points))for(const offset of [-1,0,1]){ctx.save();try{ctx.translate(offset*ctx.canvas.width,0);yield*strokeSteps(ctx,{...stroke,points});}finally{ctx.restore();}}}
export function paperBase(ctx){const {width,height}=ctx.canvas;ctx.fillStyle='#ede9d1';ctx.fillRect(0,0,width,height);ctx.fillStyle='#c6c5a62b';for(let y=0;y<height;y+=5)ctx.fillRect(0,y,width,1);ctx.fillStyle='#a3a58a22';for(let x=0;x<width;x+=64)ctx.fillRect(x,0,1,height);}
