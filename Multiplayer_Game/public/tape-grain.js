// Deterministic correlated tape noise; one reused low-resolution pixel buffer.
const columns=new Map();
export function tapeGrain(data,width,height,tick,strength=1){
 let seed=(417+Math.imul(tick,7013))>>>0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed>>>24;};
 let wave=columns.get(width);if(!wave){wave=new Float32Array(width);columns.set(width,wave);}for(let x=0;x<width;x++)wave[x]=Math.sin(x*.21+tick*.13);
 const dropout=(tick%137)>128,rowStart=(tick*11)%height;
 for(let y=0;y<height;y++){
  const rowNoise=random()-128,rowWave=Math.cos(y*.27-tick*.17),head=y>height*.90?(Math.sin(y*1.7+tick*.8)+1)*7:0;
  for(let x=0;x<width;x++){
   const i=(y*width+x)*4,n=random(),fine=n-128,clump=wave[x]*rowWave,chroma=random()-128;
   const streak=dropout&&Math.abs(y-rowStart)<2&&x>(tick*17)%width?16:0;
   data[i]=Math.max(70,Math.min(240,177+fine*.35+chroma*.13));data[i+1]=Math.max(80,Math.min(245,192+fine*.31));data[i+2]=Math.max(65,Math.min(235,167+fine*.34-chroma*.10));
   data[i+3]=Math.min(62,Math.round((3+Math.abs(fine)*.14+Math.abs(rowNoise)*.04+Math.abs(clump)*5+head+streak)*strength));
  }
 }
}
