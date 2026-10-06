import{mergeStatic}from'./performance.js';
export function toothpasteAvatar(THREE,material,color){
 const group=new THREE.Group();
 function part(geometry,tint,x,y,z){const m=new THREE.Mesh(geometry,material(tint));m.position.set(x,y,z);group.add(m);return m;}
 const body=part(new THREE.CylinderGeometry(.29,.38,1.64,16),'#d7dbb9',0,1.08,0);body.scale.z=.66;
 const shoulder=part(new THREE.SphereGeometry(1,12,6),'#c3d1a9',0,1.84,0);shoulder.scale.set(.29,.18,.19);
 part(new THREE.CylinderGeometry(.18,.20,.22,12),'#aac198',0,2.04,0);
 for(let i=0;i<4;i++)part(new THREE.TorusGeometry(.185,.012,4,12),'#537f62',0,1.96+i*.05,0).rotation.x=Math.PI/2;
 part(new THREE.CylinderGeometry(.30,.30,.20,16),color,0,.16,0);
 for(let i=0;i<16;i++){const a=i*Math.PI/8,m=part(new THREE.BoxGeometry(.021,.16,.022),'#5c7f69',Math.sin(a)*.303,.16,Math.cos(a)*.303);m.rotation.y=a;}
 const seam=part(new THREE.BoxGeometry(.67,.085,.11),color,0,.35,0);seam.rotation.z=.02;
 for(let i=0;i<8;i++)part(new THREE.BoxGeometry(.012,.055,.015),'#507b62',-.245+i*.07,.35,-.06);
 for(const side of [-1,1]){const eye=part(new THREE.SphereGeometry(.032,8,6),'#34564c',side*.085,1.81,-.178);eye.scale.z=.4;part(new THREE.SphereGeometry(.009,6,4),'#e5e8ce',side*.085-.009,1.82,-.191);}
 part(new THREE.BoxGeometry(.075,.013,.018),'#658776',0,1.74,-.193);
 const frame=part(new THREE.BoxGeometry(.54,.66,.025),'#507a62',0,1.15,-.252);
 const back=part(new THREE.BoxGeometry(.46,.67,.02),color,0,1.15,.249);
 mergeStatic(THREE,group,new Set());for(const mesh of group.children)mesh.userData.ownMaterial=true;
 const label=new THREE.Mesh(new THREE.PlaneGeometry(.48,.60),new THREE.MeshLambertMaterial({color:'#d5dbb9'}));label.position.set(0,1.15,-.270);label.rotation.y=Math.PI;label.userData.ownMaterial=true;group.add(label);group.userData.label=label;
 return group;
}
