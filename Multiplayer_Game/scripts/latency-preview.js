// Development-only reverse proxy: preserves message order and adds latency to
// server responses so immediate previews can be inspected without changing production.
import { createServer, request } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';

const port=Number(process.env.PREVIEW_PORT||3001),delay=Number(process.env.PREVIEW_DELAY||1500);
const server=createServer((req,res)=>{
  const upstream=request({hostname:'127.0.0.1',port:3000,path:req.url,method:req.method},response=>{res.writeHead(response.statusCode,response.headers);response.pipe(res);});
  upstream.on('error',()=>{res.writeHead(502);res.end('Start the game on port 3000 first');});req.pipe(upstream);
});
const wss=new WebSocketServer({server,maxPayload:8192,perMessageDeflate:false,
  verifyClient:info=>info.req.url==='/socket'&&[`http://localhost:${port}`,`http://127.0.0.1:${port}`].includes(info.origin)});
wss.on('connection',downstream=>{
  const upstream=new WebSocket('ws://127.0.0.1:3000/socket',{origin:'http://127.0.0.1:3000'});
  const queued=[],timers=new Set();
  downstream.on('message',(data,binary)=>{if(upstream.readyState===1)upstream.send(data,{binary});else if(queued.length<64)queued.push([data,binary]);else downstream.close(1013);});
  upstream.on('open',()=>{for(const [data,binary]of queued)upstream.send(data,{binary});queued.length=0;});
  upstream.on('message',(data,binary)=>{const timer=setTimeout(()=>{timers.delete(timer);if(downstream.readyState===1)downstream.send(data,{binary});},delay);timers.add(timer);});
  function close(){for(const timer of timers)clearTimeout(timer);timers.clear();upstream.terminate();downstream.terminate();}
  upstream.on('error',close);downstream.on('error',close);upstream.on('close',close);downstream.on('close',close);
});
server.listen(port,'127.0.0.1',()=>console.log(`Latency preview: http://localhost:${port} · ${delay} ms added to server responses`));
