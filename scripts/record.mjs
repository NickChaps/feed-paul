import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page=await browser.newPage({viewport:{width:980,height:780},deviceScaleFactor:1,acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 const connect=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(destination,...rest){
   if(destination instanceof AudioDestinationNode){
     if(!window.captureAudio) window.captureAudio=this.context.createMediaStreamDestination();
     connect.call(this,window.captureAudio);
   }
   return connect.call(this,destination,...rest);
 };
 // A repeatable performance; randomness still follows the game's rules.
 let seed=193719;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
});
await page.goto('http://127.0.0.1:4182/?inspect');await page.evaluate(()=>document.fonts.ready);
await page.addStyleTag({content:'#app{padding:0;gap:0}footer{display:none}#stage{border:0;border-radius:0;max-width:none}'});
await page.locator('#go').click();
await page.evaluate(()=>{
 const c=document.createElement('canvas');c.width=1080;c.height=1080;window.filmCanvas=c;
 const g=c.getContext('2d'),game=document.querySelector('#cv');
 const stream=c.captureStream(30);captureAudio.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
 const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus',videoBitsPerSecond:10000000,audioBitsPerSecond:192000});
 const chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);
 recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));a.download='Feed-Paul-full.webm';a.click();};
 const started=performance.now();let endAt=null, nextHeckle=12;
 const title=(text,y,size=32,color='#141413',font='Schibsted Grotesk')=>{g.fillStyle=color;g.font=`500 ${size}px "${font}"`;g.textAlign='center';g.fillText(text,540,y);};
 function draw(){
   const s=feedPaul.state,t=(performance.now()-started)/1000;
   if(s.phase==='play'){feedPaul.steer();if(t>=nextHeckle){feedPaul.heckle();nextHeckle+=14;}}
   g.fillStyle='#F7F3EA';g.fillRect(0,0,1080,1080);
   g.textAlign='left';g.fillStyle='#141413';g.font='500 64px "Newsreader"';g.fillText('Feed Paul',46,76);
   g.font='500 18px "IBM Plex Mono"';g.textAlign='right';g.fillStyle='#87867F';g.fillText('60 SECONDS. ONE DECK.',1034,52);
   g.font='500 16px "IBM Plex Mono"';g.fillText('GAMEPLAY DEMO',1034,79);
   g.strokeStyle='#D9D7C7';g.beginPath();g.moveTo(46,106);g.lineTo(1034,106);g.stroke();
   g.save();g.translate(36,128);g.drawImage(game,0,0,1008,802);g.restore();
   let caption=s.heckleTime>0?'↑ Heckle your opponent.':t<12?'Catch the right template.':t<24?'New brief. New rules.':t<42?'Protect your brand cohesion.':t<55?'A gold master fits every template.':'Make every slide count.';
   if(s.phase==='over'){
     if(endAt===null)endAt=t+5;
     g.fillStyle='rgba(247,243,234,.96)';g.fillRect(36,128,1008,802);
     title(document.querySelector('#r-eyebrow').textContent.toUpperCase(),340,21,'#87867F','IBM Plex Mono');
     title(`${feedPaul.finalScore(s.me)}  /  ${feedPaul.finalScore(s.foe)}`,475,112,'#1685D6','IBM Plex Mono');
     title('PAUL                       THE OTHER',520,20,'#3D3929','IBM Plex Mono');
     title(`${s.me.pts} points × ${Math.round(s.me.coh)}% cohesion`,582,28);
     title('Your turn.',718,64,'#141413','Newsreader');
     title('nickchaps.github.io/feed-paul',775,27,'#1685D6');
     caption='Can your deck survive review?';
   }
   title(caption,974,32);
   title('@Nicolas_chap  ·  Created with Claude Opus 5',1030,21,'#87867F');
   if(endAt!==null&&t>=endAt){window.filmResult={duration:t,points:s.me.pts,cohesion:s.me.coh,score:feedPaul.finalScore(s.me),opponent:feedPaul.finalScore(s.foe)};recorder.stop();return;}
   requestAnimationFrame(draw);
 }
 recorder.start(1000);draw();
});
const download=page.waitForEvent('download',{timeout:100000});
await page.waitForTimeout(12700);
await fs.writeFile('output/playwright/video-frame.png',Buffer.from(await page.evaluate(()=>filmCanvas.toDataURL('image/png').split(',')[1]),'base64'));
const file=await download;await file.saveAs('output/Feed-Paul-full.webm');
const result=await page.evaluate(()=>filmResult);result.errors=errors;await fs.writeFile('output/recording.json',JSON.stringify(result,null,2));console.log(result);await browser.close();
