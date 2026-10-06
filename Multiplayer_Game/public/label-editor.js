import{labelCrop,drawLabel}from'./labels.js';
export function createLabelEditor({apply,onClose=()=>{}}){
 const dialog=document.getElementById('label-editor'),stage=document.getElementById('label-source'),preview=document.getElementById('label-preview'),stageCtx=stage.getContext('2d'),previewCtx=preview.getContext('2d');
 const input=id=>document.getElementById('label-'+id);let source=null,crop=null,view=null,drag=null,waiting=false;
 function redraw(){if(!source)return;crop=labelCrop(source.width,source.height,+input('zoom').value,+input('x').value,+input('y').value);const scale=Math.min((stage.width-24)/source.width,(stage.height-24)/source.height);view={x:(stage.width-source.width*scale)/2,y:(stage.height-source.height*scale)/2,w:source.width*scale,h:source.height*scale};stageCtx.fillStyle='#53715e';stageCtx.fillRect(0,0,stage.width,stage.height);stageCtx.drawImage(source,view.x,view.y,view.w,view.h);stageCtx.fillStyle='#243f3860';stageCtx.beginPath();stageCtx.rect(view.x,view.y,view.w,view.h);stageCtx.rect(view.x+crop.x*view.w,view.y+crop.y*view.h,crop.w*view.w,crop.h*view.h);stageCtx.fill('evenodd');stageCtx.strokeStyle='#e9ecd2';stageCtx.lineWidth=2;stageCtx.setLineDash([7,5]);stageCtx.strokeRect(view.x+crop.x*view.w,view.y+crop.y*view.h,crop.w*view.w,crop.h*view.h);stageCtx.setLineDash([]);drawLabel(previewCtx,source,crop);}
 for(const id of ['zoom','x','y'])input(id).oninput=redraw;
 stage.onpointerdown=e=>{if(waiting||!source||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,panX:+input('x').value,panY:+input('y').value};stage.setPointerCapture(e.pointerId);};
 stage.onpointermove=e=>{if(drag?.id!==e.pointerId)return;const bounds=stage.getBoundingClientRect();input('x').value=Math.max(0,Math.min(1,drag.panX+(e.clientX-drag.x)*stage.width/bounds.width/(view.w*Math.max(.001,1-crop.w))));input('y').value=Math.max(0,Math.min(1,drag.panY+(e.clientY-drag.y)*stage.height/bounds.height/(view.h*Math.max(.001,1-crop.h))));redraw();};
 stage.onpointerup=stage.onpointercancel=stage.onlostpointercapture=e=>{if(drag?.id===e.pointerId)drag=null;};
 input('reset').onclick=()=>{input('zoom').value=1;input('x').value=input('y').value=.5;redraw();};
 input('cancel').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{drag=null;source=null;waiting=false;onClose();});
 input('apply').onclick=()=>{if(waiting||!crop)return;waiting=true;input('apply').disabled=true;apply({...crop});};
 return{open(canvas){source=canvas;input('zoom').value=1;input('x').value=input('y').value=.5;waiting=false;input('apply').disabled=false;redraw();dialog.showModal();},close(){if(dialog.open)dialog.close();},failed(){waiting=false;input('apply').disabled=false;},active:()=>dialog.open};
}
