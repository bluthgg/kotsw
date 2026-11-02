const p=require('puppeteer-core');
(async()=>{
 const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1100,height:900});
 pg.on('pageerror',e=>console.log('ERR',e.message));
 await pg.goto('file:///tmp/claude-0/-home-claude/3d8e8948-9820-51c0-a301-35145c3d24be/scratchpad/ulatek/ulatek-heroic-guide.html');
 await new Promise(r=>setTimeout(r,800));
 const fig=await pg.$('figure[data-scene="p1"]');
 await fig.scrollIntoView();
 const pips=await fig.$$('.pips button');
 console.log('pips',pips.length);
 // pause autoplay
 const btns=await fig.$$('.ctrl button'); await btns[1].click();
 for(const k of [1,2,10,11]){
   await pips[k].click(); await new Promise(r=>setTimeout(r,900));
   const st=await pg.evaluate(()=>[...document.querySelectorAll('figure[data-scene="p1"] .ent.egg')].map(e=>e.getAttribute('class')+':'+e.style.opacity).join(' | '));
   console.log(k,st);
   const el=await fig.$('.stage'); await el.screenshot({path:`p1-${k}.png`});
 }
 await b.close();
})();
