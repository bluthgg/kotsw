const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [w,h] of [[1100,900],[390,700]]){
const pg=await b.newPage();await pg.setViewport({width:w,height:h});
await pg.goto('file://'+process.argv[2]);await new Promise(r=>setTimeout(r,500));
await pg.evaluate(()=>document.querySelector('#phase-1').scrollIntoView());await new Promise(r=>setTimeout(r,500));
const cur=()=>pg.evaluate(()=>{const f=document.querySelector('#phase-1 figure');const a=f.querySelector('[aria-current=true]');return a&&a.textContent});
// click pip 4 -> pauses
await pg.evaluate(()=>document.querySelectorAll('#phase-1 figure button[aria-label^="Step"]')[3].click());
const c0=await cur();
const play=await pg.evaluateHandle(()=>[...document.querySelectorAll('#phase-1 figure button')].find(x=>/^(Play|Pause)$/.test(x.textContent)));
await play.click();await new Promise(r=>setTimeout(r,300));const c1=await cur();
await new Promise(r=>setTimeout(r,6500));const c2=await cur();
console.log(w,'pip',c0,'after play',c1,'+6.5s',c2);await pg.close();}
await b.close()})()
