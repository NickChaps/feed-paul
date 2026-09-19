import {inflateSync} from 'node:zlib';
export function png(buffer){
 let width,height,type,parts=[];
 for(let pos=8;pos<buffer.length;){const n=buffer.readUInt32BE(pos),kind=buffer.toString('ascii',pos+4,pos+8),d=buffer.subarray(pos+8,pos+8+n);if(kind==='IHDR'){width=d.readUInt32BE(0);height=d.readUInt32BE(4);type=d[9];if(d[8]!==8)throw Error('Expected 8-bit PNG');}if(kind==='IDAT')parts.push(d);pos+=12+n;}
 const bpp=type===6?4:3,stride=width*bpp,raw=inflateSync(Buffer.concat(parts)),pixels=Buffer.alloc(stride*height);let k=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[k++];for(let x=0;x<stride;x++){const a=x>=bpp?pixels[y*stride+x-bpp]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=bpp?pixels[(y-1)*stride+x-bpp]:0;let v=raw[k++];if(filter===1)v+=a;if(filter===2)v+=b;if(filter===3)v+=Math.floor((a+b)/2);if(filter===4)v+=paeth(a,b,c);pixels[y*stride+x]=v&255;}}
 return {width,height,at(x,y){const o=(Math.round(y)*width+Math.round(x))*bpp;return [pixels[o],pixels[o+1],pixels[o+2]];}};
}
const distance=(a,b)=>Math.sqrt(a.reduce((v,c,i)=>v+(c-b[i])**2,0));
export function observe(buffer){
 const im=png(buffer),w=im.width,h=im.height;
 // Everything below is inferred from the rendered pixels, never from game objects.
 const active=im.at(Math.round(w/2-96),46);
 const groups=[];
 for(let y=115;y<h-90;y+=2){
  for(let x=8;x<w-8;){const color=im.at(x,y);const chroma=Math.max(...color)-Math.min(...color);if(chroma<16||Math.max(...color)>245){x++;continue;}
   let end=x+1;while(end<w-8&&distance(im.at(end,y),color)<4)end++;
   const len=end-x;
   if(len>=57&&len<=82){
    let g=groups.find(g=>Math.abs(g.left-x)<4&&Math.abs(g.right-end)<4&&y-g.bottom<9&&distance(g.color,color)<8);
    if(!g){g={left:x,right:end,top:y,bottom:y,color,rows:0};groups.push(g);}g.bottom=y;g.rows++;
   }x=end;
  }
 }
 const slides=groups.filter(g=>g.rows>=2&&g.bottom-g.top>=2).filter(g=>!(g.color[2]>170&&g.color[0]<50)&&!(g.color[0]>170&&g.color[1]>75&&g.color[1]<150&&g.color[2]<110)).map(g=>{
  const x=(g.left+g.right)/2,y=g.top+23;let pink=0;
  for(let yy=g.top;yy<Math.min(g.top+49,h);yy+=2)for(let xx=g.left;xx<g.right;xx+=2){const c=im.at(xx,yy);if(c[0]>130&&c[2]>85&&c[0]-c[1]>45&&c[2]-c[1]>20)pink++;}
  const gold=g.color[0]>195&&g.color[1]>130&&g.color[2]<55;
  return {x,y,color:g.color,gold,pink,good:gold||(distance(g.color,active)<18&&pink<2)};
 });
 let sum=0,n=0;for(let y=h-230;y<h-85;y+=3)for(let x=35;x<w-35;x+=3){const c=im.at(x,y);if(c[2]>170&&c[0]<50&&c[1]>85&&c[1]<165){sum+=x;n++;}}
 return {active,slides,hero:n?sum/n:null,width:w,height:h};
}
