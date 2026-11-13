import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.geojson':'application/geo+json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{const route=decodeURIComponent((req.url||'/').split('?')[0]);if(route==='/'){res.writeHead(302,{Location:'/src/index.html'});res.end();return;}const target=path.resolve(root,`.${route}`);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}const info=await fs.stat(target);if(!info.isFile())throw new Error('not file');res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(await fs.readFile(target));}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}});
server.listen(Number(process.env.PORT||8090),'127.0.0.1',()=>console.log(`渝北 WebGIS: http://localhost:${process.env.PORT||8090}/`));
