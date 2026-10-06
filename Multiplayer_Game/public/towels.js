// Stable identities preserve each artwork when the hanging towel is exchanged.
export const TOWELS = [
  {id:'original',name:'Studio towel',width:2.8,height:3.5,color:'#e8c8a1'},
  {id:'bath',name:'Bath sheet',width:3.2,height:4,color:'#93b6ab'},
  {id:'square',name:'Square towel',width:2.8,height:2.8,color:'#d8b190'},
  {id:'hand',name:'Hand towel',width:1.6,height:2,color:'#d3dbbe'}
];
export const towelById=id=>TOWELS.find(towel=>towel.id===id);
