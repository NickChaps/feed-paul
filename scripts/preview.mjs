import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});const page=await browser.newPage({viewport:{width:1200,height:800}});
await page.goto('http://127.0.0.1:4182/?inspect');await page.evaluate(()=>document.fonts.ready);
const data=await page.evaluate(()=>{
 const c=document.createElement('canvas');c.width=1200;c.height=630;const g=c.getContext('2d');g.fillStyle='#F7F3EA';g.fillRect(0,0,1200,630);
 g.fillStyle='#1685D6';g.fillRect(60,56,40,5);g.fillStyle='#87867F';g.font='500 17px "IBM Plex Mono"';g.fillText('60 SECONDS TO SURVIVE REVIEW',60,102);
 g.fillStyle='#141413';g.font='500 106px "Newsreader"';g.fillText('Feed Paul',56,218);
 g.font='400 27px "Schibsted Grotesk"';g.fillStyle='#3D3929';g.fillText('Catch the right slides.',60,283);g.fillText('Heckle your opponent.',60,324);g.fillText('Protect the deck.',60,365);
 g.imageSmoothingEnabled=false;g.drawImage(document.querySelector('[data-av="paul"]'),650,177,228,228);g.drawImage(document.querySelector('[data-av="rival"]'),910,205,180,180);
 g.fillStyle='#141413';g.beginPath();g.roundRect(730,104,295,60,12);g.fill();g.font='600 25px "Schibsted Grotesk"';g.fillStyle='#F7F3EA';g.fillText('Nice WordArt.',768,142);
 g.fillStyle='#D9D7C7';g.fillRect(60,491,1080,1);g.fillStyle='#141413';g.font='500 24px "Schibsted Grotesk"';g.fillText('Play in your browser',60,546);
 g.fillStyle='#87867F';g.font='400 19px "Schibsted Grotesk"';g.fillText('@Nicolas_chap · Created with Claude Opus 5',60,588);
 return c.toDataURL('image/png').split(',')[1];
});await fs.writeFile('preview.png',Buffer.from(data,'base64'));await browser.close();
