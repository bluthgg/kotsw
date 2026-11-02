const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const url='file:///tmp/claude-0/-home-claude/3d8e8948-9820-51c0-a301-35145c3d24be/scratchpad/ulatek/ulatek-heroic-guide.html';
const pg=await b.newPage();await pg.setViewport({width:1000,height:900});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(url);await new Promise(r=>setTimeout(r,500));
await pg.evaluate(()=>{[...document.querySelectorAll('#rgrid input')].forEach((i,k)=>{i.value='P'+k;i.dispatchEvent(new Event('input',{bubbles:true}))});});
await new Promise(r=>setTimeout(r,700));
const info=()=>pg.evaluate(()=>[...document.querySelectorAll('.ebtn')].filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.getAttribute('data-egg')+':'+b.closest('.prow').querySelector('input').value+':'+b.closest('.prow').querySelector('.gbtn').textContent));
// choose last M of odds & evens
const ids=await pg.evaluate(()=>[...document.querySelectorAll('.ebtn')].map(b=>[b.getAttribute('data-egg'),b.closest('.prow').querySelector('.gbtn').textContent]));
const odd=ids.find(x=>x[0][0]==='M'&&x[1]==='Odds')[0], ev=ids.filter(x=>x[0][0]==='M'&&x[1]==='Evens').pop()[0];
for(const id of [ids.filter(x=>x[0][0]==='R'&&x[1]==='Odds').pop()[0],ev]) await pg.click(`[data-egg="${id}"]`);
console.log('chosen',await info());
// phase 2 who line on big egg step
await pg.evaluate(()=>document.querySelector('figure[data-scene="p2"]').scrollIntoView());
const pips=await pg.$$('figure[data-scene="p2"] .pips button');
for(let k=0;k<pips.length;k++){await pips[k].click();await new Promise(r=>setTimeout(r,200));const t=await pg.evaluate(()=>document.querySelector('figure[data-scene="p2"] .cap-t').textContent);if(/Big egg goes/.test(t)){console.log(k,await pg.evaluate(()=>document.querySelector('figure[data-scene="p2"] .who')?document.querySelector('figure[data-scene="p2"] .who').innerText:'nowho'));}}
// share round trip
await pg.evaluate(()=>[...document.querySelectorAll('.rshare button')][0].click());
const link=await pg.evaluate(()=>document.querySelector('.rshare input').value);
const pg2=await b.newPage();await pg2.goto(link);await new Promise(r=>setTimeout(r,600));
console.log('link len',link.length,'after link',await pg2.evaluate(()=>[...document.querySelectorAll('.ebtn')].filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.getAttribute('data-egg'))));
// switch group clears
const sel=await pg.evaluate(()=>{const b=[...document.querySelectorAll('.ebtn')].find(b=>b.getAttribute('aria-pressed')==='true');return b.getAttribute('data-egg')});
await pg.evaluate((id)=>document.querySelector(`.gbtn[data-id="${id}"]`).click(),sel);
console.log('after switching group',await info());
await pg.evaluate(()=>document.querySelector('#rgrid').scrollIntoView());await pg.screenshot({path:'eg.png'});
console.log('errs',errs.join('|'));await b.close()})()
