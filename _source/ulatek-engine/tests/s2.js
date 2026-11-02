const p=require('puppeteer-core');
(async()=>{
 const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1100,height:900});
 pg.on('pageerror',e=>console.log('ERR',e.message));
 await pg.goto('file:///tmp/claude-0/-home-claude/3d8e8948-9820-51c0-a301-35145c3d24be/scratchpad/ulatek/ulatek-heroic-guide.html');
 await new Promise(r=>setTimeout(r,800));
 const fig=await pg.$('figure[data-scene="p2"]'); await fig.scrollIntoView();
 const pips=await fig.$$('.pips button'); console.log('pips',pips.length);
 const btns=await fig.$$('.ctrl button'); await btns[1].click();
 for(const k of (process.argv[2]||'0,1,2,3,4,5,6,7,8,9').split(',').map(Number)){
   await pips[k].click(); await new Promise(r=>setTimeout(r,1300));
   const el=await fig.$('.stage'); await el.screenshot({path:`p2-${k}.png`});
 }
 // jump test
 const snap=()=>pg.evaluate(()=>[...document.querySelectorAll('figure[data-scene="p2"] .ent')].map(e=>(+e.style.opacity<0.05?'hidden':(e.getAttribute('transform')||'')+'|'+(+e.style.opacity).toFixed(2))).join(';'));
 const seq=[]; for(let k=0;k<pips.length;k++){ await pips[k].click(); await new Promise(r=>setTimeout(r,1300)); seq.push(await snap()); }
 let bad=0; for(const k of [9,3,7,0,6,2,8,5,1,4]){ await pips[k].click(); await new Promise(r=>setTimeout(r,1300)); if(await snap()!==seq[k]){bad++;console.log('mismatch',k);} }
 console.log('mismatches',bad);
 await b.close();
})();
