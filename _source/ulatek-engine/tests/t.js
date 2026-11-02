const p=require('puppeteer-core');
(async()=>{
 const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1100,height:900});
 pg.on('pageerror',e=>console.log('ERR',e.message));
 await pg.goto('file:///tmp/claude-0/-home-claude/3d8e8948-9820-51c0-a301-35145c3d24be/scratchpad/ulatek/ulatek-heroic-guide.html');
 await new Promise(r=>setTimeout(r,800));
 const fig=await pg.$('figure[data-scene="p1"]'); await fig.scrollIntoView();
 const pips=await fig.$$('.pips button'); const btns=await fig.$$('.ctrl button'); await btns[1].click();
 const snap=()=>pg.evaluate(()=>[...document.querySelectorAll('figure[data-scene="p1"] .ent')].map(e=>(+e.style.opacity<0.05?'hidden':(e.getAttribute('transform')||'')+'|'+(+e.style.opacity).toFixed(2))).join(';'));
 const seq=[];
 for(let k=0;k<11;k++){ await pips[k].click(); await new Promise(r=>setTimeout(r,1400)); seq.push(await snap()); }
 // random jumps
 let bad=0;
 for(const k of [8,3,10,5,0,9,6,2,7,4,1]){ await pips[k].click(); await new Promise(r=>setTimeout(r,1400)); if((await snap())!==seq[k]){bad++;console.log('MISMATCH at',k);} }
 console.log('mismatches',bad);
 for(const k of [4,5,6,8]){ await pips[k].click(); await new Promise(r=>setTimeout(r,1400)); await (await fig.$('.stage')).screenshot({path:`n-${k}.png`}); }
 await b.close();
})();
