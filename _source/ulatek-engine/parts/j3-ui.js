/* ---------- roster UI ---------- */
var rnote=$('#rnote'), counts=$('#counts'), rgrid=$('#rgrid'), rsum=$('#rsum');
mode='wait';
var NOTES={
  edit:'Saved for everyone with the link. Only editors can change it.',
  view:"Set by your raid leader. You can't edit it here, but the diagrams use it.",
  local:'Saved on this device only. It is not shared with other people.',
  wait:'Loading the roster...'
};
function setNote(){ rnote.textContent=NOTES[mode]||''; }
function editable(){ return mode==='edit'||mode==='local'; }
function refresh(){ scenes.forEach(function(s){ s.rebuild(); }); }

function stepper(key,label,lo,hi){
  var d=htmlEl('div','stp',null,counts);
  htmlEl('label',null,label,d);
  var minus=htmlEl('button',null,'−',d), out=htmlEl('output',null,String(R[key]),d), plus=htmlEl('button',null,'+',d);
  minus.setAttribute('aria-label','Fewer '+label); plus.setAttribute('aria-label','More '+label);
  minus.disabled=!editable()||R[key]<=lo; plus.disabled=!editable()||R[key]>=hi;
  function bump(n){ return function(){
    R[key]=clamp(R[key]+n,lo,hi); if(key==='range') R.extra=Math.min(R.extra,R.range);
    renderRoster(); refresh(); save(); }; }
  minus.addEventListener('click',bump(-1)); plus.addEventListener('click',bump(1));
}
function renderRoster(){
  counts.textContent='';
  stepper('heal','Healers',0,8); stepper('melee','Melee',0,14); stepper('range','Ranged',0,14);
  stepper('extra','Extra ranged on healer soak',0,R.range);
  var t=htmlEl('div','stp fixed',null,counts); htmlEl('label',null,'Tanks',t); htmlEl('output',null,'2',t);

  var ed=editable(), rs=roster();
  rgrid.textContent='';
  [['T','Tanks'],['H','Healers'],['M','Melee'],['R','Ranged']].forEach(function(c){
    var list=rs.filter(function(p){ return p.role===c[0]; });
    if(!list.length) return;
    var col=htmlEl('div','rcol t-'+c[0],null,rgrid), h=htmlEl('h3',null,c[1],col);
    if(c[0]==='R'&&R.extra>0) h.textContent='Ranged (last '+Math.min(R.extra,list.length)+' join healers)';
    list.forEach(function(p){
      var row=htmlEl('div','prow',null,col);
      var inp=htmlEl('input',null,null,row); inp.type='text'; inp.id='nm-'+p.id; inp.maxLength=12;
      inp.placeholder=LABEL[p.role]+' '+(p.i+1); inp.value=R.names[p.id]||''; inp.disabled=!ed;
      inp.setAttribute('aria-label',LABEL[p.role]+' '+(p.i+1)+' name'); inp.autocomplete='off';
      if(p.role!=='T'){
        row.className+=' hasegg';
        var eb=htmlEl('button','ebtn',null,row); eb.type='button'; eb.setAttribute('data-egg',p.id); eb.disabled=!ed;
        var on=R.egg&&R.egg[p.g]===p.id; eb.setAttribute('aria-pressed',on?'true':'false');
        eb.setAttribute('aria-label',on?(disp(p)+' carries the big egg for '+(p.g==='o'?'Odds':'Evens')+'. Tap to clear.'):('Make '+disp(p)+' the big egg carrier for '+(p.g==='o'?'Odds':'Evens')));
        eb.title='Big egg carrier (Phase 2)';
        var sv=svgEl('svg',{viewBox:'0 0 20 20','aria-hidden':'true'},eb); svgEl('ellipse',{cx:10,cy:11,rx:5.6,ry:7.2},sv);
      }
      var b=htmlEl('button','gbtn '+p.g,p.g==='o'?'Odds':'Evens',row); b.type='button'; b.setAttribute('data-id',p.id);
      b.disabled=!ed; b.setAttribute('aria-label',disp(p)+' is in '+(p.g==='o'?'Odds':'Evens')+'. Tap to switch.');
    });
  });
  var no=rs.filter(function(p){ return p.g==='o'; }).length, ne=rs.length-no;
  rsum.textContent='';
  htmlEl('b','o','Odds '+no,rsum); rsum.appendChild(document.createTextNode('  ·  '));
  htmlEl('b','e','Evens '+ne,rsum); rsum.appendChild(document.createTextNode('  ·  Total '+rs.length));
  if(Math.abs(no-ne)>1) rsum.appendChild(document.createTextNode('. The groups are uneven, so move someone across.'));
}
rgrid.addEventListener('click',function(ev){
  var eb=ev.target.closest&&ev.target.closest('.ebtn');
  if(eb){ if(eb.disabled) return;
    var eid=eb.getAttribute('data-egg'), ep=roster().filter(function(x){ return x.id===eid; })[0]; if(!ep) return;
    if(!R.egg) R.egg={};
    if(R.egg[ep.g]===eid) delete R.egg[ep.g]; else R.egg[ep.g]=eid;
    renderRoster(); refresh(); save(); return; }
  var b=ev.target.closest&&ev.target.closest('.gbtn'); if(!b||b.disabled) return;
  var id=b.getAttribute('data-id'), p=roster().filter(function(x){ return x.id===id; })[0];
  if(R.egg&&R.egg[p.g]===id) delete R.egg[p.g];
  R.groups[id]=p.g==='o'?'e':'o';
  renderRoster(); refresh(); save();
});
var nameT=0;
rgrid.addEventListener('input',function(ev){
  var t=ev.target; if(!t||!t.id||t.id.indexOf('nm-')!==0) return;
  R.names[t.id.slice(3)]=t.value;
  clearTimeout(nameT); nameT=setTimeout(function(){ refresh(); save(); },350);
});

/* ---------- persistence ---------- */
var ref=null, saveT=0, inflight=false, dirty=false;
function payload(){
  var n={}; for(var k in R.names){ if(R.names[k]&&R.names[k].trim()) n[k]=R.names[k].trim(); }
  var rs=roster(), egg={};
  ['o','e'].forEach(function(g){ var id=R.egg&&R.egg[g]; if(id&&rs.some(function(p){ return p.id===id&&p.g===g&&p.role!=='T'; })) egg[g]=id; });
  return {heal:R.heal,melee:R.melee,range:R.range,extra:R.extra,names:n,groups:R.groups,egg:egg};
}
function save(){
  clearTimeout(saveT); saveT=setTimeout(doSave,700);
}
function doSave(){
  if(mode==='local'){ try{ localStorage.setItem('ulatek-roster',JSON.stringify(payload())); }catch(e){} return; }
  if(mode!=='edit'||!ref) return;
  if(inflight){ dirty=true; return; }
  inflight=true; dirty=false;
  ref.set(payload()).then(function(){ inflight=false; if(dirty) doSave(); })
    .catch(function(e){ inflight=false; if(e&&e.code==='invalid_argument'){ mode='view'; setNote(); renderRoster(); } });
}
function applyRemote(d){
  var n=normalize(d);
  if(JSON.stringify(n)===JSON.stringify(payload2(R))) return;
  if(document.activeElement&&rgrid.contains(document.activeElement)&&mode==='edit') return;
  R=n; renderRoster(); refresh();
}
function payload2(r){ var o=normalize(r); return o; }
function goLocal(){
  mode='local';
  try{ var s=localStorage.getItem('ulatek-roster'); if(s) R=normalize(JSON.parse(s)); }catch(e){}
  setNote(); renderRoster(); refresh();
}
function initShared(){
  var c=window.claude;
  if(!c||!c.use){ goLocal(); return; }
  Promise.all([c.use('db').catch(function(){ return null; }),c.use('user').catch(function(){ return null; })]).then(function(r){
    var db=r[0], user=r[1];
    if(!db){ goLocal(); return; }
    var can=false; try{ can=!!(user&&user.canEdit&&user.canEdit()); }catch(e){}
    mode=can?'edit':'view'; setNote(); renderRoster();
    ref=db.doc('roster/main');
    var t=setTimeout(function(){ rnote.textContent="Can't reach the shared roster yet. Showing the default raid."; },10000);
    ref.onSnapshot(function(snap){
      if(!snap.metadata.fromCache){ clearTimeout(t); setNote(); }
      if(snap.exists&&!snap.metadata.hasPendingWrites) applyRemote(snap.data());
    },function(){ clearTimeout(t); });
  }).catch(function(){ goLocal(); });
}

/* ---------- group picker ---------- */
(function(){
  var saved='both'; try{ saved=localStorage.getItem('ulatek-me')||'both'; }catch(e){}
  if(['both','odds','evens'].indexOf(saved)<0) saved='both';
  document.body.setAttribute('data-me',saved);
  $$('input[name="me"]').forEach(function(r){
    r.checked=(r.value===saved);
    r.addEventListener('change',function(){
      document.body.setAttribute('data-me',r.value);
      try{ localStorage.setItem('ulatek-me',r.value); }catch(e){}
    });
  });
})();

/* ---------- start ---------- */
var makers={p1:cfgP1,p2:cfgP2,'int':cfgInt,p3:cfgP3};
setNote(); renderRoster();
scenes=$$('.scene').map(function(f){ return Scene(f,makers[f.getAttribute('data-scene')]); });
(function(){
  var f=$('.scene[data-scene="p2"]'), i=$$('.scene').indexOf(f);
  if(f&&i>-1){
    var b=htmlEl('button',null,'Re-roll tethers',$('.ctrl',f));
    b.setAttribute('title','Pick 3 random players per side for the tethers');
    b.addEventListener('click',function(){ rerollTethers(); scenes[i].rebuild(); });
  }
})();

/* ---------- share link ---------- */
function encodeRoster(){
  var rs=roster(), g='', nm=[];
  rs.forEach(function(p){ g+=p.g; nm.push(encodeURIComponent(p.n)); });
  var eg=payload().egg, str=[R.heal,R.melee,R.range,R.extra].join('.')+'|'+g+'|'+nm.join('|')+'|'+(eg.o||'')+'|'+(eg.e||'');
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decodeRoster(code){
  try{
    code=String(code).trim(); var m=/r=([A-Za-z0-9_-]+)/.exec(code); if(m) code=m[1];
    var b=code.replace(/-/g,'+').replace(/_/g,'/'); while(b.length%4) b+='=';
    var parts=decodeURIComponent(escape(atob(b))).split('|');
    var c=parts[0].split('.').map(Number); if(c.length!==4||c.some(isNaN)) return null;
    var o={heal:c[0],melee:c[1],range:c[2],extra:c[3],names:{},groups:{},egg:{}};
    var ids=['T0','T1']; ['H','M','R'].forEach(function(r,k){ var n=clamp(c[k],0,k===0?8:14); for(var i=0;i<n;i++) ids.push(r+i); });
    ids.forEach(function(id,i){
      var gch=(parts[1]||'').charAt(i); if(gch==='o'||gch==='e') o.groups[id]=gch;
      var nmv=parts[2+i]; if(nmv) o.names[id]=decodeURIComponent(nmv);
    });
    var eo=parts[2+ids.length], ee=parts[3+ids.length]; if(eo) o.egg.o=eo; if(ee) o.egg.e=ee;
    return normalize(o);
  }catch(e){ return null; }
}
var shareBox=htmlEl('div','rshare',null,$('#roster'));
var sInp,sMsg;
(function(){
  var row=htmlEl('div','rs-row',null,shareBox);
  var bc=htmlEl('button',null,'Copy share link',row); bc.type='button';
  var bi=htmlEl('button',null,'Import link or code',row); bi.type='button';
  var br=htmlEl('button',null,'Reset roster',row); br.type='button'; var brT=0;
  sInp=htmlEl('input',null,null,shareBox); sInp.type='text'; sInp.setAttribute('aria-label','Share link or code'); sInp.placeholder='Share link or code appears here. Paste one here to import.'; sInp.autocomplete='off';
  sMsg=htmlEl('p','rs-msg',null,shareBox); sMsg.setAttribute('role','status');
  bc.addEventListener('click',function(){
    var link=location.href.split('#')[0]+'#r='+encodeRoster();
    sInp.value=link; sInp.focus(); sInp.select();
    var done=function(ok){ sMsg.textContent=ok?'Link copied. Send it to your raid. On this guide\'s own website it loads your roster.':'Link ready. Copy it from the box.'; };
    try{ navigator.clipboard.writeText(link).then(function(){ done(true); },function(){ done(false); }); }catch(e){ done(false); }
  });
  bi.addEventListener('click',function(){
    var d=decodeRoster(sInp.value);
    if(!d){ sMsg.textContent='That does not look like a roster link or code.'; return; }
    if(!editable()){ sMsg.textContent='The raid leader controls the roster here, so it cannot be replaced.'; return; }
    R=d; renderRoster(); refresh(); save(); sMsg.textContent='Roster imported.';
  });
  br.addEventListener('click',function(){
    if(!editable()){ sMsg.textContent='The raid leader controls the roster here, so it cannot be reset.'; return; }
    if(!brT){
      br.textContent='Tap again to confirm'; br.classList.add('arm');
      brT=setTimeout(function(){ brT=0; br.textContent='Reset roster'; br.classList.remove('arm'); },4000);
      return;
    }
    clearTimeout(brT); brT=0; br.textContent='Reset roster'; br.classList.remove('arm');
    R=defaults(); renderRoster(); refresh(); save(); sInp.value='';
    try{ if(/^#r=/.test(location.hash||'')) history.replaceState(null,'',location.href.split('#')[0]); }catch(e){}
    sMsg.textContent='Roster reset to the default raid.';
  });
})();
function fromHash(){
  var m=/^#r=([A-Za-z0-9_-]+)$/.exec(location.hash||''); if(!m) return false;
  var d=decodeRoster(m[1]); if(!d) return false;
  mode='local'; R=d; setNote(); renderRoster(); refresh(); return true;
}
if(!fromHash()) initShared();
window.addEventListener('hashchange',fromHash);
})();

(function(){
  var b=document.querySelector('.foot a.up'); if(!b) return;
  b.addEventListener('click',function(e){
    e.preventDefault();
    var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    try{ window.scrollTo({top:0,behavior:r?'auto':'smooth'}); }catch(x){ window.scrollTo(0,0); }
  });
})();
