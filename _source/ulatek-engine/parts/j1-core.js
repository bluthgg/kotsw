(function(){
'use strict';
var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var NS = 'http://www.w3.org/2000/svg';
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function svgEl(n,a,p){ var e=document.createElementNS(NS,n); for(var k in a) e.setAttribute(k,a[k]); if(p) p.appendChild(e); return e; }
function htmlEl(n,cls,txt,p){ var e=document.createElement(n); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; if(p) p.appendChild(e); return e; }
function merge(){ var o={}; for(var i=0;i<arguments.length;i++){ var a=arguments[i]; for(var k in a) o[k]=a[k]; } return o; }

/* ---------- roster state ---------- */
var LABEL = {T:'Tank',H:'Healer',M:'Melee',R:'Ranged'};
var ORDER = {M:0,T:1,H:2,R:3};
var GC = {o:'odds',e:'evens'};
function defaults(){ return {heal:5,melee:6,range:7,extra:2,names:{},groups:{},egg:{}}; }
var R = defaults();
var mode = 'local';          /* 'edit' (shared, can write), 'view' (shared, read only), 'local' */
var scenes = [];

function clamp(v,lo,hi){ v=Math.round(Number(v)); if(isNaN(v)) v=lo; return Math.max(lo,Math.min(hi,v)); }
function normalize(d){
  var o=defaults(); d=d||{};
  o.heal=clamp(d.heal!=null?d.heal:o.heal,0,8);
  o.melee=clamp(d.melee!=null?d.melee:o.melee,0,14);
  o.range=clamp(d.range!=null?d.range:o.range,0,14);
  o.extra=clamp(d.extra!=null?d.extra:o.extra,0,o.range);
  ['names','groups'].forEach(function(k){
    var src=d[k]&&typeof d[k]==='object'?d[k]:{};
    for(var id in src){ if(/^[THMR]\d{1,2}$/.test(id)){ var v=src[id];
      if(k==='names'&&typeof v==='string') o.names[id]=v.slice(0,12);
      if(k==='groups'&&(v==='o'||v==='e')) o.groups[id]=v; } }
  });
  if(d.egg&&typeof d.egg==='object'){ ['o','e'].forEach(function(g){ var v=d.egg[g]; if(typeof v==='string'&&/^[HMR]\d{1,2}$/.test(v)) o.egg[g]=v; }); }
  return o;
}
function roster(){
  var a=[];
  function add(role,n){ for(var i=0;i<n;i++){ var id=role+i;
    a.push({id:id,role:role,i:i,n:(R.names[id]||'').trim(),g:R.groups[id]||(role==='T'?(i?'e':'o'):(i%2?'e':'o'))}); } }
  add('T',2); add('H',R.heal); add('M',R.melee); add('R',R.range);
  return a;
}
function disp(p){ return p.n||(LABEL[p.role]+' '+(p.i+1)); }
function byRole(role){ return roster().filter(function(p){ return p.role===role; }); }
function members(g,opts){
  var tanks=!(opts&&opts.noTank);
  return roster().filter(function(p){ return p.g===g&&(tanks||p.role!=='T'); })
    .sort(function(a,b){ return ORDER[a.role]-ORDER[b.role]||a.i-b.i; });
}
function cluster(list,cx,cy,s,colsArg){
  var n=list.length, cols=colsArg||(n>8?4:3), rows=Math.ceil(n/cols), sp=28*s, o={};
  list.forEach(function(p,k){
    var r=Math.floor(k/cols), c=k%cols, rc=(r===rows-1)?(n-r*cols):cols;
    o[p.id]=[cx+(c-(rc-1)/2)*sp, cy+(r-(rows-1)/2)*sp];
  });
  return o;
}
function grp(g,cx,cy,s,opts){
  var list=members(g,opts), n=list.length, rows=Math.ceil(n/(n>8?4:3));
  var o=cluster(list,cx,cy,s);
  o[g+'tag']=[cx,cy-((Math.max(rows,1)-1)/2)*28*s-30];
  return o;
}
function spread(list,x0,y0,x1,y1){
  var n=list.length, o={}; if(!n) return o;
  var cols=Math.max(1,Math.round(Math.sqrt(n*(x1-x0)/(y1-y0)))), rows=Math.ceil(n/cols);
  list.forEach(function(p,k){
    var r=Math.floor(k/cols), c=k%cols, rc=(r===rows-1)?(n-r*cols):cols;
    o[p.id]=[x0+(c+.5)*(x1-x0)/rc, y0+(r+.5)*(y1-y0)/rows];
  });
  return o;
}
function dotEnt(p,cls){
  return {id:p.id,type:'dot',cls:cls,label:p.n?p.n.slice(0,4):p.role,tank:p.role==='T',small:!!p.n,title:disp(p)};
}
function groupEnts(){
  return roster().map(function(p){ return dotEnt(p,GC[p.g]); }).concat([
    {id:'otag',type:'tag',cls:'odds',text:'ODDS'},{id:'etag',type:'tag',cls:'evens',text:'EVENS'}]);
}
function who(c,t,l,list,txt){ return {c:c,t:t,l:l,p:list||[],txt:txt}; }

/* ---------- scene engine ---------- */
function buildEnt(d,layer){
  var g=svgEl('g',{'class':'ent '+d.type+' '+(d.cls||'')},layer);
  if(d.type==='dot'){
    svgEl('circle',{'class':'ring',r:19},g);
    if(d.tank) svgEl('rect',{x:-13,y:-13,width:26,height:26,rx:5},g); else svgEl('circle',{r:13},g);
    var t=svgEl('text',{'class':d.small?'sm':''},g); t.textContent=d.label;
    var ti=svgEl('title',{},g); ti.textContent=d.title||'';
  } else if(d.type==='egg'){
    svgEl('ellipse',{rx:d.big?13:8,ry:d.big?16:10},g);
  } else if(d.type==='warden'){
    svgEl('circle',{r:20},g); var wt=svgEl('text',{},g); wt.textContent='W';
  } else if(d.type==='tag'){
    var tt=svgEl('text',{},g); tt.textContent=d.text;
  }
  return g;
}
function place(e){
  e.g.setAttribute('transform','translate('+e.x.toFixed(1)+' '+e.y.toFixed(1)+')');
  e.g.style.opacity=e.o;
}
function Scene(fig,makeCfg){
  var svg=$('svg',fig), L=$('.layer-lines',svg), E=$('.layer-ents',svg);
  var TOP=svgEl('g',{'class':'layer-top'},svg);
  var cap=htmlEl('div','cap'), capT=htmlEl('h3','cap-t',null,cap), capP=htmlEl('p','cap-p',null,cap);
  var whoBox=htmlEl('div','who');
  var ctrl=htmlEl('div','ctrl');
  var bPrev=htmlEl('button',null,'Prev',ctrl), bPlay=htmlEl('button',null,'Pause',ctrl), bNext=htmlEl('button',null,'Next',ctrl);
  var pipsBox=htmlEl('div','pips',null,ctrl);
  fig.appendChild(cap); fig.appendChild(whoBox); fig.appendChild(ctrl);
  var cfg, ents, cur=0, raf=0, timer=0, lines=[], visible=false, userPaused=false, pips=[];

  function drawLines(){
    lines.forEach(function(l){
      var a=Array.isArray(l.a)?l.a:(ents[l.a]?[ents[l.a].x,ents[l.a].y]:[0,0]);
      var b=Array.isArray(l.b)?l.b:(ents[l.b]?[ents[l.b].x,ents[l.b].y]:[0,0]);
      l.el.setAttribute('x1',a[0]); l.el.setAttribute('y1',a[1]);
      l.el.setAttribute('x2',b[0]); l.el.setAttribute('y2',b[1]);
    });
  }
  function renderWho(st){
    whoBox.textContent='';
    (st.who||[]).forEach(function(w){
      var row=htmlEl('div',null,null,whoBox);
      htmlEl('span','chip c-'+w.c,w.t,row);
      var s=htmlEl('span','nm',null,row);
      htmlEl('b',null,w.l+(w.l&&(w.txt||w.p.length)?': ':''),s);
      if(w.txt){ htmlEl('em',null,w.txt,s); }
      else if(w.p.length){ htmlEl('em',null,w.p.map(disp).join(', '),s); }
    });
  }
  function go(i,instant){
    cur=i; var st=cfg.steps[i], res={};
    for(var k0=0;k0<=i;k0++){ var pp=cfg.steps[k0].pos; for(var q in pp) res[q]=pp[q]; }
    for(var id in ents){
      var e=ents[id], p=res[id];
      if(p===null||p===undefined){ e.to=0; }
      else if(Array.isArray(p)){ e.tx=p[0]; e.ty=p[1]; e.to=1; if(e.o===0){ e.x=p[0]; e.y=p[1]; } }
    }
    for(var id2 in ents){
      var v=res[id2];
      if(typeof v==='string'&&v.indexOf('at:')===0&&ents[v.slice(3)]){
        var c=ents[v.slice(3)], q2=ents[id2];
        q2.tx=c.tx+8; q2.ty=c.ty-11; q2.to=1; if(q2.o===0){ q2.x=q2.tx; q2.y=q2.ty; }
      }
    }
    for(var id in ents){
      var e=ents[id];
      e.sx=e.x; e.sy=e.y; e.so=e.o;
      if(st.flag&&st.flag[id]) e.g.setAttribute('data-flag',st.flag[id]); else e.g.removeAttribute('data-flag');
    }
    $$('[data-on]',svg).forEach(function(n){ n.classList.toggle('on',n.getAttribute('data-on').split(' ').indexOf(String(i))>-1); });
    L.textContent='';
    lines=(st.lines||[]).map(function(l){ return {a:l[0],b:l[1],el:svgEl('line',{'class':'tether '+(l[2]||'')},L)}; });
    capT.textContent=st.t; capP.textContent=st.p; renderWho(st);
    pips.forEach(function(b,k){ b.setAttribute('aria-current',k===i?'true':'false'); });
    cancelAnimationFrame(raf);
    var dur=(instant||RM)?0:1000, t0=performance.now();
    function frame(now){
      var k=dur?Math.min(1,(now-t0)/dur):1, s=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      for(var id in ents){ var e=ents[id];
        e.x=e.sx+(e.tx-e.sx)*s; e.y=e.sy+(e.ty-e.sy)*s; e.o=e.so+(e.to-e.so)*s; place(e); }
      drawLines();
      if(k<1) raf=requestAnimationFrame(frame);
    }
    if(dur) raf=requestAnimationFrame(frame); else frame(t0+1);
  }
  function build(keep){
    cfg=makeCfg(); E.textContent=''; TOP.textContent=''; ents={};
    cfg.ents.forEach(function(d){
      var e={g:buildEnt(d,d.type==='egg'?TOP:E),x:0,y:0,o:0,tx:0,ty:0,to:0,sx:0,sy:0,so:0}; ents[d.id]=e; place(e); });
    if(!pips.length){
      cfg.steps.forEach(function(s,k){
        var b=htmlEl('button',null,String(k+1),pipsBox); b.setAttribute('aria-label','Step '+(k+1)+': '+s.t);
        b.addEventListener('click',function(){ userPaused=true; sync(); go(k); });
        pips.push(b);
      });
    }
    go(keep?Math.min(cur,cfg.steps.length-1):0,true);
  }
  function paused(){ return userPaused||RM; }
  function sync(now){
    bPlay.textContent=paused()?'Play':'Pause';
    clearTimeout(timer);
    if(paused()||!(visible||now)) return;
    var tick=function(){ go((cur+1)%cfg.steps.length); timer=setTimeout(tick,cfg.hold||5200); };
    if(now) tick(); else timer=setTimeout(tick,cfg.hold||5200);
  }
  bPrev.addEventListener('click',function(){ userPaused=true; sync(); go((cur-1+cfg.steps.length)%cfg.steps.length); });
  bNext.addEventListener('click',function(){ userPaused=true; sync(); go((cur+1)%cfg.steps.length); });
  bPlay.addEventListener('click',function(){ userPaused=!userPaused; sync(!userPaused); });
  if(RM) bPlay.hidden=true;
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ var v=es[0].isIntersecting; if(v===visible) return; visible=v; sync(); },{threshold:.1}).observe(fig);
  } else { visible=true; }
  build(false); sync();
  return {rebuild:function(){ build(true); }};
}
