export function printPage(ctx,art,photo){
 const w=ctx.canvas.width,h=ctx.canvas.height;ctx.fillStyle='#dddac0';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#94aa84';ctx.lineWidth=2;ctx.strokeRect(8,8,w-16,h-16);
 ctx.fillStyle='#496d58';ctx.font='bold 14px Tahoma';ctx.textAlign='center';ctx.textBaseline='middle';
 if(!photo){ctx.fillText('YOUR INSTANT GALLERY',w/2,h/2-12);ctx.font='12px Tahoma';ctx.fillText('Use the camera in the utility room',w/2,h/2+12);return;}
 const scale=Math.min((w-40)/art.width,(h-66)/art.height),width=art.width*scale,height=art.height*scale,x=(w-width)/2,y=18+(h-66-height)/2;
 ctx.fillStyle='#f0eacb';ctx.fillRect(x,y,width,height);ctx.drawImage(art,x,y,width,height);ctx.font='bold 12px Tahoma';ctx.fillText((photo.surface==='towel'?'TOWEL STUDY':'PAPER STUDY')+' / '+String(photo.slot+1).padStart(2,'0'),w/2,h-35);
 ctx.font='11px Tahoma';ctx.fillText(photo.by+' · '+new Date(photo.at).toLocaleDateString(),w/2,h-19,w-28);
}
