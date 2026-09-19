import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {observe} from './pixel-reader.mjs';
const dir=`output/fair-play/${Date.now()}`;await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:980,height:780},deviceScaleFactor:1,recordVideo:{dir,size:{width:980,height:780}},acceptDownloads:true});
await context.addInitScript(()=>{
 const original=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(destination,...rest){
  if(destination instanceof AudioDestinationNode){
   if(!window.audioCapture){const sink=this.context.createMediaStreamDestination();const chunks=[];const recorder=new MediaRecorder(sink.stream,{mimeType:'audio/webm;codecs=opus'});recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'audio/webm'}));a.download='audio.webm';a.click();};recorder.start(1000);window.audioCapture={sink,recorder,start:Date.now()};}
   original.call(this,audioCapture.sink);
  }return original.call(this,destination,...rest);
 };
});
const beforePage=Date.now();const page=await context.newPage(),video=page.video();
await page.goto('https://nickchaps.github.io/feed-paul/');await page.evaluate(()=>document.fonts.ready);
console.log('MENU',await page.locator('[data-diff="1"]').getAttribute('aria-pressed'));
await page.locator('#pick-paul').click();await page.waitForTimeout(3000);await page.locator('#go').click();
const started=Date.now();let prev=[],prevTime=Date.now(),lastTarget=340,lastHeckle=0;const logs=[];
while(Date.now()-started<75000){
 if(await page.locator('#s-over').isVisible())break;
 const buf=await page.screenshot();const seen=observe(buf),now=Date.now(),elapsed=(now-started)/1000,dt=(now-prevTime)/1000;
 const ground=660,catchY=623;const hero=seen.hero??lastTarget;
 const slides=seen.slides.map(s=>{const old=prev.find(o=>Math.abs(o.x-s.x)<5&&Math.abs(o.y-s.y)<100);const measured=old&&dt>0?(s.y-old.y)/dt:0;const speed=measured>80&&measured<650?measured:250+elapsed*2.3;return {...s,arrival:(catchY-s.y)/speed};}).filter(s=>s.arrival>-.08);
 const targets=slides.filter(s=>s.good&&s.arrival<1.6&&Math.abs(s.x-hero)/1300<s.arrival+.14).sort((a,b)=>(a.arrival+(Math.abs(a.x-hero)/980)*.12-(a.gold?.3:0))-(b.arrival+(Math.abs(b.x-hero)/980)*.12-(b.gold?.3:0)));
 let target=targets[0]?.x??hero;
 const imminent=slides.filter(s=>!s.good&&s.arrival<.48&&s.arrival>-.04);
 if(imminent.some(s=>Math.abs(s.x-target)<66)){
  const options=Array.from({length:17},(_,i)=>64+i*(852/16));let best=Infinity;
  for(const x of options){let cost=Math.abs(x-target)*.02+Math.abs(x-hero)*.003;for(const s of imminent)if(Math.abs(s.x-x)<70)cost+=100;const imminentGood=targets.find(s=>s.arrival<.25);if(imminentGood&&Math.abs(x-imminentGood.x)<52)cost-=10;if(cost<best){best=cost;target=x;}}
 }
 target=Math.max(64,Math.min(916,target));await page.mouse.move(target,650);lastTarget=target;
 if(elapsed>6&&elapsed-lastHeckle>7.2){await page.keyboard.press('ArrowUp');lastHeckle=elapsed;}
 logs.push({elapsed,active:seen.active,hero,target,slides});if(logs.length%50===0)console.log('PLAY',elapsed.toFixed(1),logs.length);
 prev=seen.slides;prevTime=now;await page.waitForTimeout(55);
}
const result={left:await page.locator('#r-left').innerText(),right:await page.locator('#r-right').innerText(),verdict:await page.locator('#r-eyebrow').innerText(),breakdown:await page.locator('#r-breakdown').innerText(),cohesion:await page.locator('#r-coh').innerText(),difficulty:'Competent',pixelOnly:true};
await page.screenshot({path:dir+'/result.png'});console.log('RESULT',result);
await page.waitForTimeout(5000);
const download=page.waitForEvent('download');const audioStart=await page.evaluate(()=>{audioCapture.recorder.stop();return audioCapture.start;});await(await download).saveAs(dir+'/audio.webm');
await page.close();await video.saveAs(dir+'/screen.webm');await browser.close();
await fs.writeFile(dir+'/result.json',JSON.stringify({...result,audioOffset:(audioStart-beforePage)/1000},null,2));await fs.writeFile(dir+'/observations.json',JSON.stringify(logs));console.log('SAVED',dir);
