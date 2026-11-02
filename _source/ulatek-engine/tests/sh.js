const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const url='file://'+process.argv[2];
const pg=await b.newPage();await pg.setViewport({width:1000,height:900});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(url);await new Promise(r=>setTimeout(r,500));
await pg.evaluate(()=>{const ins=[...document.querySelectorAll('#rgrid input')];const nm=['Arthas','Jaina','Thrall','Sylvanas','Illidan','Tyrande','Malfurion','Khadgar','Anduin','Uther','Garrosh','Velen'];ins.forEach((i,k)=>{i.value=nm[k%nm.length]+k;i.dispatchEvent(new Event('input',{bubbles:true}))});});
await new Promise(r=>setTimeout(r,700));
await pg.evaluate(()=>[...document.querySelectorAll('#rgrid .gbtn')][3].click());
await pg.evaluate(()=>[...document.querySelectorAll('.rshare button')][0].click());
const link=await pg.evaluate(()=>document.querySelector('.rshare input').value);
console.log('link length',link.length, link.slice(-60));
const pg2=await b.newPage();await pg2.setViewport({width:1000,height:900});pg2.on('pageerror',e=>errs.push(e.message));
await pg2.goto(link);await new Promise(r=>setTimeout(r,600));
const same=await pg2.evaluate(()=>({n:[...document.querySelectorAll('#rgrid input')].map(i=>i.value).slice(0,6),g:[...document.querySelectorAll('#rgrid .gbtn')].map(x=>x.textContent).slice(0,6),sum:document.querySelector('#rsum').textContent,note:document.querySelector('#rnote').textContent}));
console.log(JSON.stringify(same));
const orig=await pg.evaluate(()=>({n:[...document.querySelectorAll('#rgrid input')].map(i=>i.value).slice(0,6),g:[...document.querySelectorAll('#rgrid .gbtn')].map(x=>x.textContent).slice(0,6)}));
console.log(JSON.stringify(orig));
// import path
const pg3=await b.newPage();await pg3.goto(url);await new Promise(r=>setTimeout(r,500));
await pg3.evaluate((l)=>{const i=document.querySelector('.rshare input');i.value=l;[...document.querySelectorAll('.rshare button')][1].click();},link);
console.log('import',await pg3.evaluate(()=>[document.querySelector('.rs-msg').textContent,document.querySelector('#rgrid input').value]));
console.log('bad',await pg3.evaluate(()=>{document.querySelector('.rshare input').value='zzz';[...document.querySelectorAll('.rshare button')][1].click();return document.querySelector('.rs-msg').textContent}));
await pg.evaluate(()=>document.querySelector('.rshare').scrollIntoView({block:'center'}));await pg.screenshot({path:'sh.png'});
console.log('errs',errs.join('|'));await b.close()})()
