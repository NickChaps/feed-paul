import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html')));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.png':'image/png','.js':'text/javascript','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');res.end(data);});
}).listen(4182,'127.0.0.1',()=>console.log('Feed Paul: http://127.0.0.1:4182'));
