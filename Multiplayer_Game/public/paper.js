export const PAPER_IDS=['paper-a','paper-b','paper-c'];
export const PAPER_HOMES={'paper-a':'paper-left-a','paper-b':'paper-left-b','paper-c':'paper-right-a'};
export const PAPER_RADIUS=.19,PAPER_HEIGHT=.36;
export const paperId=value=>PAPER_IDS.includes(value);
export function propLocation(f,id){const value=f.items[id];return typeof value==='object'?value:null;}
export function paperSurface(stroke){return paperId(stroke.surface)?stroke.surface:null;}
export function wrappedPoints(points){if(points.length<2)return [points];const groups=[[points[0]]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0];if(Math.abs(dx)>.5){const u=dx>0?0:1,v=a[1]+(b[1]-a[1])*(u-a[0])/(b[0]+(dx>0?-1:1)-a[0]);groups.at(-1).push([u,v]);groups.push([[1-u,v],b]);}else groups.at(-1).push(b);}return groups;}
export function availableStrokes(room){return room.strokes.filter(s=>paperSurface(s)||((s.towelId||'original')===room.activeTowel&&s.sequence>(room.erasedBefore?.[room.activeTowel]||0)));}
