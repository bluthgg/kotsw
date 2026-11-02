const p=require('puppeteer-core');(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const pg=await b.newPage();await pg.setViewport({width:1000,height:700});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await new Promise(r=>setTimeout(r,600));
console.log(await pg.evaluate(()=>[document.characterSet,document.querySelector('#rsum').textContent,document.compatMode,getComputedStyle(document.body).backgroundColor]),errs.join('|'));
await pg.screenshot({path:'st.png'});await b.close()})()
