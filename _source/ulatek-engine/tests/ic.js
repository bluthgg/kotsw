const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const pg=await b.newPage();await pg.setViewport({width:900,height:900});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await new Promise(r=>setTimeout(r,800));
console.log('icons',await pg.evaluate(()=>document.querySelectorAll('canvas.sico').length),'errs',errs.join('|'));
const el=await pg.$('dl');await el.scrollIntoView();await el.screenshot({path:'ic.png'});await b.close()})()
