import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const [name,width,height] of [['desktop',1100,850],['mobile',390,844]]){
const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
page.on('pageerror',e=>console.log('ERROR',e.message));
await page.goto('http://127.0.0.1:4182/?inspect');await page.evaluate(()=>document.fonts.ready);
console.log(name,await page.locator('body').innerText());
await page.screenshot({path:`output/playwright/${name}-menu.png`});
await page.locator('#go').click();await page.waitForTimeout(6000);
await page.screenshot({path:`output/playwright/${name}-game.png`});
await page.close();
}await browser.close();
