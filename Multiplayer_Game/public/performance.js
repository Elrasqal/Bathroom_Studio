export const QUALITY={
  mobile:{scale:.55,maxPixels:360000,shadows:false,steam:8,water:18,effectHz:8,fogHz:4},
  fast:{scale:.7,maxPixels:650000,shadows:false,steam:12,water:24,effectHz:10,fogHz:5},
  balanced:{scale:1,maxPixels:1200000,shadows:false,steam:24,water:32,effectHz:20,fogHz:8},
  detailed:{scale:1.5,maxPixels:2200000,shadows:true,steam:64,water:36,effectHz:30,fogHz:10}
};
export function renderRatio(width,height,dpr,quality='fast'){
  const profile=QUALITY[quality]||QUALITY.fast;
  return Math.min(dpr,profile.scale,Math.sqrt(profile.maxPixels/Math.max(1,width*height)));
}
// Merge world-space static geometry without a dependency or additional runtime draw calls.
export function mergeStatic(THREE,scene,excluded){
  const groups=new Map(),colored=new THREE.MeshLambertMaterial({vertexColors:true});
  for(const object of scene.children){
    if(!object.isMesh||object.userData.action||excluded.has(object)||object.children.length)continue;
    const material=object.material;
    const canColor=material.isMeshLambertMaterial&&material.side===THREE.FrontSide&&!material.map&&!material.transparent&&material.emissive.getHex()===0;
    const key=canColor?colored:material;
    const group=groups.get(key)||[];group.push(object);groups.set(key,group);
  }
  let removed=0;
  for(const [material,objects]of groups){
    if(objects.length<2)continue;
    const parts=[],instanceMatrix=new THREE.Matrix4(),matrix=new THREE.Matrix4();
    for(const object of objects){
      object.updateMatrixWorld(true);
      for(let instance=0;instance<(object.isInstancedMesh?object.count:1);instance++){
        const part=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
        if(object.isInstancedMesh){object.getMatrixAt(instance,instanceMatrix);matrix.multiplyMatrices(object.matrixWorld,instanceMatrix);}else matrix.copy(object.matrixWorld);
        part.applyMatrix4(matrix);
        if(material===colored){const colors=new Float32Array(part.attributes.position.count*3),color=object.material.color;for(let i=0;i<colors.length;i+=3){colors[i]=color.r;colors[i+1]=color.g;colors[i+2]=color.b;}part.setAttribute('color',new THREE.BufferAttribute(colors,3));}
        parts.push(part);
      }
    }
    const geometry=new THREE.BufferGeometry();
    for(const [name,size]of [['position',3],['normal',3],['uv',2],['color',3]]){
      if(!parts.every(part=>part.getAttribute(name)))continue;
      const values=new Float32Array(parts.reduce((sum,part)=>sum+part.getAttribute(name).array.length,0));let offset=0;
      for(const part of parts){values.set(part.getAttribute(name).array,offset);offset+=part.getAttribute(name).array.length;}
      geometry.setAttribute(name,new THREE.BufferAttribute(values,size));
    }
    geometry.computeBoundingSphere();geometry.computeBoundingBox();
    const batch=new THREE.Mesh(geometry,material);batch.castShadow=true;batch.receiveShadow=true;scene.add(batch);
    for(const part of parts)part.dispose();
    for(const object of objects){scene.remove(object);object.geometry.dispose();if(object.isInstancedMesh)object.dispose();}
    removed+=objects.length-1;
  }
  return removed;
}
