import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
await fs.writeFile('output/watch.html', '<!doctype html><html><head><meta charset="utf-8"><title>Feed Paul · Video for X</title></head><body style="margin:0;background:#f7f3ea;display:grid;place-items:center;height:100vh"><video controls style="max-width:100%;max-height:100vh" src="Feed-Paul-X.mp4"></video></body></html>');
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});const page=await browser.newPage({viewport:{width:1080,height:1080}});
await page.goto('file://'+path.resolve('output/watch.html'));await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
const metadata=await page.evaluate(()=>{const v=document.querySelector('video');return {duration:v.duration,width:v.videoWidth,height:v.videoHeight}});assert.equal(metadata.width,1080);assert.equal(metadata.height,1080);assert.ok(Math.abs(metadata.duration-38)<.1);
const frames=[];for(const t of [1,13,23,35,37.5]){
await page.evaluate(t=>new Promise(resolve=>{const v=document.querySelector('video');v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;}),t);
await page.screenshot({path:`output/playwright/video-${t}.png`});
frames.push(createHash('sha256').update(await page.locator('video').screenshot()).digest('hex'));}
assert.ok(new Set(frames).size>=4);
await page.evaluate(()=>{const v=document.querySelector('video');v.currentTime=0;return v.play()});await page.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:45000});
const result={...metadata,distinctFrames:new Set(frames).size,ended:true,error:await page.evaluate(()=>document.querySelector('video').error)};assert.equal(result.error,null);await fs.writeFile('output/playwright/video-verification.json',JSON.stringify(result,null,2));console.log(result);await browser.close();
