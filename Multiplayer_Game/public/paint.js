export const TOOLS = ['squeeze', 'brush', 'spray', 'sponge', 'stamp'];
export const STAMP_PATTERNS = ['duck', 'bubbles', 'flower', 'tile'];
// Shared geometry keeps physical pad previews and durable paint impressions identical.
export function stampShape(ctx, pattern, r) {
  ctx.beginPath();
  if(pattern==='bubbles'){
    ctx.lineWidth=r*.13;
    for(const [x,y,size]of [[-.4,.2,.52],[.4,-.35,.4],[-.35,-.65,.23]]){ctx.moveTo((x+size)*r,y*r);ctx.arc(x*r,y*r,size*r,0,Math.PI*2);}ctx.stroke();
  }else if(pattern==='flower'){
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2,x=Math.cos(a)*r*.55,y=Math.sin(a)*r*.55;ctx.moveTo(x+r*.38,y);ctx.arc(x,y,r*.38,0,Math.PI*2);}ctx.fill();
    ctx.beginPath();ctx.arc(0,0,r*.19,0,Math.PI*2);ctx.fill();
  }else if(pattern==='tile'){
    ctx.moveTo(0,-r);ctx.lineTo(r,0);ctx.lineTo(0,r);ctx.lineTo(-r,0);ctx.closePath();ctx.lineWidth=r*.14;ctx.stroke();ctx.fillRect(-r*.2,-r*.2,r*.4,r*.4);
  }else{
    ctx.arc(0,0,r*.7,0,Math.PI*2);ctx.arc(r*.45,-r*.6,r*.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(r*.7,-r*.7);ctx.lineTo(r*1.15,-r*.5);ctx.lineTo(r*.7,-r*.3);ctx.fill();
  }
}
export function seedFor(id) {
  let hash = 2166136261;
  for (const character of id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

// Authoritative paint stays separate from predictions, so rejecting local work
// never removes another artist's accepted strokes.
export class Predictions {
  constructor() { this.pending = new Map(); }
  add(command, sentAt) {
    if (this.pending.size >= 64) return false;
    this.pending.set(command.id, { command, sentAt }); return true;
  }
  accept(stroke, self, now) {
    if (stroke.player !== self) return null;
    const prediction = this.pending.get(stroke.id); this.pending.delete(stroke.id);
    return prediction ? now - prediction.sentAt : null;
  }
  reject(id) { return this.pending.delete(id); }
  clear() { this.pending.clear(); }
  values() { return [...this.pending.values()].map(value => value.command); }
}

export function drawStroke(ctx,stroke,width,height){for(const step of strokeSteps(ctx,stroke,width,height)){} }
export function* strokeSteps(ctx, stroke, width = ctx.canvas?.width ?? 512, height = ctx.canvas?.height ?? 640) {
  const tool = stroke.tool || 'squeeze', radius = stroke.size * width / 2;
  const points = stroke.points.map(([x,y]) => [x*width,y*height]);
  ctx.save();try{ctx.fillStyle = ctx.strokeStyle = stroke.color;
  ctx.lineWidth = radius*2; ctx.lineCap = ctx.lineJoin = 'round';
  if (tool === 'sponge') ctx.globalCompositeOperation = 'destination-out';
  if (tool === 'squeeze' || tool === 'sponge') {
    ctx.beginPath(); points.forEach(([x,y],index) => index ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke();
    if (points.length === 1) { ctx.beginPath(); ctx.arc(...points[0],radius,0,Math.PI*2); ctx.fill(); }
  } else {
    let seed = stroke.seed ?? seedFor(stroke.id);
    const random = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed/4294967296; };
    function stamp(x,y,angle) {
      if(tool==='stamp'){ctx.save();ctx.translate(x,y);ctx.rotate((stroke.turn||0)*Math.PI/2);stampShape(ctx,stroke.pattern||'duck',radius*2);ctx.restore();
      }else if (tool === 'spray') {
        ctx.globalAlpha = .3;
        for (let dot=0;dot<12;dot++) {
          const a=random()*Math.PI*2,r=Math.sqrt(random())*radius*1.7;
          ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,Math.max(.65,radius*.07),0,Math.PI*2);ctx.fill();
        }
      } else {
        ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=.68;
        for(let bristle=-2;bristle<=2;bristle++)ctx.fillRect(-radius*.3,bristle*radius*.35-radius*.1,radius*.6,radius*.2);
        ctx.restore();
      }
    }
    const totalLength=points.slice(1).reduce((sum,point,index)=>sum+Math.hypot(point[0]-points[index][0],point[1]-points[index][1]),0);
    const spacing=Math.max(2,radius*(tool==='stamp'?4:.4),totalLength/(tool==='stamp'?64:224));
    stamp(...points[0],0);
    yield;
    for(let i=1;i<points.length;i++) {
      const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1];
      const count=Math.max(1,Math.ceil(Math.hypot(dx,dy)/spacing));
      for(let step=1;step<=count;step++){stamp(a[0]+dx*step/count,a[1]+dy*step/count,Math.atan2(dy,dx));if(step%4===0)yield;}
    }
  }
  }finally{ctx.restore();}
}
