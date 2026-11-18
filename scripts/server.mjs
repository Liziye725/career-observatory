// Local-only server. Sites production access is enforced by its private gateway.
import http from 'node:http';import worker from '../dist/server/index.js';import {openDatabase,bucket} from '../src/database.mjs';
const db=openDatabase(),BUCKET=bucket(db),port=Number(process.env.PORT||8787);
const server=http.createServer(async(req,res)=>{try{
 if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){res.writeHead(403);return res.end('Invalid host');}
 let data=[],size=0;for await(const c of req){size+=c.length;if(size>550000){res.writeHead(413);return res.end();}data.push(c);}
 const r=await worker.fetch(new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(data)}:{})}),{BUCKET});
 res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Local server error');}});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>server.close(()=>{db.close();process.exit(0);}));
