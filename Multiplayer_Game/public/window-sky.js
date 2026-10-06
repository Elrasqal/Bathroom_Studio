// Approximate synodic phase from the January 2000 new-moon epoch (NASA tables).
// Phase depends on date; without location we do not claim local rise/set or orientation.
export function moonPhase(now=Date.now()){const age=(now-Date.UTC(2000,0,6,18,14))/(86400000*29.530588853);return((age%1)+1)%1;}
export function skyPicture(ctx,mode,time,now=Date.now()){
 const w=ctx.canvas.width,h=ctx.canvas.height,night=mode==='night',sunset=mode==='evening',gradient=ctx.createLinearGradient(0,0,0,h);
 gradient.addColorStop(0,night?'#1c344c':sunset?'#756d99':'#79b8c6');gradient.addColorStop(.7,night?'#536c7a':sunset?'#d89980':'#c5ddd0');gradient.addColorStop(1,night?'#849690':sunset?'#e7b784':'#d6ddad');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
 if(night){ctx.fillStyle='#c8d3c3';for(let i=0;i<35;i++)ctx.fillRect((Math.sin(i*63.7)*.48+.5)*w,(Math.cos(i*24.1)*.38+.4)*h,1,1);}
 const cx=w*.73,cy=h*(sunset?.58:.27),r=w*.065;
 ctx.fillStyle=night?'#dddcc5':sunset?'#f4c598':'#ede9bd';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
 if(night){const phase=moonPhase(now),light=(1-Math.cos(phase*Math.PI*2))/2;ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();ctx.fillStyle='#344d62';if(light<.5){ctx.fillRect(cx-r,cy-r,r*2,r*2);ctx.fillStyle='#dddcc5';ctx.beginPath();ctx.ellipse(cx+(phase<.5?1:-1)*r*(1-light*2),cy,r,r,0,0,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.ellipse(cx+(phase<.5?-1:1)*r,cy,r*(2-light*2),r,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
 ctx.fillStyle=night?'rgba(159,180,181,.24)':sunset?'rgba(234,204,171,.65)':'rgba(236,243,216,.7)';
 for(let i=0;i<5;i++){const x=((i*.29+time*.002)%1.5-.2)*w,y=h*(.18+i%3*.17);ctx.beginPath();ctx.ellipse(x,y,w*.14,h*.025,0,0,Math.PI*2);ctx.ellipse(x+w*.03,y-h*.018,w*.07,h*.04,0,0,Math.PI*2);ctx.fill();}
 // One sagging powerline, distant roofline and an occasional passing plane.
 ctx.strokeStyle=night?'#283e40':'#52695d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,h*.67);ctx.quadraticCurveTo(w*.5,h*.8,w,h*.66);ctx.stroke();
 ctx.fillStyle=night?'#283e40':'#6f8b72';ctx.fillRect(0,h*.92,w,h*.08);
 const flight=(time%160)/160;if(flight<.35){const x=(flight/.35*1.4-.2)*w,y=h*.43;ctx.fillStyle=night?'#b8c8bc':'#617f78';ctx.fillRect(x,y,12,2);ctx.fillRect(x+5,y-4,2,9);ctx.fillRect(x+10,y-2,2,5);}
}
