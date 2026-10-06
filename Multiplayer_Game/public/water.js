// Short falling streaks accelerate from the head; no line spans head to floor.
export function showerStreaks(buffer,count,time){
 for(let i=0;i<count;i++){const phase=((time*.85+i*.618)%1+1)%1,drop=phase*phase*4,x=6.9+Math.sin(i*7)*.19,z=-1.3+Math.cos(i*11)*.19,y=4.34-drop,length=.06+phase*.18;buffer.set([x+Math.sin(i)*phase*.12,Math.max(.34,y),z+Math.cos(i)*phase*.12,x+Math.sin(i)*phase*.12,Math.max(.34,y-length),z+Math.cos(i)*phase*.12],i*6);}
}
