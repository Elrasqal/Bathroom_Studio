// Corrections invalidate older movement, including packets delayed in transit.
export function movementSync(controls,{send,discard=()=>{}}){
  let revision=0,lastPose='';
  return {
    reset(){revision=0;lastPose='';},
    flush(){
      const pose=controls.pose(),signature=JSON.stringify(pose),path=controls.route();
      if(signature===lastPose&&!path.length)return true;
      if(!send({type:'move',pose,path,revision}))return false;
      controls.clearRoute();lastPose=signature;return true;
    },
    reconcile(message){
      if(!message.correction&&!message.elevation&&!message.recovery)return false;
      if(Number.isSafeInteger(message.revision)&&message.revision<=revision)return false;
      revision=message.revision??revision+1;lastPose='';discard();
      if(message.recovery)controls.reset(message.pose);
      else if(message.elevation)controls.elevate(message.pose);
      else controls.correct(message.pose);
      return true;
    }
  };
}
